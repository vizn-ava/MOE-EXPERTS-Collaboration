import torch
import numpy as np

def convert_to_binary():
    """
    将token_activations_old.pt转换为二进制格式
    只要有值就是1，否则就是0
    """
    # 输入和输出文件路径
    input_path = 'E:/tyb_file/tyb_tasks/research/MoE_vis/output/output/token_activations_old.pt'
    output_path = 'E:/tyb_file/tyb_tasks/research/MoE_vis/output/output/token_activations_old_binary.pt'
    
    print("Loading token_activations_old.pt...")
    
    try:
        # 加载原始数据
        data = torch.load(input_path, map_location='cpu')
        print(f"Original data shape: {data.shape}")
        print(f"Original data dtype: {data.dtype}")
        
        # 检查原始数据的基本统计信息
        print(f"Original data - Min: {data.min().item():.6f}")
        print(f"Original data - Max: {data.max().item():.6f}")
        print(f"Original data - Mean: {data.mean().item():.6f}")
        
        # 计算非零元素数量（转换前）
        non_zero_count_original = torch.count_nonzero(data).item()
        total_elements = data.numel()
        
        print(f"Original non-zero elements: {non_zero_count_original:,} / {total_elements:,}")
        print(f"Original sparsity: {(1 - non_zero_count_original/total_elements)*100:.2f}%")
        
        # 转换为二进制：有值就是1，否则就是0
        print("\nConverting to binary format...")
        binary_data = (data != 0).float()  # 将非零值转换为1，零值保持为0
        
        # 验证转换结果
        unique_values = torch.unique(binary_data)
        print(f"Binary data unique values: {unique_values.tolist()}")
        
        # 计算二进制数据中1的数量
        ones_count = torch.sum(binary_data).item()
        print(f"Number of positions with value 1: {int(ones_count):,}")
        print(f"Percentage of 1s: {(ones_count/total_elements)*100:.2f}%")
        
        # 验证转换是否正确
        assert ones_count == non_zero_count_original, "转换错误：1的数量应该等于原始非零元素数量"
        
        # 保存二进制数据
        print(f"\nSaving binary data to: {output_path}")
        torch.save(binary_data, output_path)
        
        print("✅ Conversion completed successfully!")
        
        # 返回统计信息
        return {
            'original_shape': data.shape,
            'total_elements': total_elements,
            'ones_count': int(ones_count),
            'percentage_ones': (ones_count/total_elements)*100,
            'output_file': output_path
        }
        
    except Exception as e:
        print(f"❌ Error during conversion: {e}")
        return None

def verify_binary_file():
    """验证生成的二进制文件"""
    binary_path = 'E:/tyb_file/tyb_tasks/research\MoE_vis/output/output/token_activations_old_binary.pt'
    
    try:
        print("\n=== Verifying Binary File ===")
        binary_data = torch.load(binary_path, map_location='cpu')
        
        print(f"Binary file shape: {binary_data.shape}")
        print(f"Binary file dtype: {binary_data.dtype}")
        
        unique_vals = torch.unique(binary_data)
        print(f"Unique values in binary file: {unique_vals.tolist()}")
        
        ones_count = torch.sum(binary_data).item()
        total = binary_data.numel()
        
        print(f"Total 1s in binary file: {int(ones_count):,}")
        print(f"Total elements: {total:,}")
        print(f"Percentage of 1s: {(ones_count/total)*100:.2f}%")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verifying binary file: {e}")
        return False

def main():
    """主函数"""
    print("🔄 Starting binary conversion process...")
    print("=" * 50)
    
    # 执行转换
    result = convert_to_binary()
    
    if result:
        print("\n" + "=" * 50)
        print("📊 CONVERSION SUMMARY:")
        print(f"   • Original shape: {result['original_shape']}")
        print(f"   • Total elements: {result['total_elements']:,}")
        print(f"   • Positions with 1: {result['ones_count']:,}")
        print(f"   • Percentage of 1s: {result['percentage_ones']:.2f}%")
        print(f"   • Output file: {result['output_file']}")
        
        # 验证生成的文件
        verify_binary_file()
        
    else:
        print("❌ Conversion failed!")

if __name__ == "__main__":
    main()