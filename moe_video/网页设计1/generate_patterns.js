// 生成随机激活模式的JavaScript脚本
const fs = require('fs');

// 生成真正随机的激活模式
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
    
    // 排序以便于查看
    positions.sort((a, b) => a - b);
    return positions;
}

// 为所有专家生成随机激活模式
function generateAllPatterns() {
    const experts = {
        '247': 'Mathematical Analysis',
        '583': 'Scientific Computing', 
        '916': 'Applied Research',
        '001': 'Physics Analysis',
        '045': 'Engineering Solutions',
        '089': 'Mathematical Modeling',
        '123': 'Chemistry Properties',
        '167': 'Applied Sciences'
    };
    
    const patterns = {};
    
    for (const [expertId, expertName] of Object.entries(experts)) {
        // 为每个专家生成150-250个随机激活圆圈
        const numCircles = Math.floor(Math.random() * 101) + 150; // 150-250
        const pattern = generateRandomActivationPattern(numCircles);
        
        patterns[expertId] = {
            name: expertName,
            circles: numCircles,
            pattern: pattern
        };
        
        console.log(`专家 ${expertId} (${expertName}): ${numCircles} 个激活圆圈`);
    }
    
    return patterns;
}

// 主函数
function main() {
    console.log('正在生成随机激活模式...');
    
    // 设置随机种子以确保每次运行都不同
    Math.seedrandom = Math.seedrandom || function(seed) {
        Math.random = function() {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
    };
    
    const activationPatterns = generateAllPatterns();
    
    // 保存到JSON文件
    const jsonData = JSON.stringify(activationPatterns, null, 2);
    fs.writeFileSync('expert_activation_patterns.json', jsonData, 'utf8');
    
    console.log('\n激活模式已保存到 expert_activation_patterns.json');
    console.log('文件包含了8个专家的随机激活模式，每个专家150-250个激活圆圈');
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = { generateAllPatterns, generateRandomActivationPattern };