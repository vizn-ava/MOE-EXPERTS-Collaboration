import json
import torch
import numpy as np
from collections import Counter, defaultdict

def analyze_data():
    # 加载数据
    print("Loading data...")
    
    # 加载token元数据
    with open('E:/tyb_file/tyb_tasks/research/MoE_vis/output/output/token_metadata.json', 'r', encoding='utf-8') as f:
        token_metadata = json.load(f)
    
    # 加载激活数据
    token_activations = torch.load('E:/tyb_file/tyb_tasks/research/MoE_vis/output/output/token_activations.pt')
    
    print(f"Token metadata count: {len(token_metadata)}")
    print(f"Token activations shape: {token_activations.shape}")
    print(f"Data type: {token_activations.dtype}")
    
    # 分析领域分布
    domains = [item['domain'] for item in token_metadata]
    domain_counts = Counter(domains)
    print(f"\nDomain distribution:")
    for domain, count in domain_counts.most_common():
        print(f"  {domain}: {count}")
    
    # 分析激活模式
    print(f"\nActivation analysis:")
    print(f"  Total experts (columns): {token_activations.shape[1]}")
    print(f"  Average non-zero activations per token: {torch.mean((token_activations > 0).sum(dim=1).float()):.2f}")
    print(f"  Max activation value: {torch.max(token_activations):.4f}")
    print(f"  Min activation value: {torch.min(token_activations):.4f}")
    
    # 检查数据一致性
    if len(token_metadata) != token_activations.shape[0]:
        print(f"WARNING: Metadata count ({len(token_metadata)}) doesn't match activation rows ({token_activations.shape[0]})")
    else:
        print("✓ Data consistency check passed")
    
    # 分析每个领域的激活模式
    print(f"\nDomain-specific activation analysis:")
    domain_activations = defaultdict(list)
    
    for i, metadata in enumerate(token_metadata):
        domain = metadata['domain']
        activations = token_activations[i]
        non_zero_count = torch.sum(activations > 0).item()
        domain_activations[domain].append(non_zero_count)
    
    for domain, activation_counts in domain_activations.items():
        avg_activations = np.mean(activation_counts)
        print(f"  {domain}: avg {avg_activations:.2f} experts activated per token")
    
    return token_metadata, token_activations, domain_counts

if __name__ == "__main__":
    analyze_data()