import json
import torch
import numpy as np
import pandas as pd
from collections import defaultdict, Counter
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import chi2_contingency
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')

class MoEExpertAnalyzer:
    def __init__(self, metadata_path, activations_path):
        """初始化MoE专家分析器"""
        print("Loading data...")
        
        # 加载数据
        with open(metadata_path, 'r', encoding='utf-8') as f:
            self.token_metadata = json.load(f)
        
        self.token_activations = torch.load(activations_path)
        
        # 基本信息
        self.num_tokens = len(self.token_metadata)
        self.num_experts = self.token_activations.shape[1]
        
        print(f"Loaded {self.num_tokens} tokens with {self.num_experts} experts")
        
        # 提取领域信息
        self.domains = [item['domain'] for item in self.token_metadata]
        self.unique_domains = list(set(self.domains))
        
        print(f"Found {len(self.unique_domains)} domains: {self.unique_domains}")
    
    def build_expert_token_mapping(self, activation_threshold=0.1, sample_ratio=1.0, random_seed=42):
        """建立专家与token的映射关系"""
        print(f"\nBuilding expert-token mapping (threshold: {activation_threshold}, sample_ratio: {sample_ratio}, random_seed: {random_seed})...")
        
        # 创建专家-token映射
        expert_token_map = defaultdict(list)
        token_expert_map = defaultdict(list)
        
        # 计算要处理的token数量
        num_tokens_to_process = int(self.num_tokens * sample_ratio)
        print(f"Processing {num_tokens_to_process} out of {self.num_tokens} tokens ({sample_ratio*100:.1f}%)")
        
        # 设置随机种子以确保结果可重现
        np.random.seed(random_seed)
        
        # 随机选择要处理的token索引
        if sample_ratio >= 1.0:
            # 如果处理全部token，则按顺序处理
            token_indices = list(range(self.num_tokens))
        else:
            # 随机采样指定数量的token
            token_indices = np.random.choice(self.num_tokens, size=num_tokens_to_process, replace=False)
            token_indices = sorted(token_indices)  # 排序以便进度条显示更直观
        
        print(f"Sampling method: {'Sequential (full dataset)' if sample_ratio >= 1.0 else 'Random sampling'}")
        
        # 遍历选定的token，添加进度条
        for token_idx in tqdm(token_indices, desc="Processing tokens", unit="token"):
            activations = self.token_activations[token_idx]
            active_experts = torch.where(activations > activation_threshold)[0].tolist()
            
            # 记录映射关系
            for expert_idx in active_experts:
                expert_token_map[expert_idx].append({
                    'token_idx': token_idx,
                    'activation': activations[expert_idx].item(),
                    'domain': self.domains[token_idx],
                    'token_text': self.token_metadata[token_idx]['token_text']
                })
                
                token_expert_map[token_idx].append({
                    'expert_idx': expert_idx,
                    'activation': activations[expert_idx].item()
                })
        
        self.expert_token_map = expert_token_map
        self.token_expert_map = token_expert_map
        
        print(f"Mapping completed. Active experts: {len(expert_token_map)}")
        return expert_token_map, token_expert_map
    
    def analyze_domain_preferences(self):
        """分析专家对不同领域的偏好"""
        print("\nAnalyzing domain preferences...")
        
        # 计算每个专家在各领域的激活统计
        expert_domain_stats = {}
        
        # 添加进度条显示专家分析进度
        for expert_idx, token_list in tqdm(self.expert_token_map.items(), desc="Analyzing experts", unit="expert"):
            domain_activations = defaultdict(list)
            
            for token_info in token_list:
                domain = token_info['domain']
                activation = token_info['activation']
                domain_activations[domain].append(activation)
            
            # 计算统计信息
            stats = {}
            for domain in self.unique_domains:
                if domain in domain_activations:
                    activations = domain_activations[domain]
                    stats[domain] = {
                        'count': len(activations),
                        'mean_activation': np.mean(activations),
                        'max_activation': np.max(activations),
                        'total_activation': np.sum(activations)
                    }
                else:
                    stats[domain] = {
                        'count': 0,
                        'mean_activation': 0.0,
                        'max_activation': 0.0,
                        'total_activation': 0.0
                    }
            
            expert_domain_stats[expert_idx] = stats
        
        self.expert_domain_stats = expert_domain_stats
        return expert_domain_stats
    
    def calculate_expert_focus_degree(self):
        """计算专家的专注程度：平均来看专家最专注领域的百分比"""
        print("\nCalculating expert focus degree...")
        
        if not hasattr(self, 'expert_domain_stats'):
            print("❌ 请先运行 analyze_domain_preferences() 方法")
            return None
        
        focus_degrees = []
        expert_focus_details = {}
        
        # 添加进度条显示专注程度计算进度
        for expert_idx, domain_stats in tqdm(self.expert_domain_stats.items(), desc="Calculating focus degree", unit="expert"):
            # 计算每个领域的总激活量
            domain_totals = {}
            total_activation = 0
            
            for domain, stats in domain_stats.items():
                domain_total = stats['total_activation']
                domain_totals[domain] = domain_total
                total_activation += domain_total
            
            if total_activation > 0:
                # 计算每个领域的百分比
                domain_percentages = {domain: (total / total_activation) * 100 
                                    for domain, total in domain_totals.items()}
                
                # 找到最专注的领域及其百分比
                max_domain = max(domain_percentages, key=domain_percentages.get)
                max_percentage = domain_percentages[max_domain]
                
                focus_degrees.append(max_percentage)
                expert_focus_details[expert_idx] = {
                    'most_focused_domain': max_domain,
                    'focus_percentage': max_percentage,
                    'domain_percentages': domain_percentages
                }
            else:
                # 如果专家没有激活，跳过
                expert_focus_details[expert_idx] = {
                    'most_focused_domain': 'None',
                    'focus_percentage': 0.0,
                    'domain_percentages': {}
                }
        
        # 计算平均专注程度
        if focus_degrees:
            average_focus_degree = np.mean(focus_degrees)
            median_focus_degree = np.median(focus_degrees)
            std_focus_degree = np.std(focus_degrees)
            
            print(f"\n📊 专家专注程度分析结果:")
            print(f"   🎯 平均专注程度: {average_focus_degree:.2f}%")
            print(f"   📈 中位数专注程度: {median_focus_degree:.2f}%")
            print(f"   📊 标准差: {std_focus_degree:.2f}%")
            print(f"   🔢 分析的专家数量: {len(focus_degrees)}")
            
            # 显示专注程度分布
            print(f"\n📈 专注程度分布:")
            bins = [0, 20, 40, 60, 80, 100]
            bin_labels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']
            hist, _ = np.histogram(focus_degrees, bins=bins)
            
            for i, (label, count) in enumerate(zip(bin_labels, hist)):
                percentage = (count / len(focus_degrees)) * 100
                print(f"   {label}: {count} 个专家 ({percentage:.1f}%)")
            
            # 找出最专注和最不专注的专家
            if expert_focus_details:
                sorted_experts = sorted(expert_focus_details.items(), 
                                      key=lambda x: x[1]['focus_percentage'], reverse=True)
                
                print(f"\n🏆 最专注的5个专家:")
                for i, (expert_idx, details) in enumerate(sorted_experts[:5]):
                    print(f"   {i+1}. 专家 {expert_idx}: {details['focus_percentage']:.2f}% "
                          f"(专注于 {details['most_focused_domain']})")
                
                print(f"\n🔍 最不专注的5个专家:")
                for i, (expert_idx, details) in enumerate(sorted_experts[-5:]):
                    print(f"   {i+1}. 专家 {expert_idx}: {details['focus_percentage']:.2f}% "
                          f"(专注于 {details['most_focused_domain']})")
            
            self.expert_focus_details = expert_focus_details
            self.average_focus_degree = average_focus_degree
            
            # 生成专注程度分布图
            self.plot_focus_degree_distribution(focus_degrees)
            
            return {
                 'average_focus_degree': average_focus_degree,
                 'median_focus_degree': median_focus_degree,
                 'std_focus_degree': std_focus_degree,
                 'focus_degrees': focus_degrees,
                 'expert_focus_details': expert_focus_details
             }
        else:
            print("❌ 没有找到有效的专家激活数据")
            return None
    
    def plot_focus_degree_distribution(self, focus_degrees):
        """Plot expert focus degree distribution"""
        print("\n📊 Generating focus degree distribution chart...")
        
        plt.figure(figsize=(12, 8))
        
        # Create subplots
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('Expert Focus Degree Analysis', fontsize=16, fontweight='bold')
        
        # 1. Histogram
        ax1.hist(focus_degrees, bins=20, alpha=0.7, color='skyblue', edgecolor='black')
        ax1.set_xlabel('Focus Degree (%)')
        ax1.set_ylabel('Number of Experts')
        ax1.set_title('Focus Degree Distribution Histogram')
        ax1.grid(True, alpha=0.3)
        
        # Add statistical information
        mean_val = np.mean(focus_degrees)
        median_val = np.median(focus_degrees)
        ax1.axvline(mean_val, color='red', linestyle='--', label=f'Mean: {mean_val:.2f}%')
        ax1.axvline(median_val, color='orange', linestyle='--', label=f'Median: {median_val:.2f}%')
        ax1.legend()
        
        # 2. Box plot
        ax2.boxplot(focus_degrees, vert=True, patch_artist=True, 
                   boxprops=dict(facecolor='lightgreen', alpha=0.7))
        ax2.set_ylabel('Focus Degree (%)')
        ax2.set_title('Focus Degree Box Plot')
        ax2.grid(True, alpha=0.3)
        
        # 3. Grouped bar chart
        bins = [0, 20, 40, 60, 80, 100]
        bin_labels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']
        hist, _ = np.histogram(focus_degrees, bins=bins)
        
        colors = ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99', '#ff99cc']
        bars = ax3.bar(bin_labels, hist, color=colors, alpha=0.7, edgecolor='black')
        ax3.set_xlabel('Focus Degree Range')
        ax3.set_ylabel('Number of Experts')
        ax3.set_title('Focus Degree Grouped Distribution')
        ax3.grid(True, alpha=0.3)
        
        # Add value labels on bars
        for bar, count in zip(bars, hist):
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., height + 5,
                    f'{count}\n({count/len(focus_degrees)*100:.1f}%)',
                    ha='center', va='bottom', fontsize=9)
        
        # 4. Cumulative distribution plot
        sorted_degrees = np.sort(focus_degrees)
        cumulative = np.arange(1, len(sorted_degrees) + 1) / len(sorted_degrees) * 100
        ax4.plot(sorted_degrees, cumulative, linewidth=2, color='purple')
        ax4.set_xlabel('Focus Degree (%)')
        ax4.set_ylabel('Cumulative Percentage (%)')
        ax4.set_title('Focus Degree Cumulative Distribution')
        ax4.grid(True, alpha=0.3)
        
        # Add key percentile lines
        percentiles = [25, 50, 75]
        for p in percentiles:
            val = np.percentile(focus_degrees, p)
            ax4.axvline(val, color='red', linestyle=':', alpha=0.7, 
                       label=f'{p}th: {val:.1f}%')
        ax4.legend()
        
        plt.tight_layout()
        
        # Save image
        output_path = 'expert_focus_degree_distribution.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"✅ Focus degree distribution chart saved to: {output_path}")
        
        plt.close()  # Close figure to free memory
    
    def find_domain_specialized_experts(self, top_k=10):
        """找出对特定领域特化的专家"""
        print(f"\nFinding top {top_k} domain-specialized experts...")
        
        domain_specialists = {}
        
        for domain in self.unique_domains:
            # 计算每个专家在该领域的专业化程度
            expert_scores = []
            
            for expert_idx, stats in self.expert_domain_stats.items():
                domain_stat = stats[domain]
                total_activations = sum(s['total_activation'] for s in stats.values())
                
                if total_activations > 0:
                    # 专业化分数：该领域激活占比 × 平均激活强度
                    specialization_score = (domain_stat['total_activation'] / total_activations) * domain_stat['mean_activation']
                    expert_scores.append((expert_idx, specialization_score, domain_stat))
            
            # 排序并取前k个
            expert_scores.sort(key=lambda x: x[1], reverse=True)
            domain_specialists[domain] = expert_scores[:top_k]
        
        self.domain_specialists = domain_specialists
        return domain_specialists
    
    def create_domain_expert_matrix(self):
        """创建领域-专家激活矩阵"""
        print("\nCreating domain-expert activation matrix...")
        
        # 创建矩阵：行为领域，列为专家
        matrix = np.zeros((len(self.unique_domains), self.num_experts))
        
        for domain_idx, domain in enumerate(self.unique_domains):
            for expert_idx in range(self.num_experts):
                if expert_idx in self.expert_domain_stats:
                    stats = self.expert_domain_stats[expert_idx][domain]
                    matrix[domain_idx, expert_idx] = stats['mean_activation']
        
        self.domain_expert_matrix = matrix
        return matrix
    
    def generate_summary_report(self):
        """生成分析摘要报告"""
        print("\n" + "="*60)
        print("MoE EXPERT ANALYSIS SUMMARY REPORT")
        print("="*60)
        
        print(f"\n📊 Data Overview:")
        print(f"  • Total tokens: {self.num_tokens:,}")
        print(f"  • Total experts: {self.num_experts:,}")
        print(f"  • Domains: {len(self.unique_domains)}")
        
        # 领域分布
        domain_counts = Counter(self.domains)
        print(f"\n🏷️  Domain Distribution:")
        for domain, count in domain_counts.most_common():
            percentage = (count / self.num_tokens) * 100
            print(f"  • {domain}: {count:,} tokens ({percentage:.1f}%)")
        
        # 专家激活统计
        active_experts = len(self.expert_token_map)
        print(f"\n🧠 Expert Activation:")
        print(f"  • Active experts: {active_experts:,} / {self.num_experts:,} ({active_experts/self.num_experts*100:.1f}%)")
        
        # 领域专家分析
        print(f"\n🎯 Domain Specialists (Top 3 per domain):")
        for domain, specialists in self.domain_specialists.items():
            print(f"\n  {domain}:")
            for i, (expert_idx, score, stats) in enumerate(specialists[:3]):
                print(f"    {i+1}. Expert {expert_idx}: score={score:.4f}, "
                      f"activations={stats['count']}, avg_strength={stats['mean_activation']:.4f}")
        
        return {
            'total_tokens': self.num_tokens,
            'total_experts': self.num_experts,
            'active_experts': active_experts,
            'domain_distribution': dict(domain_counts),
            'domain_specialists': self.domain_specialists
        }

def main():
    # 文件路径
    metadata_path = 'E:/tyb_file/tyb_tasks/research/MoE_vis/output/output/token_metadata.json'
    activations_path = 'E:/tyb_file/tyb_tasks/research/MoE_vis/output/output/R_tensor0925.pt'
    
    # 创建分析器
    analyzer = MoEExpertAnalyzer(metadata_path, activations_path)
    
    # 执行分析
    analyzer.build_expert_token_mapping(activation_threshold=0.1, sample_ratio=1/3, random_seed=42)
    analyzer.analyze_domain_preferences()
    analyzer.calculate_expert_focus_degree()  # 添加专注程度分析
    analyzer.find_domain_specialized_experts(top_k=10)
    analyzer.create_domain_expert_matrix()
    
    # 生成报告
    summary = analyzer.generate_summary_report()
    
    # 保存结果
    results = {
        'expert_token_mapping': {k: v for k, v in list(analyzer.expert_token_map.items())[:100]},  # 保存前100个专家的映射
        'domain_specialists': analyzer.domain_specialists,
        'summary': summary
    }
    
    with open('expert_analysis_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Analysis completed! Results saved to 'expert_analysis_results.json'")
    
    return analyzer

if __name__ == "__main__":
    analyzer = main()