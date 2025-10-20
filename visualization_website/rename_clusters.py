#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重新命名 clustering_results_30_minor.json 中的聚类
根据父节点名称和token列表的共性特征生成新的name和subtitle
"""

import json
from pathlib import Path
from collections import Counter
import re


def analyze_tokens(tokens, parent_name):
    """
    分析token列表的特征，生成合适的name和subtitle
    
    Args:
        tokens: token列表
        parent_name: 父聚类名称
        
    Returns:
        tuple: (name, subtitle)
    """
    # 根据tokens的特征判断类别
    
    # 检查是否主要是动词（过去式/动作）
    past_tense_verbs = [t for t in tokens if t.strip().endswith(('ed', 'ing'))]
    action_verbs = [t for t in tokens if t.strip() in [
        'paid', 'sold', 'pay', 'pays', 'selling', 'purchased', 'sell', 'buy', 'bought',
        'received', 'charged', 'earned', 'invested', 'accepted', 'operated', 'stored',
        'executed', 'computed', 'sorted', 'mapped', 'filtered', 'write', 'read', 'send',
        'activated', 'released', 'bind', 'synthesized', 'prevents', 'divide', 'multiply'
    ]]
    
    # 检查是否是商业/企业相关
    business_entities = [t for t in tokens if t.strip() in [
        'company', 'customer', 'firm', 'business', 'employee', 'employees', 'manager',
        'corporation', 'manufacturer', 'brand', 'insurance', 'bank', 'fund', 'holders'
    ]]
    
    # 检查是否是金融术语
    finance_terms = [t for t in tokens if t.strip() in [
        'interest', 'stock', 'sales', 'cost', 'profit', 'price', 'income', 'payment',
        'discount', 'tax', 'dividend', 'bond', 'revenue', 'capital', 'assets'
    ]]
    
    # 检查是否是化学元素/符号
    chemical_symbols = [t for t in tokens if t.strip() in [
        'cm', 'ml', 'OH', 'nm', 'kg', 'eV', 'Ca', 'Na', 'pH', 'Cu', 'Ag', 'Zn', 
        'Br', 'Mg', 'mg', 'Fe', 'Li', 'Al', 'Si', 'gamma', 'alpha', 'beta', 'lambda'
    ]]
    
    # 检查是否是化学物质
    chemical_matter = [t for t in tokens if t.strip() in [
        'molecules', 'vapor', 'electrons', 'hydrogen', 'acid', 'electron', 'atoms',
        'nitrogen', 'oxygen', 'carbon', 'ions', 'sodium', 'protein', 'dioxide'
    ]]
    
    # 检查是否是生物学实体
    biology_entities = [t for t in tokens if t.strip() in [
        'genes', 'cell', 'species', 'plants', 'organisms', 'chromosome', 'DNA', 'RNA',
        'protein', 'bacteria', 'tissue', 'enzyme', 'membrane', 'nucleus'
    ]]
    
    # 检查是否是前缀/后缀
    prefixes_suffixes = [t for t in tokens if len(t.strip()) <= 3 and t.strip() in [
        'i', 'is', 'a', 'an', 'o', 'in', 'on', 'at', 'to', 'or', 'en', 'al', 'ic',
        'l', 'r', 'y', 'x', 'h', 'c', 'g', 'v', 'b', 'm', 'it', 'as', 'cm', 'ft'
    ]]
    
    # 检查是否是计算机术语
    cs_terms = [t for t in tokens if t.strip() in [
        'IF', 'INT', 'DO', 'IN', 'GO', 'FOR', 'AND', 'OR', 'IS', 'RT', 'ID', 'AB'
    ]]
    
    # 检查是否是数学符号
    math_symbols = [t for t in tokens if t.strip() in [
        'mathrm', 'arrow', 'dot', 'frac', 'sqrt', 'dots', 'bf', 'eq', 'pi', 'ln'
    ]]
    
    # 检查是否是数学/统计概念
    math_concepts = [t for t in tokens if t.strip() in [
        'variance', 'probability', 'matrix', 'vector', 'correlation', 'hypothesis',
        'theorem', 'equation', 'coefficient', 'integral', 'determinant'
    ]]
    
    # 检查是否是命令词
    command_words = [t for t in tokens if t.strip() in [
        'Find', 'Calculate', 'Determine', 'Assume', 'Given', 'Consider', 'Suppose',
        'Compute', 'Explain', 'Evaluate', 'Write', 'Let', 'Return'
    ]]
    
    # 检查是否是时间/度量单位
    units = [t for t in tokens if t.strip() in [
        'annual', 'days', 'weekly', 'monthly', 'week', 'months', 'years', 'hours',
        'minutes', 'seconds', 'miles', 'yards', 'meters', 'gallons', 'pounds', 'grams'
    ]]
    
    # 检查是否是形容词/修饰词
    adjectives = [t for t in tokens if t.strip() in [
        'Net', 'Total', 'Average', 'gross', 'economic', 'social', 'environmental',
        'True', 'False', 'linear', 'binary', 'optimal', 'nearest', 'pure', 'ideal'
    ]]
    
    # 检查是否是人名/专有名词
    proper_nouns = [t for t in tokens if t.strip() in [
        'Johnson', 'Martin', 'Bob', 'John', 'Frank', 'George', 'Darwin', 'Euler', 'Gauss'
    ]]
    
    print(f"\n分析聚类特征 (父节点: {parent_name}):")
    print(f"  - 过去式动词: {len(past_tense_verbs)}")
    print(f"  - 动作动词: {len(action_verbs)}")
    print(f"  - 命令词: {len(command_words)}")
    print(f"  - 商业实体: {len(business_entities)}")
    print(f"  - 金融术语: {len(finance_terms)}")
    print(f"  - 化学符号: {len(chemical_symbols)}")
    print(f"  - 化学物质: {len(chemical_matter)}")
    print(f"  - 生物实体: {len(biology_entities)}")
    print(f"  - 前缀后缀: {len(prefixes_suffixes)}")
    print(f"  - 计算机术语: {len(cs_terms)}")
    print(f"  - 数学符号: {len(math_symbols)}")
    print(f"  - 数学概念: {len(math_concepts)}")
    print(f"  - 单位: {len(units)}")
    print(f"  - 形容词: {len(adjectives)}")
    print(f"  - 专有名词: {len(proper_nouns)}")
    
    # 显示部分示例tokens
    print(f"  - 示例tokens: {tokens[:10]}")
    
    return None, None  # 暂时返回None，先看分析结果


def rename_clusters(input_json, output_json):
    """
    重新命名聚类
    """
    with open(input_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for i, cluster in enumerate(data['clusters']):
        cluster_id = cluster['cluster_id']
        parent_name = cluster['parent_cluster_name']
        tokens = cluster['tokens']
        old_name = cluster['name']
        old_subtitle = cluster['subtitle']
        
        print(f"\n{'='*60}")
        print(f"聚类 {i+1}/30 - ID: {cluster_id}")
        print(f"原名称: {old_name}")
        print(f"原副标题: {old_subtitle}")
        print(f"父节点: {parent_name}")
        print(f"Token数量: {len(tokens)}")
        
        # 分析tokens并生成新名称
        new_name, new_subtitle = analyze_tokens(tokens, parent_name)
    
    print(f"\n{'='*60}")
    print("分析完成！请查看输出并决定如何重命名。")


def main():
    current_dir = Path(__file__).parent
    input_json = current_dir / 'clustering_results_30_minor.json'
    output_json = current_dir / 'clustering_results_30_minor_renamed.json'
    
    if not input_json.exists():
        print(f"错误: 找不到文件 {input_json}")
        return
    
    rename_clusters(input_json, output_json)


if __name__ == '__main__':
    main()

