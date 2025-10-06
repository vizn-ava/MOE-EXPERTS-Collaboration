#!/usr/bin/env python3
import random

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

def l1_normalize(vector):
    s = sum(abs(float(x)) for x in vector) if vector else 0.0
    if s == 0:
        return [float(x) for x in vector]
    return [float(x) / s for x in vector]

# 测试函数
def test_sparse_generation():
    print("=== 测试稀疏向量生成函数 ===")
    
    # 生成向量
    vec = generate_sparse_vector(1728, 8)
    print(f"原始向量长度: {len(vec)}")
    
    # 检查稀疏性
    blocks = len(vec) // 64
    total_non_zero = 0
    
    for block in range(min(3, blocks)):  # 检查前3个块
        start_pos = block * 64
        end_pos = min(start_pos + 64, len(vec))
        block_vector = vec[start_pos:end_pos]
        non_zero_count = sum(1 for x in block_vector if x != 0.0)
        total_non_zero += non_zero_count
        print(f"块 {block}: {non_zero_count} 个非零元素")
    
    print(f"前3个块总非零元素: {total_non_zero}")
    
    # 测试归一化
    print("\n=== 测试归一化 ===")
    normalized_vec = l1_normalize(vec)
    
    # 检查归一化后的稀疏性
    total_non_zero_norm = 0
    for block in range(min(3, blocks)):
        start_pos = block * 64
        end_pos = min(start_pos + 64, len(normalized_vec))
        block_vector = normalized_vec[start_pos:end_pos]
        non_zero_count = sum(1 for x in block_vector if x != 0.0)
        total_non_zero_norm += non_zero_count
        print(f"归一化后块 {block}: {non_zero_count} 个非零元素")
    
    print(f"归一化后前3个块总非零元素: {total_non_zero_norm}")

if __name__ == "__main__":
    test_sparse_generation()
