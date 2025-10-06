import json

try:
    with open('expert_activation_patterns.json', 'r') as f:
        data = json.load(f)
    print("JSON语法正确")
    print(f"专家数量: {len(data)}")
    for expert_id in data:
        print(f"专家 {expert_id}: {len(data[expert_id])} 个激活点")
except Exception as e:
    print(f"JSON错误: {e}")