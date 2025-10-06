import json
import random
import csv

def generate_random_activation_pattern(num_circles, total_positions=1728):
    """生成真正随机的激活模式"""
    # 从0到total_positions-1中随机选择num_circles个不重复的位置
    positions = random.sample(range(total_positions), num_circles)
    # 排序以便于查看
    positions.sort()
    return positions

def load_experts_from_csv():
    """从CSV文件加载专家信息"""
    experts = {}
    primary_experts = {}
    
    with open('experts_summary_new.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            primary_id = row['Primary Expert']
            primary_name = row['Primary Expert Name']
            
            # 收集一级专家信息
            if primary_id not in primary_experts:
                primary_experts[primary_id] = {
                    'name': primary_name,
                    'secondary_experts': []
                }
            
            # 添加二级专家到对应的一级专家
            primary_experts[primary_id]['secondary_experts'].append({
                'index': row['Expert Index'],
                'name': row['Expert Name'],
                'description': row['Function Description']
            })
    
    return primary_experts

def generate_all_patterns():
    """为所有一级专家生成随机激活模式"""
    primary_experts = load_experts_from_csv()
    patterns = {}
    
    for expert_id, expert_info in primary_experts.items():
        # 为每个一级专家生成150-250个随机激活圆圈
        num_circles = random.randint(150, 250)
        pattern = generate_random_activation_pattern(num_circles)
        patterns[expert_id] = {
            'name': expert_info['name'],
            'circles': num_circles,
            'pattern': pattern,
            'secondary_count': len(expert_info['secondary_experts']),
            'secondary_experts': expert_info['secondary_experts']
        }
        print(f"一级专家 {expert_id} ({expert_info['name']}): {num_circles} 个激活圆圈, {len(expert_info['secondary_experts'])} 个二级专家")
    
    return patterns

if __name__ == "__main__":
    # 设置随机种子以确保可重现性（可选）
    random.seed(42)
    
    print("正在生成随机激活模式...")
    activation_patterns = generate_all_patterns()
    
    # 保存到JSON文件
    with open('expert_activation_patterns.json', 'w', encoding='utf-8') as f:
        json.dump(activation_patterns, f, indent=2, ensure_ascii=False)
    
    print("\n激活模式已保存到 expert_activation_patterns.json")
    print("文件包含了5个一级专家的随机激活模式，每个专家150-250个激活圆圈")
    print("包含语法结构、语义理解、文本处理、技术文档、多语言处理等专家类型")