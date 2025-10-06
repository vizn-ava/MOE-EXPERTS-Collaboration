#!/usr/bin/env python3
import requests
import json

def verify_sparse_vector():
    """验证服务器上的稀疏向量生成是否正确"""
    
    # 测试API
    url = "https://screening-generally-myrtle-duty.trycloudflare.com/api/process"
    data = {"input": "测试稀疏向量验证"}
    
    try:
        response = requests.post(url, json=data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            
            if 'tokenVectors' in result and len(result['tokenVectors']) > 0:
                vector = result['tokenVectors'][0]['vector']
                print(f"向量长度: {len(vector)}")
                
                # 检查每64维块中的非零元素数量
                blocks = len(vector) // 64
                print(f"总块数: {blocks}")
                
                for block in range(min(3, blocks)):  # 检查前3个块
                    start_pos = block * 64
                    end_pos = min(start_pos + 64, len(vector))
                    block_vector = vector[start_pos:end_pos]
                    non_zero_count = sum(1 for x in block_vector if x != 0.0)
                    print(f"块 {block} (位置 {start_pos}-{end_pos-1}): {non_zero_count} 个非零元素")
                
                # 统计总的非零元素
                total_non_zero = sum(1 for x in vector if x != 0.0)
                expected_non_zero = blocks * 8
                print(f"总非零元素数: {total_non_zero} (期望: {expected_non_zero})")
                
                if total_non_zero == expected_non_zero:
                    print("✅ 稀疏向量生成正确！每64维中正好8个非零元素")
                else:
                    print("❌ 稀疏向量生成有问题")
            else:
                print("❌ 响应中没有找到tokenVectors")
        else:
            print(f"❌ API调用失败，状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
            
    except Exception as e:
        print(f"❌ 请求失败: {e}")

if __name__ == "__main__":
    verify_sparse_vector()
