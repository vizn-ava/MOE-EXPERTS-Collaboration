const fs = require('fs');

// 生成随机激活模式
function generateRandomActivationPattern(numCircles, totalPositions = 1728) {
    const positions = [];
    const used = new Set();
    
    while (positions.length < numCircles) {
        const pos = Math.floor(Math.random() * totalPositions);
        if (!used.has(pos)) {
            used.add(pos);
            positions.push(pos);
        }
    }
    
    return positions.sort((a, b) => a - b);
}

// 从CSV加载专家信息
function loadExpertsFromCSV() {
    const csvContent = fs.readFileSync('experts_summary_new.csv', 'utf8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    
    const primaryExperts = {};
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        // 简单的CSV解析（处理带引号的字段）
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim()); // 添加最后一个值
        
        if (values.length >= 5) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].replace(/"/g, '') : '';
            });
            
            const primaryId = row['Primary Expert'];
            const primaryName = row['Primary Expert Name'];
            
            // 收集一级专家信息
            if (!primaryExperts[primaryId]) {
                primaryExperts[primaryId] = {
                    name: primaryName,
                    secondary_experts: []
                };
            }
            
            // 添加二级专家到对应的一级专家
            primaryExperts[primaryId].secondary_experts.push({
                index: row['Expert Index'],
                name: row['Expert Name'],
                description: row['Function Description']
            });
        }
    }
    
    return primaryExperts;
}

// 生成所有激活模式
function generateAllPatterns() {
    try {
        console.log('正在从CSV文件加载专家信息...');
        const primaryExperts = loadExpertsFromCSV();
        
        console.log('正在生成随机激活模式...');
        const patterns = {};
        
        // 设置随机种子
        Math.seedrandom = function(seed) {
            Math.random = function() {
                seed = (seed * 9301 + 49297) % 233280;
                return seed / 233280;
            };
        };
        Math.seedrandom(42);
        
        for (const [expertId, expertInfo] of Object.entries(primaryExperts)) {
            // 为每个一级专家生成150-250个随机激活圆圈
            const numCircles = Math.floor(Math.random() * 101) + 150; // 150-250
            const pattern = generateRandomActivationPattern(numCircles);
            
            patterns[expertId] = {
                name: expertInfo.name,
                circles: numCircles,
                pattern: pattern,
                secondary_count: expertInfo.secondary_experts.length,
                secondary_experts: expertInfo.secondary_experts
            };
            
            console.log(`一级专家 ${expertId} (${expertInfo.name}): ${numCircles} 个激活圆圈, ${expertInfo.secondary_experts.length} 个二级专家`);
        }
        
        // 保存到JSON文件
        fs.writeFileSync('expert_activation_patterns.json', JSON.stringify(patterns, null, 2), 'utf8');
        
        console.log('\n激活模式已保存到 expert_activation_patterns.json');
        console.log('文件包含了5个一级专家的随机激活模式，每个专家150-250个激活圆圈');
        console.log('包含语法结构、语义理解、文本处理、技术文档、多语言处理等专家类型');
        
    } catch (error) {
        console.error('生成激活模式时出错:', error);
    }
}

// 运行脚本
generateAllPatterns();