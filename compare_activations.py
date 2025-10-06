import torch
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

class ActivationComparator:
    def __init__(self, file1_path, file2_path):
        """
        初始化激活比较器
        
        Args:
            file1_path: 第一个.pt文件路径
            file2_path: 第二个.pt文件路径
        """
        self.file1_path = file1_path
        self.file2_path = file2_path
        self.data1 = None
        self.data2 = None
        self.file1_name = "token_activations.pt"
        self.file2_name = "token_activations_old.pt"
        
    def load_data(self):
        """加载两个.pt文件"""
        print("Loading activation data...")
        try:
            self.data1 = torch.load(self.file1_path, map_location='cpu')
            self.data2 = torch.load(self.file2_path, map_location='cpu')
            
            print(f"File 1 ({self.file1_name}) shape: {self.data1.shape}")
            print(f"File 2 ({self.file2_name}) shape: {self.data2.shape}")
            print(f"File 1 dtype: {self.data1.dtype}")
            print(f"File 2 dtype: {self.data2.dtype}")
            
            # 转换为numpy数组便于计算
            if isinstance(self.data1, torch.Tensor):
                self.data1 = self.data1.detach().numpy()
            if isinstance(self.data2, torch.Tensor):
                self.data2 = self.data2.detach().numpy()
                
            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            return False
    
    def calculate_sum_distributions(self):
        """计算按行求和和按列求和的分布"""
        print("\nCalculating sum distributions...")
        
        # 按行求和 (每个token的总激活)
        self.row_sums1 = np.sum(self.data1, axis=1)
        self.row_sums2 = np.sum(self.data2, axis=1)
        
        # 按列求和 (每个expert的总激活)
        self.col_sums1 = np.sum(self.data1, axis=0)
        self.col_sums2 = np.sum(self.data2, axis=0)
        
        print(f"Row sums - File 1: min={self.row_sums1.min():.4f}, max={self.row_sums1.max():.4f}, mean={self.row_sums1.mean():.4f}")
        print(f"Row sums - File 2: min={self.row_sums2.min():.4f}, max={self.row_sums2.max():.4f}, mean={self.row_sums2.mean():.4f}")
        print(f"Col sums - File 1: min={self.col_sums1.min():.4f}, max={self.col_sums1.max():.4f}, mean={self.col_sums1.mean():.4f}")
        print(f"Col sums - File 2: min={self.col_sums2.min():.4f}, max={self.col_sums2.max():.4f}, mean={self.col_sums2.mean():.4f}")
    
    def statistical_comparison(self):
        """进行统计比较"""
        print("\n=== Statistical Comparison ===")
        
        # 行求和的统计比较
        print("\nRow Sums Comparison:")
        ks_stat_row, p_val_row = stats.ks_2samp(self.row_sums1, self.row_sums2)
        print(f"KS test p-value: {p_val_row:.6f}")
        print(f"Correlation coefficient: {np.corrcoef(self.row_sums1, self.row_sums2)[0,1]:.6f}")
        
        # 列求和的统计比较
        print("\nColumn Sums Comparison:")
        ks_stat_col, p_val_col = stats.ks_2samp(self.col_sums1, self.col_sums2)
        print(f"KS test p-value: {p_val_col:.6f}")
        print(f"Correlation coefficient: {np.corrcoef(self.col_sums1, self.col_sums2)[0,1]:.6f}")
        
        return {
            'row_ks_pval': p_val_row,
            'col_ks_pval': p_val_col,
            'row_correlation': np.corrcoef(self.row_sums1, self.row_sums2)[0,1],
            'col_correlation': np.corrcoef(self.col_sums1, self.col_sums2)[0,1]
        }
    
    def plot_distributions(self):
        """绘制分布对比图"""
        plt.style.use('default')
        fig, axes = plt.subplots(2, 3, figsize=(18, 12))
        fig.suptitle('Activation Distribution Comparison', fontsize=16, fontweight='bold')
        
        # 设置颜色
        color1 = '#2E86AB'  # 蓝色
        color2 = '#A23B72'  # 紫红色
        
        # 第一行：行求和分布
        # 直方图对比
        axes[0, 0].hist(self.row_sums1, bins=50, alpha=0.7, label=self.file1_name, 
                       color=color1, density=True)
        axes[0, 0].hist(self.row_sums2, bins=50, alpha=0.7, label=self.file2_name, 
                       color=color2, density=True)
        axes[0, 0].set_title('Row Sums Distribution (Histogram)', fontweight='bold')
        axes[0, 0].set_xlabel('Sum Value')
        axes[0, 0].set_ylabel('Density')
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)
        
        # 箱线图对比
        box_data_row = [self.row_sums1, self.row_sums2]
        bp1 = axes[0, 1].boxplot(box_data_row, labels=[self.file1_name, self.file2_name], 
                                patch_artist=True)
        bp1['boxes'][0].set_facecolor(color1)
        bp1['boxes'][1].set_facecolor(color2)
        axes[0, 1].set_title('Row Sums Distribution (Boxplot)', fontweight='bold')
        axes[0, 1].set_ylabel('Sum Value')
        axes[0, 1].grid(True, alpha=0.3)
        
        # 散点图对比
        axes[0, 2].scatter(self.row_sums1, self.row_sums2, alpha=0.6, s=1, color='#F18F01')
        axes[0, 2].plot([min(self.row_sums1.min(), self.row_sums2.min()), 
                        max(self.row_sums1.max(), self.row_sums2.max())],
                       [min(self.row_sums1.min(), self.row_sums2.min()), 
                        max(self.row_sums1.max(), self.row_sums2.max())], 
                       'r--', alpha=0.8, linewidth=2)
        axes[0, 2].set_title('Row Sums Correlation', fontweight='bold')
        axes[0, 2].set_xlabel(self.file1_name)
        axes[0, 2].set_ylabel(self.file2_name)
        axes[0, 2].grid(True, alpha=0.3)
        
        # 第二行：列求和分布
        # 直方图对比
        axes[1, 0].hist(self.col_sums1, bins=50, alpha=0.7, label=self.file1_name, 
                       color=color1, density=True)
        axes[1, 0].hist(self.col_sums2, bins=50, alpha=0.7, label=self.file2_name, 
                       color=color2, density=True)
        axes[1, 0].set_title('Column Sums Distribution (Histogram)', fontweight='bold')
        axes[1, 0].set_xlabel('Sum Value')
        axes[1, 0].set_ylabel('Density')
        axes[1, 0].legend()
        axes[1, 0].grid(True, alpha=0.3)
        
        # 箱线图对比
        box_data_col = [self.col_sums1, self.col_sums2]
        bp2 = axes[1, 1].boxplot(box_data_col, labels=[self.file1_name, self.file2_name], 
                                patch_artist=True)
        bp2['boxes'][0].set_facecolor(color1)
        bp2['boxes'][1].set_facecolor(color2)
        axes[1, 1].set_title('Column Sums Distribution (Boxplot)', fontweight='bold')
        axes[1, 1].set_ylabel('Sum Value')
        axes[1, 1].grid(True, alpha=0.3)
        
        # 散点图对比
        axes[1, 2].scatter(self.col_sums1, self.col_sums2, alpha=0.6, s=1, color='#F18F01')
        axes[1, 2].plot([min(self.col_sums1.min(), self.col_sums2.min()), 
                        max(self.col_sums1.max(), self.col_sums2.max())],
                       [min(self.col_sums1.min(), self.col_sums2.min()), 
                        max(self.col_sums1.max(), self.col_sums2.max())], 
                       'r--', alpha=0.8, linewidth=2)
        axes[1, 2].set_title('Column Sums Correlation', fontweight='bold')
        axes[1, 2].set_xlabel(self.file1_name)
        axes[1, 2].set_ylabel(self.file2_name)
        axes[1, 2].grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # 保存图像
        output_path = 'activation_distribution_comparison.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"\nDistribution comparison plot saved as: {output_path}")
        
        return output_path

def main():
    # 文件路径
    file1_path = 'E:/tyb_file/tyb_tasks/research/MoE_vis/output/output/token_activations.pt'
    file2_path = 'E:/tyb_file/tyb_tasks/research/MoE_vis/output/output/token_activations_old.pt'
    
    # 创建比较器
    comparator = ActivationComparator(file1_path, file2_path)
    
    # 执行分析
    if comparator.load_data():
        comparator.calculate_sum_distributions()
        stats_results = comparator.statistical_comparison()
        plot_path = comparator.plot_distributions()
        
        print(f"\n=== Analysis Complete ===")
        print(f"Comparison plot saved: {plot_path}")
        
        return comparator, stats_results
    else:
        print("Failed to load data files.")
        return None, None

if __name__ == "__main__":
    comparator, results = main()