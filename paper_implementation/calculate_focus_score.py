import json
import numpy as np
from collections import defaultdict

def calculate_focus_scores():
    """计算专家的专注度得分（只考虑激活占比，不考虑激活强度）"""
    
    print("Loading expert analysis results...")
    
    # 加载分析结果
    with open('expert_analysis_results.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    expert_token_mapping = data['expert_token_mapping']
    summary = data['summary']
    
    print(f"Total experts: {summary['total_experts']}")
    print(f"Active experts: {summary['active_experts']}")
    print(f"Total tokens: {summary['total_tokens']}")
    
    # 计算每个专家的专注度得分
    expert_focus_scores = {}
    
    for expert_id, expert_data in expert_token_mapping.items():
        expert_idx = int(expert_id)
        
        # 统计各领域的激活总量
        domain_activations = defaultdict(float)
        total_activation = 0.0
        
        for token_info in expert_data:
            domain = token_info['domain']
            activation = token_info['activation']
            domain_activations[domain] += activation
            total_activation += activation
        
        # 计算专注度得分（激活占比）
        focus_scores = {}
        for domain, activation_sum in domain_activations.items():
            if total_activation > 0:
                focus_score = activation_sum / total_activation
                focus_scores[domain] = focus_score
            else:
                focus_scores[domain] = 0.0
        
        expert_focus_scores[expert_idx] = {
            'focus_scores': focus_scores,
            'total_activation': total_activation,
            'token_count': len(expert_data)
        }
    
    return expert_focus_scores, summary

def find_top_focused_experts(expert_focus_scores, top_k=10):
    """找出每个领域最专注的专家"""
    
    domains = ['Psychology', 'Law', 'Physics', 'computer science', 'math']
    domain_top_experts = {}
    
    for domain in domains:
        # 收集所有专家在该领域的专注度得分
        expert_scores = []
        
        for expert_idx, data in expert_focus_scores.items():
            focus_scores = data['focus_scores']
            if domain in focus_scores:
                focus_score = focus_scores[domain]
                expert_scores.append((expert_idx, focus_score, data))
        
        # 按专注度得分排序
        expert_scores.sort(key=lambda x: x[1], reverse=True)
        domain_top_experts[domain] = expert_scores[:top_k]
    
    return domain_top_experts

def generate_focus_report(expert_focus_scores, domain_top_experts, summary):
    """生成专注度分析报告"""
    
    report_lines = []
    report_lines.append("=" * 80)
    report_lines.append("MoE EXPERT FOCUS ANALYSIS REPORT")
    report_lines.append("(基于专注度得分 - 只考虑激活占比)")
    report_lines.append("=" * 80)
    report_lines.append("")
    
    # 数据概览
    report_lines.append("📊 DATA OVERVIEW:")
    report_lines.append(f"  • Total Tokens: {summary['total_tokens']:,}")
    report_lines.append(f"  • Total Experts: {summary['total_experts']:,}")
    report_lines.append(f"  • Active Experts: {summary['active_experts']:,}")
    report_lines.append(f"  • Domains: {len(summary['domain_distribution'])}")
    report_lines.append("")
    
    # 领域分布
    report_lines.append("🏷️ DOMAIN DISTRIBUTION:")
    for domain, count in summary['domain_distribution'].items():
        percentage = (count / summary['total_tokens']) * 100
        report_lines.append(f"  • {domain:<15}: {count:>6,} tokens ({percentage:>5.1f}%)")
    report_lines.append("")
    
    # 各领域最专注的专家
    for domain, top_experts in domain_top_experts.items():
        report_lines.append(f"🎯 {domain.upper()} - TOP 10 MOST FOCUSED EXPERTS:")
        report_lines.append("=" * 60)
        report_lines.append("Rank │ Expert ID │ Focus Score │ Tokens │ Total Activation")
        report_lines.append("─────┼───────────┼─────────────┼────────┼─────────────────")
        
        for rank, (expert_idx, focus_score, data) in enumerate(top_experts, 1):
            token_count = data['token_count']
            total_activation = data['total_activation']
            report_lines.append(f"{rank:>4} │ Expert {expert_idx:>4}│    {focus_score:>7.4f} │ {token_count:>6} │      {total_activation:>10.2f}")
        
        report_lines.append("")
    
    # 统计摘要
    all_focus_scores = []
    highly_focused_count = 0
    
    for expert_data in expert_focus_scores.values():
        for domain, score in expert_data['focus_scores'].items():
            all_focus_scores.append(score)
            if score > 0.8:  # 专注度超过80%
                highly_focused_count += 1
    
    report_lines.append("📈 FOCUS STATISTICS:")
    report_lines.append(f"  • Average Focus Score: {np.mean(all_focus_scores):.4f}")
    report_lines.append(f"  • Maximum Focus Score: {np.max(all_focus_scores):.4f}")
    report_lines.append(f"  • Minimum Focus Score: {np.min(all_focus_scores):.4f}")
    report_lines.append(f"  • Highly Focused (>0.8): {highly_focused_count}")
    report_lines.append("")
    
    report_lines.append("💡 FOCUS SCORE EXPLANATION:")
    report_lines.append("  专注度得分 = 该领域激活总量 ÷ 专家总激活量")
    report_lines.append("  • 得分接近1.0：专家几乎只处理该领域内容")
    report_lines.append("  • 得分接近0.5：专家在该领域投入一半精力")
    report_lines.append("  • 得分接近0.0：专家很少处理该领域内容")
    report_lines.append("")
    
    report_lines.append("=" * 80)
    report_lines.append("ANALYSIS COMPLETE")
    report_lines.append("=" * 80)
    
    return "\n".join(report_lines)

def main():
    """主函数"""
    try:
        # 计算专注度得分
        expert_focus_scores, summary = calculate_focus_scores()
        
        # 找出各领域最专注的专家
        domain_top_experts = find_top_focused_experts(expert_focus_scores)
        
        # 生成报告
        report = generate_focus_report(expert_focus_scores, domain_top_experts, summary)
        
        # 保存报告
        with open('moe_focus_analysis_report.txt', 'w', encoding='utf-8') as f:
            f.write(report)
        
        print("✅ Focus analysis complete!")
        print("📄 Report saved to: moe_focus_analysis_report.txt")
        
        # 打印一些关键统计
        print("\n🎯 KEY FINDINGS:")
        for domain, top_experts in domain_top_experts.items():
            if top_experts:
                top_expert = top_experts[0]
                expert_idx, focus_score, _ = top_expert
                print(f"  • {domain}: Expert {expert_idx} (Focus: {focus_score:.4f})")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()