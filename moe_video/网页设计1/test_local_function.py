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

def test_sparse_function():
    """测试稀疏向量生成函数"""
    print("=== 测试稀疏向量生成函数 ===")
    
    # 生成1728维向量，每64维中8个位置有数据
    vec = generate_sparse_vector(1728, 8)
    
    print(f"向量长度: {len(vec)}")
    print(f"总块数: {len(vec) // 64}")
    
    # 检查前3个块
    for block in range(3):
        start_pos = block * 64
        end_pos = start_pos + 64
        block_vector = vec[start_pos:end_pos]
        
        non_zero_count = sum(1 for x in block_vector if x != 0.0)
        zero_count = sum(1 for x in block_vector if x == 0.0)
        
        print(f"块 {block} (位置 {start_pos}-{end_pos-1}):")
        print(f"  非零元素: {non_zero_count} 个")
        print(f"  零元素: {zero_count} 个")
        print(f"  前10个元素: {[f'{x:.6f}' for x in block_vector[:10]]}")
        
        # 显示非零元素的位置
        non_zero_positions = [i for i, x in enumerate(block_vector) if x != 0.0]
        print(f"  非零位置: {non_zero_positions}")
        print()
    
    # 总体统计
    total_non_zero = sum(1 for x in vec if x != 0.0)
    total_zero = sum(1 for x in vec if x == 0.0)
    blocks = len(vec) // 64
    expected_non_zero = blocks * 8
    
    print(f"=== 总体统计 ===")
    print(f"总非零元素: {total_non_zero}")
    print(f"总零元素: {total_zero}")
    print(f"期望非零元素: {expected_non_zero}")
    print(f"稀疏性: {total_non_zero / len(vec) * 100:.2f}%")
    
    if total_non_zero == expected_non_zero:
        print("✅ 稀疏向量生成函数正确！")
        return True
    else:
        print("❌ 稀疏向量生成函数有问题！")
        return False

if __name__ == "__main__":
    test_sparse_function()
