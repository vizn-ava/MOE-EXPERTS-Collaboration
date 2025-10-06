#!/usr/bin/env python3
import requests
import json

# 测试后端稀疏向量生成
def test_backend_sparse():
    url = "https://dispatched-driving-familiar-invention.trycloudflare.com/api/process"
    
    data = {
        "input": "hello world test"
    }
    
    try:
        response = requests.post(url, json=data, timeout=30)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"返回数据: {json.dumps(result, indent=2, ensure_ascii=False)}")
            
            # 检查稀疏向量
            if 'tokenVectors' in result:
                for i, token_vector in enumerate(result['tokenVectors']):
                    vector = token_vector.get('vector', [])
                    if vector:
                        # 计算非零元素数量
                        non_zero_count = sum(1 for x in vector if x != 0)
                        print(f"Token {i+1}: {token_vector.get('token', 'unknown')}")
                        print(f"  向量长度: {len(vector)}")
                        print(f"  非零元素数量: {non_zero_count}")
                        print(f"  前10个元素: {vector[:10]}")
                        
                        # 检查每64维中是否有8个非零元素
                        blocks = len(vector) // 64
                        print(f"  64维块数量: {blocks}")
                        
                        for block in range(min(blocks, 3)):  # 只检查前3个块
                            start = block * 64
                            end = start + 64
                            block_vector = vector[start:end]
                            block_non_zero = sum(1 for x in block_vector if x != 0)
                            print(f"  块{block+1} (位置{start}-{end-1}): {block_non_zero}个非零元素")
        else:
            print(f"错误: {response.text}")
            
    except Exception as e:
        print(f"请求失败: {e}")

if __name__ == "__main__":
    test_backend_sparse()
