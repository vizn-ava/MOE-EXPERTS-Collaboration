#!/usr/bin/env python3
import requests
import json

def test_server_sparse_vector():
    """测试服务器上的稀疏向量生成"""
    
    url = "https://screening-generally-myrtle-duty.trycloudflare.com/api/process"
    data = {"input": "测试稀疏向量生成"}
    
    try:
        print("正在测试服务器稀疏向量生成...")
        response = requests.post(url, json=data, timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            
            if 'tokenVectors' in result and len(result['tokenVectors']) > 0:
                vector = result['tokenVectors'][0]['vector']
                print(f"✅ 成功获取向量，长度: {len(vector)}")
                
                # 分析前3个64维块
                print("\n=== 稀疏性分析 ===")
                for block in range(3):
                    start_pos = block * 64
                    end_pos = start_pos + 64
                    block_vector = vector[start_pos:end_pos]
                    
                    # 统计非零元素
                    non_zero_count = sum(1 for x in block_vector if x != 0.0)
                    zero_count = sum(1 for x in block_vector if x == 0.0)
                    
                    print(f"块 {block} (位置 {start_pos}-{end_pos-1}):")
                    print(f"  非零元素: {non_zero_count} 个")
                    print(f"  零元素: {zero_count} 个")
                    print(f"  前10个元素: {[f'{x:.6f}' for x in block_vector[:10]]}")
                    
                    # 显示非零元素的位置
                    non_zero_positions = [i for i, x in enumerate(block_vector) if x != 0.0]
                    print(f"  非零位置: {non_zero_positions[:10]}{'...' if len(non_zero_positions) > 10 else ''}")
                    print()
                
                # 总体统计
                total_non_zero = sum(1 for x in vector if x != 0.0)
                total_zero = sum(1 for x in vector if x == 0.0)
                blocks = len(vector) // 64
                expected_non_zero = blocks * 8
                
                print(f"=== 总体统计 ===")
                print(f"总维度: {len(vector)}")
                print(f"总块数: {blocks}")
                print(f"总非零元素: {total_non_zero}")
                print(f"总零元素: {total_zero}")
                print(f"期望非零元素: {expected_non_zero}")
                print(f"稀疏性: {total_non_zero / len(vector) * 100:.2f}%")
                
                if total_non_zero == expected_non_zero:
                    print("✅ 稀疏向量生成正确！")
                else:
                    print("❌ 稀疏向量生成有问题！")
                    
            else:
                print("❌ 响应中没有找到tokenVectors")
                print(f"响应内容: {result}")
        else:
            print(f"❌ API调用失败，状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
            
    except Exception as e:
        print(f"❌ 请求失败: {e}")

if __name__ == "__main__":
    test_server_sparse_vector()
