import json
import traceback

try:
    with open('expert_activation_patterns.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print('JSON文件语法正确')
    print(f'加载了 {len(data)} 个专家的数据')
except Exception as e:
    print(f'JSON错误: {e}')
    traceback.print_exc()