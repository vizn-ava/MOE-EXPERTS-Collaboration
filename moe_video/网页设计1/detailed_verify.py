#!/usr/bin/env python3
import requests
import json

def analyze_vector_sparsity(vector, block_size=64):
    """分析向量的稀疏性"""
    print(f"向量总长度: {len(vector)}")
    
    blocks = len(vector) // block_size
    print(f"总块数: {blocks}")
    
    total_non_zero = 0
    
    for block in range(blocks):
        start_pos = block * block_size
        end_pos = min(start_pos + block_size, len(vector))
        block_vector = vector[start_pos:end_pos]
        
        non_zero_count = sum(1 for x in block_vector if x != 0.0)
        total_non_zero += non_zero_count
        
        print(f"块 {block} (位置 {start_pos}-{end_pos-1}): {non_zero_count} 个非零元素")
        
        # 显示前10个元素
        print(f"  前10个元素: {[f'{x:.6f}' for x in block_vector[:10]]}")
        
        # 显示非零元素的位置
        non_zero_positions = [i for i, x in enumerate(block_vector) if x != 0.0]
        print(f"  非零位置: {non_zero_positions[:10]}{'...' if len(non_zero_positions) > 10 else ''}")
        print()
    
    print(f"总非零元素数: {total_non_zero}")
    print(f"期望非零元素数: {blocks * 8}")
    print(f"稀疏性: {total_non_zero / len(vector) * 100:.2f}%")
    
    return total_non_zero == blocks * 8

def test_api_sparse_vector():
    """测试API返回的稀疏向量"""
    url = "https://screening-generally-myrtle-duty.trycloudflare.com/api/process"
    data = {"input": "测试稀疏向量详细分析"}
    
    try:
        response = requests.post(url, json=data, timeout=15)
        print(f"API响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"响应包含tokenVectors: {'tokenVectors' in result}")
            
            if 'tokenVectors' in result and len(result['tokenVectors']) > 0:
                vector = result['tokenVectors'][0]['vector']
                print(f"\n=== 稀疏向量分析 ===")
                is_correct = analyze_vector_sparsity(vector)
                
                if is_correct:
                    print("✅ 稀疏向量生成正确！每64维中正好8个非零元素")
                else:
                    print("❌ 稀疏向量生成有问题！")
            else:
                print("❌ 响应中没有找到tokenVectors")
        else:
            print(f"❌ API调用失败: {response.text}")
            
    except Exception as e:
        print(f"❌ 请求失败: {e}")

if __name__ == "__main__":
    test_api_sparse_vector()
