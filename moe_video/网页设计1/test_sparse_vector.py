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

# 测试1728维向量，每64维中8个位置有数据
def test_sparse_vector():
    dimensions = 1728
    active_count = 8
    vector = generate_sparse_vector(dimensions, active_count)
    
    print(f"向量总维度: {dimensions}")
    print(f"每64维中激活位置数: {active_count}")
    print(f"总块数: {dimensions // 64}")
    
    # 检查每个64维块中的非零元素数量
    blocks = dimensions // 64
    for block in range(min(3, blocks)):  # 只检查前3个块
        start_pos = block * 64
        end_pos = min(start_pos + 64, dimensions)
        block_vector = vector[start_pos:end_pos]
        non_zero_count = sum(1 for x in block_vector if x != 0.0)
        print(f"块 {block} (位置 {start_pos}-{end_pos-1}): {non_zero_count} 个非零元素")
        
        # 显示前10个元素
        print(f"  前10个元素: {block_vector[:10]}")
    
    # 统计总的非零元素数量
    total_non_zero = sum(1 for x in vector if x != 0.0)
    expected_non_zero = blocks * active_count
    print(f"总非零元素数: {total_non_zero} (期望: {expected_non_zero})")

if __name__ == "__main__":
    test_sparse_vector()
