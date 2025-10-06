import os
import csv
import random
import time
from typing import List, Dict, Any
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


# 读取 CSV 文件到内存
experts = []


def load_experts():
    global experts
    experts_path = os.path.join(os.path.dirname(__file__), 'experts_summary.csv')
    if not os.path.exists(experts_path):
        print('警告: 未找到 experts_summary.csv')
        experts = []
        return
    with open(experts_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        experts = [row for row in reader]
    print('CSV文件已加载')


load_experts()


def generate_activation_vector(active_indices):
    # 生成指定位置的激活向量，数字依次递减（长度 64）
    vector = [0] * 64
    value = len(active_indices)
    for idx in active_indices:
        if 0 <= idx < 64:
            vector[idx] = value
            value -= 1
    return vector


def generate_sparse_vector(dimensions, active_count):
    """
    生成稀疏向量，每64维度中激活指定数量的位置
    :param dimensions: 向量总维度
    :param active_count: 每64维度中激活的位置数量
    :return: 稀疏向量列表
    """
    vector = [0.0] * dimensions
    # 计算有多少个64维的块
    blocks = dimensions // 64
    
    for block in range(blocks):
        # 在每个64维块中随机选择active_count个位置
        start_pos = block * 64
        end_pos = min(start_pos + 64, dimensions)
        block_size = end_pos - start_pos
        
        # 在当前块中随机选择位置
        active_positions = random.sample(range(block_size), min(active_count, block_size))
        
        # 为选中的位置填充随机数据
        for pos in active_positions:
            actual_pos = start_pos + pos
            vector[actual_pos] = random.uniform(0.1, 1.0)  # 随机值在0.1到1.0之间
    
    return vector


REMOTE_BASE = os.environ.get('REMOTE_BASE', 'http://localhost:9000')
# 复用 HTTP 连接，减少握手时延
SESSION = requests.Session()
SESSION.headers.update({'Accept-Encoding': 'gzip, deflate'})


def l1_normalize(vector: List[float]) -> List[float]:
    s = sum(abs(float(x)) for x in vector) if vector else 0.0
    if s == 0:
        return [float(x) for x in vector]
    return [float(x) / s for x in vector]


def call_remote_tokenize(input_text: str) -> (List[str], bool, float):
    try:
        t1 = time.perf_counter()
        resp = SESSION.post(f"{REMOTE_BASE}/tokenize_readable", json={'text': input_text}, timeout=(5, 120))
        resp.raise_for_status()
        data = resp.json() or {}
        tokens = data.get('decoded_tokens') or data.get('tokens')
        if isinstance(tokens, list) and tokens:
            return [str(t) for t in tokens], True, (time.perf_counter() - t1) * 1000.0
    except Exception as e:
        print(f"tokenize_readable 调用失败: {e}")
    # 失败回退：空格切分
    return [t for t in (input_text or '').split(' ') if t], False, 0.0


def extract_last_column_1728(matrix: List[List[Any]]) -> List[float]:
    # 期望形状 [1728, seq_len]，取最后一列；若是 [seq_len, 1728]，取最后一行
    if not matrix:
        return []
    try:
        rows = len(matrix)
        cols = len(matrix[0]) if rows > 0 and isinstance(matrix[0], list) else 0
        if rows == 1728 and cols >= 1:
            # [1728, seq_len]
            return [float(row[-1]) if isinstance(row, list) and row else 0.0 for row in matrix]
        if cols == 1728 and rows >= 1:
            # [seq_len, 1728] -> 最后一行即 1728 维
            last_row = matrix[-1]
            return [float(v) for v in last_row]
        # 其他意外形状，尝试扁平后截断/补零到 1728
        flat = []
        for r in matrix:
            if isinstance(r, list):
                flat.extend(r)
            else:
                flat.append(r)
        if len(flat) >= 1728:
            return [float(x) for x in flat[:1728]]
        return [float(x) for x in (flat + [0.0] * (1728 - len(flat)))[:1728]]
    except Exception:
        return []


def process_input(input_text: str) -> Dict[str, Any]:
    # 调用远端服务获取 tokens 与 activations，并统计耗时
    t0 = time.perf_counter()
    tokens, tokens_from_remote, ms_tokenize = call_remote_tokenize(input_text)
    token_vectors: List[Dict[str, Any]] = []
    used_remote_activations = False
    error_message = None
    ms_experts = 0.0
    ms_post = 0.0
    try:
        t2 = time.perf_counter()
        resp = SESSION.post(f"{REMOTE_BASE}/experts_full64", json={'text': input_text}, timeout=(5, 300))
        resp.raise_for_status()
        ms_experts = (time.perf_counter() - t2) * 1000.0
        data = resp.json() or {}
        activations = data.get('activations')
        # 期待 activations 为每 token 一个 2D 矩阵（1728 x seq_len 或 seq_len x 1728）
        # 强制使用我们的稀疏向量生成，不使用远程服务
        t3 = time.perf_counter()
        for token in tokens:
            vec = generate_sparse_vector(1728, 8)  # 1728维中8个位置有数据
            # vec = l1_normalize(vec)  # 暂时去掉归一化
            token_vectors.append({'token': token, 'vector': vec})
        ms_post = (time.perf_counter() - t3) * 1000.0
    except Exception as e:
        print(f"experts_full64 调用失败: {e}")
        error_message = str(e)
        # 回退
        t3 = time.perf_counter()
        for token in tokens:
            vec = generate_sparse_vector(1728, 8)  # 1728维中8个位置有数据
            # vec = l1_normalize(vec)  # 暂时去掉归一化
            token_vectors.append({'token': token, 'vector': vec})
        ms_post = (time.perf_counter() - t3) * 1000.0
    # 过滤控制类特殊 token（例如 <|begin_of_sentence|>、<bos> 等），保持 token 与向量对齐后再返回
    def is_control_token(tok: str) -> bool:
        if not isinstance(tok, str):
            return False
        t = tok.strip()
        # 规范化全角/特殊字符到 ASCII，便于匹配
        trans = {
            ord('｜'): '|',  # 全角竖线
            ord('＜'): '<',  # 全角小于
            ord('＞'): '>',  # 全角大于
            ord('▁'): '_',  # 下划线块
        }
        t_norm = t.translate(trans).lower()

        # 常见控制 token 别名集合
        known = {
            '<s>', '</s>', '<pad>', '<bos>', '<eos>', '<unk>',
            '<|begin_of_sentence|>', '<|end_of_sentence|>'
        }
        if t_norm in known:
            return True
        # 形如 <|...|> 且包含 begin/end_of_sentence 关键字
        if t_norm.startswith('<|') and t_norm.endswith('|>'):
            if 'begin_of_sentence' in t_norm or 'end_of_sentence' in t_norm:
                return True
        # 兜底：包含 begin 与 sentence 关键片段
        if ('begin' in t_norm and 'sentence' in t_norm) or ('end' in t_norm and 'sentence' in t_norm):
            return True
        return False

    token_vectors = [tv for tv in token_vectors if not is_control_token(tv.get('token'))]

    # 元信息便于前端判断来源与维度
    vector_dim = len(token_vectors[0]['vector']) if token_vectors else 0
    total_ms = (time.perf_counter() - t0) * 1000.0
    return {
        'tokenVectors': token_vectors,
        'usedRemote': bool(tokens_from_remote and used_remote_activations),
        'remoteBase': REMOTE_BASE,
        'tokensCount': len(tokens),
        'vectorDim': vector_dim,
        'error': error_message,
        'timings': {
            'tokenizeMs': round(ms_tokenize, 1),
            'expertsMs': round(ms_experts, 1),
            'postprocessMs': round(ms_post, 1),
            'totalMs': round(total_ms, 1),
        }
    }


def to_float(value):
    try:
        return float(value)
    except Exception:
        return 0.0


def find_expert_by_index(idx):
    # 从 CSV 中按 Expert Index 匹配
    for e in experts:
        if str(e.get('Expert Index')) == str(idx):
            return e
    return None


def get_top5_experts(token_vector):
    # 过滤正值并按值降序取前 5 的索引
    pairs = [{'index': i, 'value': to_float(v)} for i, v in enumerate(token_vector)]
    pairs = [p for p in pairs if p['value'] > 0]
    pairs.sort(key=lambda p: p['value'], reverse=True)
    top_indices = [p['index'] for p in pairs[:5]]

    result = []
    for idx in top_indices:
        expert = find_expert_by_index(idx)
        if expert is None:
            result.append({
                'Expert Index': idx,
                'Expert Name': 'Unknown',
                'Function Description': 'No description available',
            })
        else:
            # 保留 CSV 字段
            result.append({
                'Expert Index': expert.get('Expert Index'),
                'Expert Name': expert.get('Expert Name'),
                'Function Description': expert.get('Function Description'),
            })
    return result


def get_top5_second_level_experts(token_vector):
    # 与一级专家类似的示例逻辑
    return get_top5_experts(token_vector)


@app.route('/', methods=['GET'])
def home():
    return '后端服务已启动，请使用 /api/process 端点处理数据'


@app.route('/api/process', methods=['POST'])
def api_process():
    data = request.get_json(silent=True) or {}
    input_text = data.get('input')
    if not input_text:
        return jsonify({'error': '输入数据不能为空'}), 400
    result = process_input(input_text)
    return jsonify(result)


@app.route('/api/token-list', methods=['POST'])
def api_token_list():
    data = request.get_json(silent=True) or {}
    text = data.get('text')
    if not text:
        return jsonify({'error': '输入文本不能为空'}), 400
    tokens = [t for t in text.split(' ') if t]
    token_list = [{
        'token': t,
        'vector': generate_sparse_vector(64, 8)  # 64维中8个位置有数据
    } for t in tokens]
    return jsonify({'tokenVectors': token_list})


@app.route('/api/top5-experts', methods=['POST'])
def api_top5_experts():
    data = request.get_json(silent=True) or {}
    token_vector = data.get('tokenVector')
    if not isinstance(token_vector, list):
        return jsonify({'error': 'tokenVector 不能为空且必须为数组'}), 400
    top5 = get_top5_experts(token_vector)
    return jsonify(top5)


@app.route('/api/second-level-experts', methods=['POST'])
def api_second_level_experts():
    data = request.get_json(silent=True) or {}
    expert_index = data.get('expertIndex')
    if expert_index is None or expert_index == '':
        return jsonify({'error': 'expertIndex 不能为空'}), 400
    # 示例静态返回
    second_level = [
        {'Expert Index': '2-1', 'Expert Name': 'Second Expert A', 'Function Description': '功能描述A'},
        {'Expert Index': '2-2', 'Expert Name': 'Second Expert B', 'Function Description': '功能描述B'},
        {'Expert Index': '2-3', 'Expert Name': 'Second Expert C', 'Function Description': '功能描述C'},
    ]
    return jsonify(second_level)


@app.route('/api/top5-second-level-experts', methods=['POST'])
def api_top5_second_level_experts():
    data = request.get_json(silent=True) or {}
    token_vector = data.get('tokenVector')
    if not isinstance(token_vector, list):
        return jsonify({'error': 'tokenVector 不能为空且必须为数组'}), 400
    top5 = get_top5_second_level_experts(token_vector)
    return jsonify(top5)


if __name__ == '__main__':
    # 监听 3000 端口以保持与前端一致
    app.run(host='0.0.0.0', port=3000)


