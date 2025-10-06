"""
简化的雷达图生成脚本 - 优化美观度版本
"""

import json
import random
import math
from collections import defaultdict

def load_and_analyze_data():
    """加载并分析数据"""
    print("🔄 正在加载专家分析结果...")
    
    try:
        with open('expert_analysis_results.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        expert_token_mapping = data['expert_token_mapping']
        summary = data['summary']
        
        print(f"📊 总专家数: {summary['total_experts']}")
        print(f"🎯 活跃专家数: {summary['active_experts']}")
        print(f"📝 总Token数: {summary['total_tokens']}")
        
        # 随机选择10个专家
        random.seed(49)
        available_experts = list(expert_token_mapping.keys())
        selected_experts = random.sample(available_experts, min(10, len(available_experts)))
        selected_experts = sorted([int(x) for x in selected_experts])
        
        print(f"🎲 选择的专家: {selected_experts}")
        
        # 获取所有领域
        all_domains = set()
        for expert_data in expert_token_mapping.values():
            for token_info in expert_data:
                all_domains.add(token_info['domain'])
        
        domains = sorted(list(all_domains))
        print(f"🏷️ 领域: {domains}")
        
        # 计算每个专家的专注度得分
        expert_scores = {}
        
        for expert_id in selected_experts:
            expert_id_str = str(expert_id)
            expert_data = expert_token_mapping[expert_id_str]
            
            # 统计各领域的激活总量
            domain_activations = defaultdict(float)
            total_activation = 0.0
            
            for token_info in expert_data:
                domain = token_info['domain']
                activation = token_info['activation']
                domain_activations[domain] += activation
                total_activation += activation
            
            # 计算专注度得分
            focus_scores = {}
            for domain in domains:
                if total_activation > 0:
                    focus_scores[domain] = domain_activations[domain] / total_activation
                else:
                    focus_scores[domain] = 0.0
            
            expert_scores[expert_id] = focus_scores
        
        return expert_scores, domains, selected_experts
        
    except Exception as e:
        print(f"❌ 数据加载失败: {e}")
        return None, None, None

def generate_svg_radar_chart():
    """生成优化美观度的SVG格式雷达图"""
    
    expert_scores, domains, selected_experts = load_and_analyze_data()
    
    if expert_scores is None:
        print("❌ 无法生成雷达图，数据加载失败")
        return
    
    # SVG基本设置 - 优化尺寸和布局
    svg_width = 1800   # 进一步增加宽度
    svg_height = 1020  # 调整高度以适应新的间距 - 增加20px
    chart_radius = 75  # 图表半径
    center_x_offset = 200  # 左边距
    center_y_offset = 250  # 上边距 - 增加到100像素安全间距
    chart_spacing_x = 320  # 图表间水平间距
    chart_spacing_y = 260  # 图表间垂直间距 - 从240增加到260，增加20px
    
    # 优化的颜色方案 - 更加和谐的配色
    colors = [
        '#FF6B6B',  # 珊瑚红
        '#4ECDC4',  # 青绿色
        '#45B7D1',  # 天蓝色
        '#96CEB4',  # 薄荷绿
        '#FFEAA7',  # 柠檬黄
        '#DDA0DD',  # 梅花紫
        '#98D8C8',  # 海绿色
        '#F7DC6F',  # 金黄色
        '#BB8FCE',  # 淡紫色
        '#85C1E9'   # 浅蓝色
    ]
    
    # 开始生成SVG
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{svg_width}" height="{svg_height}" xmlns="http://www.w3.org/2000/svg">
<defs>
    <!-- 渐变定义 -->
    <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    
    <!-- 阴影滤镜 -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000020"/>
    </filter>
</defs>

<style>
    .main-title {{ 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        font-size: 32px; 
        font-weight: bold; 
        text-anchor: middle; 
        fill: url(#titleGradient);
        filter: url(#shadow);
    }}
    .subtitle {{ 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        font-size: 16px; 
        text-anchor: middle; 
        fill: #666;
        font-style: italic;
    }}
    .expert-title {{ 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        font-size: 16px; 
        font-weight: bold; 
        text-anchor: middle; 
        fill: #333;
    }}
    .expert-subtitle {{ 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        font-size: 12px; 
        text-anchor: middle; 
        fill: #666;
    }}
    .domain-label {{ 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        font-size: 11px; 
        text-anchor: middle; 
        fill: #444;
        font-weight: 500;
    }}
    .grid-line {{ 
        stroke: #e0e0e0; 
        stroke-width: 1.5; 
        fill: none; 
        opacity: 0.7;
    }}
    .grid-circle {{ 
        stroke: #d0d0d0; 
        stroke-width: 1; 
        fill: none; 
        opacity: 0.5;
    }}
    .radar-area {{ 
        stroke-width: 2.5; 
        fill-opacity: 0.25; 
        filter: url(#shadow);
    }}
    .radar-border {{ 
        stroke-width: 2.5; 
        fill: none; 
        opacity: 0.8;
    }}
    .data-point {{ 
        filter: url(#shadow);
    }}
</style>

<!-- 背景渐变 -->
<rect width="{svg_width}" height="{svg_height}" fill="#f8f9fa" opacity="0.05"/>

<!-- 主标题 -->
<text x="{svg_width//2}" y="50" class="main-title">MoE Expert Domain Specialization Analysis</text>
<text x="{svg_width//2}" y="75" class="subtitle">Radar Chart Visualization (2×5 Layout)</text>

<!-- 分隔线 -->
<line x1="100" y1="90" x2="{svg_width-100}" y2="90" stroke="#ddd" stroke-width="2" opacity="0.5"/>
'''
    
    # 为每个专家生成雷达图
    for i, expert_id in enumerate(selected_experts):
        row = i // 5
        col = i % 5
        
        # 计算中心位置 - 优化间距
        center_x = center_x_offset + col * chart_spacing_x
        center_y = center_y_offset + row * chart_spacing_y
        
        focus_scores = expert_scores[expert_id]
        color = colors[i % len(colors)]
        
        # 找到主要领域和得分
        main_domain = max(focus_scores, key=focus_scores.get)
        main_score = focus_scores[main_domain]
        
        # 添加专家信息区域背景
        svg_content += f'''
<!-- 专家 {expert_id} 信息区域 -->
<rect x="{center_x-80}" y="{center_y - chart_radius - 70}" width="160" height="45" 
      fill="#f8f9fa" stroke="#e9ecef" stroke-width="1" rx="8" opacity="0.8"/>

<text x="{center_x}" y="{center_y - chart_radius - 45}" class="expert-title">Expert #{expert_id}</text>
<text x="{center_x}" y="{center_y - chart_radius - 30}" class="expert-subtitle">
    Primary: {main_domain} ({main_score:.1%})
</text>
'''
        
        # 绘制同心圆网格 - 优化样式
        for j, radius in enumerate([25, 50, 75]):  # 三个同心圆
            opacity = 0.3 + j * 0.1  # 渐变透明度
            svg_content += f'''<circle cx="{center_x}" cy="{center_y}" r="{radius}" 
                              class="grid-circle" style="opacity: {opacity};" />
'''
        
        # 添加刻度标签
        for j, value in enumerate([0.33, 0.67, 1.0]):
            radius = (j + 1) * 25
            svg_content += f'''<text x="{center_x + radius + 5}" y="{center_y - 2}" 
                              style="font-size: 9px; fill: #999; font-family: monospace;">
                              {value:.1f}
                          </text>
'''
        
        # 绘制网格线和领域标签
        for j, domain in enumerate(domains):
            angle = j * 2 * math.pi / len(domains) - math.pi / 2  # 从顶部开始
            
            # 网格线
            end_x = center_x + chart_radius * math.cos(angle)
            end_y = center_y + chart_radius * math.sin(angle)
            svg_content += f'<line x1="{center_x}" y1="{center_y}" x2="{end_x}" y2="{end_y}" class="grid-line" />\n'
            
            # 领域标签 - 优化位置，向圆心收拢
            label_distance = chart_radius + 10  # 从15减少到10，再向圆心收拢5像素
            label_x = center_x + label_distance * math.cos(angle)
            label_y = center_y + label_distance * math.sin(angle) + 4
            
            # 直接添加标签文字，不添加背景矩形
            svg_content += f'<text x="{label_x}" y="{label_y}" class="domain-label">{domain}</text>\n'
        
        # 绘制雷达图数据区域
        points = []
        for j, domain in enumerate(domains):
            angle = j * 2 * math.pi / len(domains) - math.pi / 2
            score = focus_scores[domain]
            radius = score * chart_radius
            
            point_x = center_x + radius * math.cos(angle)
            point_y = center_y + radius * math.sin(angle)
            points.append(f"{point_x},{point_y}")
        
        points_str = " ".join(points)
        
        # 填充区域 - 使用渐变色
        svg_content += f'''<polygon points="{points_str}" fill="{color}" class="radar-area" />
'''
        
        # 边框线 - 更粗更明显
        svg_content += f'''<polygon points="{points_str}" stroke="{color}" class="radar-border" />
'''
        
        # 数据点 - 增加大小和阴影
        for k, point in enumerate(points):
            x, y = point.split(',')
            score = list(focus_scores.values())[k]
            point_size = 3 + score * 3  # 根据数值调整点的大小
            
            svg_content += f'''<circle cx="{x}" cy="{y}" r="{point_size}" 
                              fill="{color}" stroke="white" stroke-width="2" class="data-point" />
'''
            
            # 如果是主要领域，添加特殊标记
            if list(domains)[k] == main_domain:
                svg_content += f'''<circle cx="{x}" cy="{y}" r="{point_size + 3}" 
                                  fill="none" stroke="{color}" stroke-width="3" opacity="0.6" />
'''
    
    # 添加图例
    legend_y = svg_height - 80
    svg_content += f'''
<!-- 图例 -->
<rect x="50" y="{legend_y - 20}" width="{svg_width - 100}" height="60" 
      fill="#f8f9fa" stroke="#dee2e6" stroke-width="1" rx="8" opacity="0.9"/>

<text x="70" y="{legend_y}" style="font-family: 'Segoe UI'; font-size: 14px; font-weight: bold; fill: #333;">
    Legend:
</text>
<text x="130" y="{legend_y}" style="font-family: 'Segoe UI'; font-size: 12px; fill: #666;">
    Circle size indicates specialization strength • Highlighted border shows primary domain
</text>
'''
    
    svg_content += '</svg>'
    
    # 保存SVG文件
    with open('expert_radar_charts_simplified.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print("💾 优化版SVG雷达图已保存到: expert_radar_charts_simplified.svg")
    print("✨ 已优化：标题样式、间距布局、颜色方案、字体、阴影效果、图例说明")

if __name__ == "__main__":
    generate_svg_radar_chart()