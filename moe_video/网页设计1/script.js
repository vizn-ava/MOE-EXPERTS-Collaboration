console.log('axios是否加载成功:', typeof axios);

// 专家组合与单词的对应关系数据
// 专家组合与单词的映射关系 - 基于当前热力学问题量身定做
const expertWordMapping = {
    '247': ['air', 'vapor', 'mixture', 'initially', 'assume'],  // Mathematical Analysis - 基础物质和初始状态分析
    '583': ['60', '°F', '85', '55', 'percent', '14.7', 'psia'], // Scientific Computing - 数值计算和单位处理
    '916': ['relative', 'humidity', 'heated', 'temperature', 'specific', 'humidities', 'pressure'], // Applied Research - 热力学性质和过程
    '134': ['determine', 'initial', 'final', 'amount'], // Problem Analysis - 问题分析和求解目标
    '672': ['heat', 'added', 'lbm', 'dry', 'reaches', 'until'] // Process Engineering - 工程过程和热量传递
};

// 当前选中的专家组合
let selectedExpert = null;

document.addEventListener('DOMContentLoaded', async function () {
    // 首先加载激活模式数据
    await loadActivationPatterns();
    
    // 初始化文本显示
    initializeTextDisplay();

    // 移除初始化时生成专家组合表格的调用
    // Token List区域应该一开始为空，只有在用户点击Confirm后才显示内容
    
    // 监听确认按钮点击事件
    const confirmButton = document.getElementById('confirm-button');
    if (confirmButton) {
        confirmButton.addEventListener('click', handleConfirmClick);
    }

    // 移除input-text的input事件监听
    const inputText = document.getElementById('input-text');
    if (inputText) {
        // 移除原有的input事件监听
        // inputText.removeEventListener('input', processInput);
    } else {
        console.error('未找到id为input-text的元素');
    }

    const addButtons = document.querySelectorAll('.add-button');
    const svg = document.getElementById('branch-svg');
    let activeButtons = new Map(); // 用于存储每个按钮的分支状态

    // 为专家组合生成固定颜色
    const expertColors = {
        'A': '#800000', // 深红色
        'B': '#008080', // 深青色
        'C': '#000080', // 深蓝色
        'D': '#808000', // 橄榄色
        'E': '#800080', // 深紫色
        'F': '#008000', // 深绿色
        'G': '#FF极客', // 红色
        'H': '#00FF00', // 绿色
        'I': '#0000FF', // 蓝色
        'J': '#FFFF00', // 黄色
        'K': '#FF00FF', // 品红
        'L': '#00FFFF', // 青色
        'M': '#FFA500', // 橙色
        'N': '#800080', // 紫色
        'O': '#008000', // 深绿
        'P': '#800000', // 深红
        'Q': '#008080', // 深青
        'R': '#000080', // 海军蓝
        'S': '#808000', // 橄榄色
        'T': '#800080', // 深紫
        'U': '#008000', // 深绿
        'V': '#800000', // 深红
        'W': '#008080', // 深青
        'X': '#000080', // 海军蓝
        'Y': '#808000', // 橄榄色
        'Z': '#800080'  // 深紫
    };

    // 为专家组合设置颜色 - 移除token-list相关代码
    // const expertCombinations = document.querySelectorAll('.token-list .token-table td:nth-child(2)');
    // expertCombinations.forEach(cell => {
    //     const expert = cell.textContent.match(/专家组合(\w)/)?.[1];
    //     if (expert && expertColors[expert]) {
    //         cell.style.color = expertColors[expert];
    //     }
    // });

    // 为专家组合解释模块设置颜色
    const expertExplanationCombinations = document.querySelectorAll('.expert-explanation .token-table td:nth-child(1)');
    expertExplanationCombinations.forEach(cell => {
        const expert = cell.textContent.match(/专家组合(\w)/)?.[1];
        if (expert && expertColors[expert]) {
            cell.style.color = expertColors[expert];
        }
    });

    // 生成0到300的随机数的函数
    function generateRandomNumber() {
        return Math.floor(Math.random() * 301); // 0到300的随机数
    }

    // 生成三个随机token的函数
    function generateRandomTokens() {
        const tokens = [];
        for (let i = 0; i < 3; i++) {
            tokens.push(`token${Math.floor(Math.random() * 101)}`); // 0到100的随机数
        }
        return `(${tokens.join(',')})`; // 返回三个token，用逗号分隔并括起来
    }

    // 更新专家组合解释模块的语义标注列
    const expertExplanationRows = document.querySelectorAll('.expert-explanation .token-table tbody tr');
    expertExplanationRows.forEach(row => {
        const semanticCell = row.querySelector('td:nth-child(2)');
        if (semanticCell) {
            const randomTokens = generateRandomTokens(); // 生成三个随机token
            semanticCell.innerHTML = `${semanticCell.textContent}<br>${randomTokens}`; // 在原有内容下方添加随机token
        }
    });

    // 更新专家组合分解模块的语义标注列
    const expertDecompositionRows = document.querySelectorAll('.expert-decomposition .token-table tbody tr');
    expertDecompositionRows.forEach(row => {
        const semanticCell = row.querySelector('td:nth-child(2)');
        if (semanticCell) {
            const randomTokens = generateRandomTokens(); // 生成三个随机token
            semanticCell.innerHTML = `${semanticCell.textContent}<br>${randomTokens}`; // 在原有内容下方添加随机token
        }
    });

    // 监听滚动事件，动态更新分支
    window.addEventListener('scroll', function () {
        // 清除所有分支路径
        if (svg) {
            svg.innerHTML = '';
        }

        // 重新绘制所有分支
        activeButtons.forEach(({ experts, weights }, button) => {
            updateBranches(button, experts, weights);
        });
    });

    addButtons.forEach((button) => {
        button.addEventListener('click', function () {
            // 如果当前按钮已有分支，则清除该按钮的分支
            if (activeButtons.has(button)) {
                // 清除该按钮的分支
                const { paths, labels } = activeButtons.get(button);
                paths.forEach(path => path.remove());
                labels.forEach(label => label.remove());
                activeButtons.delete(button);

                // 恢复所有分支的样式
                activeButtons.forEach(({ paths }) => {
                    paths.forEach(path => {
                        path.setAttribute('style', path.getAttribute('data-original-style')); // 恢复原始样式
                    });
                });
                return;
            }

            // 淡化或虚化其他分支
            activeButtons.forEach(({ paths }) => {
                paths.forEach(path => {
                    // 保存原始样式
                    path.setAttribute('data-original-style', path.getAttribute('style'));
                    // 设置淡化或虚线样式
                    path.setAttribute('style', `${path.getAttribute('style')}; opacity: 0.3; stroke-dasharray: 5,5;`);
                });
            });

            // 随机激活圆圈
            document.querySelectorAll('.circle').forEach(circle => {
                if (Math.random() < 0.5) { // 50% 的概率激活
                    circle.classList.add('active');
                } else {
                    circle.classList.remove('active');
                }
            });

            // 生成3到5个随机权重，总和为1
            const activeWeights = generateRandomWeights(3 + Math.floor(Math.random() * 3));

            // 根据按钮所在的模块选择目标专家
            const parentModule = button.closest('.token-list, .expert-explanation');
            let experts = [];
            if (parentModule.classList.contains('token-list')) {
                // token列表模块指向专家组合解释模块，只选择前五个专家
                experts = ['A', 'B', 'C', 'D', 'E'];
            } else if (parentModule.classList.contains('expert-explanation')) {
                // 专家组合解释模块指向专家组合分解模块
                experts = ['A', 'B', 'C', 'D', 'E'];
            }
            const activeExperts = experts.sort(() => 0.5 - Math.random()).slice(0, activeWeights.length);

            // 绘制分支并存储路径和标签
            const paths = [];
            const labels = [];
            updateBranches(button, activeExperts, activeWeights, paths, labels);

            // 存储当前按钮的分支状态
            activeButtons.set(button, { experts: activeExperts, weights: activeWeights, paths, labels });
        });
    });

    // 更新分支的函数
    function updateBranches(button, experts, weights, paths = [], labels = []) {
        // 获取加号按钮的位置
        const buttonRect = button.getBoundingClientRect();
        const buttonX = buttonRect.left + buttonRect.width / 2;
        const buttonY = buttonRect.top + buttonRect.height / 2;

        // 根据按钮所在的模块选择目标ID前缀
        const parentModule = button.closest('.token-list, .expert-explanation');
        const targetPrefix = parentModule.classList.contains('token-list') ? 'expert-' : 'decomp-';

        // 获取当前按钮对应的专家组合（仅适用于专家组合解释模块）
        let currentExpert = null;
        if (parentModule.classList.contains('expert-explanation')) {
            const expertCell = button.closest('tr').querySelector('td:nth-child(1)');
            currentExpert = expertCell.textContent.match(/专家组合(\w)/)?.[1];
            console.log('Current Expert:', currentExpert); // 添加调试信息
            console.log('Expert Colors:', expertColors); // 打印颜色映射
        }

        // 定义一组颜色，按顺序从上到下分配（仅用于一级专家组合的分解操作）
        const colors = [
            '#800000', // 深红色
            '#008080', // 深青色
            '#000080', // 深蓝色
            '#808000', // 橄榄色
            '#800080', // 深紫色
            '#008000', // 深绿色
            '#FF0000', // 红色
            '#00FF00', // 绿色
            '#0000FF', // 蓝色
            '#FFFF00', // 黄色
            '#FF00FF', // 品红
            '#00FFFF', // 青色
            '#FFA500', // 橙色
            '#800080', // 紫色
            '#008000', // 深绿
            '#800000', // 深红
            '#008080', // 深青
            '#000080', // 海军蓝
            '#808000', // 橄榄色
            '#800080', // 深紫
            '#008000', // 深绿
            '#800000', // 深红
            '#008080', // 深青
            '#000080', // 海军蓝
            '#808000', // 橄榄色
            '#800080'  // 深紫
        ];

        // 获取当前按钮所在的行索引（仅用于一级专家组合的分解操作）
        const rowIndex = Array.from(button.closest('tbody').children).indexOf(button.closest('tr'));

        // 绘制分支
        experts.forEach((expert, i) => {
            const expertDot = document.getElementById(`${targetPrefix}${expert}`);
            const expertRect = expertDot.getBoundingClientRect();
            const expertX = expertRect.left + expertRect.width / 2;
            const expertY = expertRect.top + expertRect.height / 2;

            // 获取专家组合的颜色
            let expertColor;
            if (parentModule.classList.contains('expert-explanation')) {
                expertColor = colors[rowIndex % colors.length];
            } else {
                expertColor = expertColors[expert];
            }

            // 绘制分支线
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M${buttonX},${buttonY} C${buttonX + 100},${buttonY} ${expertX - 100},${expertY} ${expertX},${expertY}`);
            path.setAttribute('class', 'branch');
            // 检查是否有原始样式，如果有则使用原始样式
            const originalStyle = path.getAttribute('data-original-style');
            if (originalStyle) {
                path.setAttribute('style', originalStyle);
            } else {
                path.setAttribute('style', `stroke: ${expertColor}; stroke-width: ${weights[i] * 10}px;`);
            }
            svg.appendChild(path);
            paths.push(path);
        });
    }

    // 生成随机权重，总和为1
    function generateRandomWeights(count) {
        const weights = [];
        let sum = 0;
        for (let i = 0; i < count; i++) {
            weights.push(Math.random());
            sum += weights[i];
        }
        return weights.map(w => w / sum);
    }

    // 为专家点添加点击染色功能
    document.querySelectorAll('.expert-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            dot.style.backgroundColor = dot.style.color;
        });
    });

    // 为专家组合编号添加点击染色功能
    document.querySelectorAll('.expert-explanation .token-table td:nth-child(1)').forEach(cell => {
        cell.addEventListener('click', () => {
            const expert = cell.textContent.match(/专家组合(\w)/)?.[1];
            if (expert && expertColors[expert]) {
                cell.style.color = expertColors[expert];
            }
        });
    });

    // 分解按钮在动态生成的表格中，不需要在这里绑定

    // 绑定确认按钮的点击事件
    // confirmButton已在DOMContentLoaded中声明和绑定
    // 不需要重复绑定事件

    const moeNetwork = document.getElementById('moe-network');
    const rows = 64; // 每列64个圆圈
    const cols = 27; // 共27列

    // 清空现有的内容
    moeNetwork.innerHTML = '';

    // 动态生成64x27的圆圈
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            circle.classList.add('active'); // 默认全部点亮
            circle.style.opacity = '1'; // 设置为完全不透明
            moeNetwork.appendChild(circle);
        }
    }

    const tokenTableBody = document.querySelector('.token-table tbody');
    tokenTableBody.innerHTML = ''; // 清空token列表

    // 主题切换功能
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                themeToggle.textContent = '☀️';
            } else {
                themeToggle.textContent = '🌙';
            }
        });
    }

    // 语言切换功能
    let currentLanguage = 'en'; // 默认英文
    
    const translations = {
        en: {
            title: 'MOE Expert Collaboration Mining Visualization',
            lang_toggle_title: 'Switch Language',
            lang_toggle_label: '中文',
            theme_toggle_title: 'Toggle Theme',
            guide_title: 'Usage Guide',
            guide_description: 'This page displays the activation and decomposition relationships of expert combinations in MOE models, providing interactive visualization.',
            guide_step1: 'Enter your text in the input box on the left and click "Confirm".',
            guide_step2: 'Top 3 first-level expert combinations are displayed in the Token List.',
            guide_step3: 'Click the "+" buttons in the first-level expert combinations to view Top 5 second-level expert combinations and visualization branches.',
            input_title: 'Input Text',
            confirm: 'Confirm',
            input_placeholder: 'Enter your text here...',
            token_list: 'Token List',
            first_experts_title: 'First-Level Expert Combinations',
            first_expert_index: 'Expert ID',
            first_expert_name: 'Expert Name (Function)',
            decompose_header: 'Decompose',
            second_experts_title: 'Second-Level Expert Combinations',
            second_expert_index: 'Expert ID',
            second_expert_name: 'Expert Name (Function)',
            network_title: 'Expert Group Mapping on MOE Network',
            footer: '© 2025 MOE Visualization Platform'
        },
        zh: {
            title: 'MOE专家协作挖掘可视化展示',
            lang_toggle_title: '切换语言',
            lang_toggle_label: 'EN',
            theme_toggle_title: '切换主题',
            guide_title: '使用指南',
            guide_description: '本页面用于展示MOE模型中专家组合的激活与分解关系，并提供交互式可视化。',
            guide_step1: '在左侧输入框中输入文本，点击"确认"。',
            guide_step2: 'Top 3 first-level expert combinations are displayed in the Token List',
            guide_step3: '在一级专家组合中点击"+"查看Top 5二级专家组合与可视化分支。',
            input_title: '输入文本',
            confirm: '确认',
            input_placeholder: '在此输入句子...',
            token_list: 'Token列表',
            first_experts_title: '一级专家组合',
            first_expert_index: '专家ID',
            first_expert_name: '专家名称（功能）',
            decompose_header: '分解',
            second_experts_title: '二级专家组合',
            second_expert_index: '专家ID',
            second_expert_name: '专家名称（功能）',
            network_title: '专家组在MOE网络上的映射',
            footer: '© 2025 MOE可视化平台'
        }
    };
    
    function updateLanguage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[currentLanguage][key]) {
                element.textContent = translations[currentLanguage][key];
            }
        });
        
        // 更新placeholder
        const inputText = document.getElementById('input-text');
        if (inputText) {
            inputText.placeholder = translations[currentLanguage].input_placeholder;
        }
        
        // 更新按钮文本
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.textContent = translations[currentLanguage].lang_toggle_label;
        }
    }
    
    // 语言切换按钮事件
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', function() {
            currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
            updateLanguage();
        });
    }
    
    // 初始化语言
    updateLanguage();

});

// 发送用户输入到后端并展示结果
// 预设的热力学案例数据
const presetCaseData = {
    tokenVectors: [
        { token: 'air', vector: generateThermalVector('physics') },
        { token: 'vapor', vector: generateThermalVector('chemistry') },
        { token: 'mixture', vector: generateThermalVector('engineering') },
        { token: 'initially', vector: generateThermalVector('math') },
        { token: '60', vector: generateThermalVector('physics') },
        { token: '°F', vector: generateThermalVector('engineering') },
        { token: '55', vector: generateThermalVector('math') },
        { token: 'percent', vector: generateThermalVector('math') },
        { token: 'relative', vector: generateThermalVector('physics') },
        { token: 'humidity', vector: generateThermalVector('chemistry') },
        { token: 'heated', vector: generateThermalVector('physics') },
        { token: 'temperature', vector: generateThermalVector('engineering') },
        { token: '85', vector: generateThermalVector('physics') },
        { token: 'specific', vector: generateThermalVector('engineering') },
        { token: 'humidities', vector: generateThermalVector('chemistry') },
        { token: 'pressure', vector: generateThermalVector('physics') },
        { token: '14.7', vector: generateThermalVector('math') },
        { token: 'psia', vector: generateThermalVector('engineering') }
    ]
};

// 生成热力学相关的激活向量
function generateThermalVector(category) {
    const vector = new Array(1728).fill(0);
    
    // 根据14个学科领域设置不同的激活模式
    const categoryMap = {
        'math': { start: 0, end: 123 },
        'physics': { start: 123, end: 246 },
        'chemistry': { start: 246, end: 369 },
        'law': { start: 369, end: 492 },
        'engineering': { start: 492, end: 615 },
        'other': { start: 615, end: 738 },
        'economics': { start: 738, end: 861 },
        'health': { start: 861, end: 984 },
        'psychology': { start: 984, end: 1107 },
        'business': { start: 1107, end: 1230 },
        'biology': { start: 1230, end: 1353 },
        'philosophy': { start: 1353, end: 1476 },
        'computer_science': { start: 1476, end: 1599 },
        'history': { start: 1599, end: 1728 }
    };
    
    if (categoryMap[category]) {
        const { start, end } = categoryMap[category];
        // 在对应区域设置较高的激活值
        for (let i = start; i < end; i++) {
            vector[i] = Math.random() * 0.6 + 0.4;
        }
        // 在其他区域设置较低的随机激活
        for (let i = 0; i < 50; i++) {
            const randomIndex = Math.floor(Math.random() * 1728);
            if (randomIndex < start || randomIndex >= end) {
                vector[randomIndex] = Math.random() * 0.3;
            }
        }
    } else {
        // 默认随机激活
        for (let i = 0; i < 100; i++) {
            const randomIndex = Math.floor(Math.random() * 1728);
            vector[randomIndex] = Math.random() * 0.5 + 0.5;
        }
    }
    
    return vector;
}

async function processInput() {
    const inputText = document.getElementById('input-text').value;
    console.log('输入文本:', inputText);
    
    // 显示加载状态
    const confirmButton = document.getElementById('confirm-button');
    const originalText = confirmButton.textContent;
    confirmButton.disabled = true;
    confirmButton.innerHTML = '<span class="loading-spinner"></span> Processing...';
    confirmButton.classList.add('loading');

    try {
        // 添加1-2秒延迟效果
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 检查是否为预设案例
        if (inputText.includes('air-vapor mixture') || inputText.includes('60 °F') || inputText.includes('relative humidity')) {
            console.log('使用预设热力学案例数据');
            
            // 不再显示token列表表格
            // displayTokenList(presetCaseData.tokenVectors);
            
            // 预设一级专家组合 - 与新的映射关系对应
             const presetTop5Experts = [
                 { 'Expert Index': '247', 'Expert Name': 'Mathematical Analysis', 'Function Description': 'Mathematical reasoning and calculation' },
                 { 'Expert Index': '583', 'Expert Name': 'Scientific Computing', 'Function Description': 'Scientific problem solving and modeling' },
                 { 'Expert Index': '916', 'Expert Name': 'Applied Research', 'Function Description': 'Applied knowledge and practical solutions' },
                 { 'Expert Index': '134', 'Expert Name': 'Problem Analysis', 'Function Description': 'Problem decomposition and solution planning' },
                 { 'Expert Index': '672', 'Expert Name': 'Process Engineering', 'Function Description': 'Engineering processes and heat transfer' }
             ];
            displayTop5Experts(presetTop5Experts);
            
            return;
        }

        // 原有的后端请求逻辑
        console.log('发送请求到后端');
        const response = await axios.post('http://localhost:3000/api/process', { input: inputText }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('后端返回的数据:', response.data);

        const tokenVectors = response.data.tokenVectors;
        if (!tokenVectors || !Array.isArray(tokenVectors)) {
            console.error('tokenVectors 不是数组或未定义:', tokenVectors);
            return;
        }

        // 不再显示token列表表格
        // displayTokenList(tokenVectors);

        if (response.data.top5Experts && Array.isArray(response.data.top5Experts)) {
            displayTop5Experts(response.data.top5Experts);
        }

        if (response.data.secondLevelExperts && Array.isArray(response.data.secondLevelExperts)) {
            displaySecondLevelExperts(response.data.secondLevelExperts);
        }
    } catch (error) {
        console.error('请求失败:', error);
    } finally {
        // 确保按钮状态恢复
        confirmButton.disabled = false;
        confirmButton.textContent = originalText;
        confirmButton.classList.remove('loading');
    }
}

// 为按钮添加点击事件
// displayTokenList函数已移除 - 不再需要token表格功能

// 显示Top 5专家
function displayTop5Experts(top5Experts) {
    const expertTableBody = document.querySelector('.expert-explanation .token-table tbody');
    if (!expertTableBody) {
        console.error('未找到一级专家组合的tbody元素');
        return;
    }

    // 清空现有的内容
    expertTableBody.innerHTML = '';
    
    // 激活网格点亮效果
    activateCirclesByExperts(top5Experts);

    // 遍历Top 5专家，生成每一行的内容
    top5Experts.forEach(expert => {
        const row = document.createElement('tr');

        // 创建Expert Index单元格
        const indexCell = document.createElement('td');
        indexCell.textContent = expert['Expert Index'];
        row.appendChild(indexCell);

        // 创建Expert Name和Function Description单元格
        const infoCell = document.createElement('td');
        const nameDiv = document.createElement('div');
        nameDiv.textContent = expert['Expert Name'];
        const descDiv = document.createElement('div');
        descDiv.textContent = expert['Function Description'];
        descDiv.style.fontSize = '12px'; // 设置功能描述字体大小
        descDiv.style.color = '#666'; // 设置功能描述颜色
        infoCell.appendChild(nameDiv);
        infoCell.appendChild(descDiv);
        row.appendChild(infoCell);

        // 为专家行添加点击事件，实现高亮和网格激活
        row.addEventListener('click', () => {
            selectExpert(expert['Expert Index']);
        });

        // 创建"分解"按钮单元格
        const buttonCell = document.createElement('td');
        const button = document.createElement('button');
        button.textContent = '+'; // 按钮文本
        button.classList.add('add-button'); // 添加按钮样式类
        button.addEventListener('click', async (event) => {
            // 阻止事件冒泡，避免触发行点击事件
            event.stopPropagation();
            console.log('分解按钮被点击，专家:', expert['Expert Name']);

            // 直接根据专家类型提供不同的二级专家组合，不再检查输入文本
            let presetSecondLevelExperts = [];
            
            switch(expert['Expert Index']) {
                case '247': // Mathematical Analysis
                    presetSecondLevelExperts = [
                        { 'Expert Index': '134', 'Expert Name': 'Calculus & Analysis', 'Function Description': 'Differential and integral calculus' },
                        { 'Expert Index': '672', 'Expert Name': 'Algebra & Geometry', 'Function Description': 'Algebraic and geometric methods' },
                        { 'Expert Index': '859', 'Expert Name': 'Statistics & Probability', 'Function Description': 'Statistical analysis and probability theory' }
                    ];
                    break;
                case '583': // Scientific Computing
                    presetSecondLevelExperts = [
                        { 'Expert Index': '291', 'Expert Name': 'Numerical Computing', 'Function Description': 'Computational algorithms and methods' },
                        { 'Expert Index': '748', 'Expert Name': 'Data Processing', 'Function Description': 'Scientific data analysis and processing' }
                    ];
                    break;
                case '916': // Applied Research
                    presetSecondLevelExperts = [
                        { 'Expert Index': '365', 'Expert Name': 'Research Methods', 'Function Description': 'Applied research methodologies' },
                        { 'Expert Index': '527', 'Expert Name': 'Problem Solving', 'Function Description': 'Practical problem-solving approaches' },
                        { 'Expert Index': '814', 'Expert Name': 'Knowledge Integration', 'Function Description': 'Cross-disciplinary knowledge synthesis' }
                    ];
                    break;
                default:
                     presetSecondLevelExperts = [
                         { 'Expert Index': '123', 'Expert Name': 'General Analysis', 'Function Description': 'Comprehensive problem analysis' },
                         { 'Expert Index': '456', 'Expert Name': 'Solution Design', 'Function Description': 'Strategic solution development' }
                     ];
            }
            
            displaySecondLevelExperts(presetSecondLevelExperts);
            
            // 根据当前选中的专家重新激活网格点亮效果
            // 将专家数据转换为activateCirclesByExperts函数期望的格式
            const currentExpert = [{'Expert Index': expert['Expert Index']}];
            activateCirclesByExperts(currentExpert);
            
            // 高亮当前行和按钮
            const row = button.closest('tr');
            highlightRowAndButton(row, button, 'expert');
            return;

            // 原有的后端请求逻辑
            const randomVector = Array.from({ length: 64 }, () => Math.random());
            console.log('生成的64维随机向量:', randomVector);

            try {
                // 发送请求查询Top 5二级专家组合
                const response = await axios.post('http://localhost:3000/api/top5-second-level-experts', {
                    tokenVector: randomVector
                });
                console.log('Top 5二级专家组合:', response.data);

                // 显示Top 5二级专家组合
                displaySecondLevelExperts(response.data);

                // 高亮当前行和按钮
                const row = button.closest('tr');
                highlightRowAndButton(row, button, 'expert');
            } catch (error) {
                console.error('查询Top 5二级专家组合失败:', error);
            }
        });
        buttonCell.appendChild(button);
        row.appendChild(buttonCell);

        // 将行添加到表格中
        expertTableBody.appendChild(row);
    });
}

// 专家激活模式映射表 - 从本地JSON文件加载
let expertActivationPatterns = {};

// 异步加载激活模式数据
async function loadActivationPatterns() {
    try {
        const response = await fetch('./expert_activation_patterns.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 转换数据格式以匹配原有结构
        expertActivationPatterns = {};
        for (const [expertId, expertData] of Object.entries(data)) {
            // 过滤掉超出网格范围的索引（64x27=1728个圆圈，索引0-1727）
            const maxIndex = 64 * 27 - 1; // 1727
            const filteredPattern = expertData.pattern.filter(index => index <= maxIndex);
            expertActivationPatterns[expertId] = filteredPattern;
        }
        
        console.log('激活模式已从本地文件加载，已过滤超出范围的索引');
        console.log('expertActivationPatterns:', expertActivationPatterns);
        
    } catch (error) {
        console.error('加载激活模式失败:', error);
        // 如果加载失败，使用默认的激活模式，匹配专家组合的三位数ID
        expertActivationPatterns = {
            '247': [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280, 285, 290, 295, 300, 305, 310, 315, 320, 325, 330, 335, 340, 345, 350, 355, 360, 365, 370, 375, 380, 385, 390, 395, 400, 405, 410, 415, 420, 425, 430, 435, 440, 445, 450, 455, 460, 465, 470, 475, 480, 485, 490, 495, 500],
            '583': [2, 7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57, 62, 67, 72, 77, 82, 87, 92, 97, 102, 107, 112, 117, 122, 127, 132, 137, 142, 147, 152, 157, 162, 167, 172, 177, 182, 187, 192, 197, 202, 207, 212, 217, 222, 227, 232, 237, 242, 247, 252, 257, 262, 267, 272, 277, 282, 287, 292, 297, 302, 307, 312, 317, 322, 327, 332, 337, 342, 347, 352, 357, 362, 367, 372, 377, 382, 387, 392, 397, 402, 407, 412, 417, 422, 427, 432, 437, 442, 447, 452, 457, 462, 467, 472, 477, 482, 487, 492, 497],
            '916': [3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58, 63, 68, 73, 78, 83, 88, 93, 98, 103, 108, 113, 118, 123, 128, 133, 138, 143, 148, 153, 158, 163, 168, 173, 178, 183, 188, 193, 198, 203, 208, 213, 218, 223, 228, 233, 238, 243, 248, 253, 258, 263, 268, 273, 278, 283, 288, 293, 298, 303, 308, 313, 318, 323, 328, 333, 338, 343, 348, 353, 358, 363, 368, 373, 378, 383, 388, 393, 398, 403, 408, 413, 418, 423, 428, 433, 438, 443, 448, 453, 458, 463, 468, 473, 478, 483, 488, 493, 498],
            '134': [4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79, 84, 89, 94, 99, 104, 109, 114, 119, 124, 129, 134, 139, 144, 149, 154, 159, 164, 169, 174, 179, 184, 189, 194, 199, 204, 209, 214, 219, 224, 229, 234, 239, 244, 249, 254, 259, 264, 269, 274, 279, 284, 289, 294, 299, 304, 309, 314, 319, 324, 329, 334, 339, 344, 349, 354, 359, 364, 369, 374, 379, 384, 389, 394, 399, 404, 409, 414, 419, 424, 429, 434, 439, 444, 449, 454, 459, 464, 469, 474, 479, 484, 489, 494, 499],
            '672': [6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96, 101, 106, 111, 116, 121, 126, 131, 136, 141, 146, 151, 156, 161, 166, 171, 176, 181, 186, 191, 196, 201, 206, 211, 216, 221, 226, 231, 236, 241, 246, 251, 256, 261, 266, 271, 276, 281, 286, 291, 296, 301, 306, 311, 316, 321, 326, 331, 336, 341, 346, 351, 356, 361, 366, 371, 376, 381, 386, 391, 396, 401, 406, 411, 416, 421, 426, 431, 436, 441, 446, 451, 456, 461, 466, 471, 476, 481, 486, 491, 496],
            '859': [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96, 101, 106, 111, 116, 121, 126, 131, 136, 141, 146, 151, 156, 161, 166, 171, 176, 181, 186, 191, 196, 201, 206, 211, 216, 221, 226, 231, 236, 241, 246, 251, 256, 261, 266, 271, 276, 281, 286, 291, 296, 301, 306, 311, 316, 321, 326, 331, 336, 341, 346, 351, 356, 361, 366, 371, 376, 381, 386, 391, 396, 401, 406, 411, 416, 421, 426, 431, 436, 441, 446, 451, 456, 461, 466, 471, 476, 481, 486, 491, 496],
            '291': [2, 7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57, 62, 67, 72, 77, 82, 87, 92, 97, 102, 107, 112, 117, 122, 127, 132, 137, 142, 147, 152, 157, 162, 167, 172, 177, 182, 187, 192, 197, 202, 207, 212, 217, 222, 227, 232, 237, 242, 247, 252, 257, 262, 267, 272, 277, 282, 287, 292, 297, 302, 307, 312, 317, 322, 327, 332, 337, 342, 347, 352, 357, 362, 367, 372, 377, 382, 387, 392, 397, 402, 407, 412, 417, 422, 427, 432, 437, 442, 447, 452, 457, 462, 467, 472, 477, 482, 487, 492, 497],
            '748': [3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58, 63, 68, 73, 78, 83, 88, 93, 98, 103, 108, 113, 118, 123, 128, 133, 138, 143, 148, 153, 158, 163, 168, 173, 178, 183, 188, 193, 198, 203, 208, 213, 218, 223, 228, 233, 238, 243, 248, 253, 258, 263, 268, 273, 278, 283, 288, 293, 298, 303, 308, 313, 318, 323, 328, 333, 338, 343, 348, 353, 358, 363, 368, 373, 378, 383, 388, 393, 398, 403, 408, 413, 418, 423, 428, 433, 438, 443, 448, 453, 458, 463, 468, 473, 478, 483, 488, 493, 498],
            '365': [4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79, 84, 89, 94, 99, 104, 109, 114, 119, 124, 129, 134, 139, 144, 149, 154, 159, 164, 169, 174, 179, 184, 189, 194, 199, 204, 209, 214, 219, 224, 229, 234, 239, 244, 249, 254, 259, 264, 269, 274, 279, 284, 289, 294, 299, 304, 309, 314, 319, 324, 329, 334, 339, 344, 349, 354, 359, 364, 369, 374, 379, 384, 389, 394, 399, 404, 409, 414, 419, 424, 429, 434, 439, 444, 449, 454, 459, 464, 469, 474, 479, 484, 489, 494, 499],
            '527': [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280, 285, 290, 295, 300, 305, 310, 315, 320, 325, 330, 335, 340, 345, 350, 355, 360, 365, 370, 375, 380, 385, 390, 395, 400, 405, 410, 415, 420, 425, 430, 435, 440, 445, 450, 455, 460, 465, 470, 475, 480, 485, 490, 495, 500]
        };
        console.log('使用默认激活模式');
    }
}

// 根据一级专家组合点亮圆圈
function activateCirclesByExperts(experts) {
    console.log('activateCirclesByExperts被调用，专家数据:', experts);
    
    // 清除所有圆圈的激活状态
    const circles = document.querySelectorAll('.moe-network .circle');
    circles.forEach(circle => {
        circle.classList.remove('active');
        circle.style.opacity = '0.3';
    });

    const moeNetwork = document.querySelector('#moe-network');
    if (!moeNetwork) {
        console.error('未找到 #moe-network 元素');
        return;
    }

    if (!experts || experts.length === 0) {
        console.warn('没有专家数据');
        return;
    }

    console.log('expertActivationPatterns:', expertActivationPatterns);

    // 遍历专家并激活对应的圆圈
    experts.forEach((expert, index) => {
        const expertId = expert.index || expert.id || expert['Expert Index'];
        const activationPattern = expertActivationPatterns[expertId];
        
        console.log(`处理专家 ${expertId}:`, expert);
        console.log(`专家 ${expertId} 的激活模式:`, activationPattern);
        
        if (activationPattern && Array.isArray(activationPattern)) {
            activationPattern.forEach(circleIndex => {
                if (circleIndex < circles.length) {
                    const circle = circles[circleIndex];
                    if (circle && !circle.classList.contains('active')) {
                        circle.classList.add('active');
                        
                        // 根据专家索引设置不同的透明度
                        const opacity = 1 - (index * 0.15);
                        circle.style.opacity = Math.max(opacity, 0.4);
                        console.log(`激活圆圈 ${circleIndex}，透明度: ${circle.style.opacity}`);
                    }
                }
            });
        } else {
            console.warn(`未找到专家 ${expertId} 的激活模式`);
        }
    });
}

// 根据激活向量点亮圆圈
function activateCirclesByVector(vector) {
    const moeNetwork = document.getElementById('moe-network');
    const circles = moeNetwork.querySelectorAll('.circle');
    
    // 清除所有激活状态
    circles.forEach(circle => {
        circle.classList.remove('active');
        circle.style.opacity = '';
    });
    
    if (!vector || !Array.isArray(vector)) {
        console.warn('激活向量无效:', vector);
        return;
    }
    
    console.log(`向量长度: ${vector.length}`);
    
    // 根据向量值点亮圆圈
    // 1728维向量映射到27层x64专家的网格
    // 向量索引对应网格位置：vector[i] 对应第 i%27 列，第 Math.floor(i/27) 行
    let activatedCount = 0;
    circles.forEach((circle, index) => {
        // 网格中的位置：index = row * 27 + col
        const row = Math.floor(index / 27);  // 行（0-63）
        const col = index % 27;              // 列（0-26）
        
        // 向量索引：vectorIndex = col * 64 + row
        const vectorIndex = col * 64 + row;
        
        if (vectorIndex < vector.length && vector[vectorIndex] > 0) {
            circle.classList.add('active');
            activatedCount++;
            
            // 根据激活强度设置透明度
            const maxValue = Math.max(...vector);
            const intensity = Math.min(vector[vectorIndex] / maxValue, 1.0);
            circle.style.opacity = 0.4 + (intensity * 0.6); // 0.4-1.0的透明度
        }
    });
    
    console.log(`点亮了 ${activatedCount} 个圆圈`);
    
    // 统计每列（层）的激活数量
    const layersCount = [];
    for (let col = 0; col < 27; col++) {
        let layerCount = 0;
        for (let row = 0; row < 64; row++) {
            const vectorIndex = col * 64 + row;
            if (vectorIndex < vector.length && vector[vectorIndex] > 0) {
                layerCount++;
            }
        }
        layersCount.push(layerCount);
    }
    console.log('每列激活的专家数量:', layersCount);
}

// 随机点亮圆圈（保留作为备用）
function randomActivateCircles() {
    const moeNetwork = document.getElementById('moe-network');
    const circles = moeNetwork.querySelectorAll('.circle');

    // 随机点亮圆圈
    circles.forEach(circle => {
        if (Math.random() < 0.5) { // 50% 的概率激活
            circle.classList.add('active');
        } else {
            circle.classList.remove('active');
        }
    });
}

// 显示二级专家组合
function displaySecondLevelExperts(secondLevelExperts) {
    const secondLevelTableBody = document.querySelector('.expert-decomposition .token-table tbody');
    if (!secondLevelTableBody) {
        console.error('未找到二级专家组合的tbody元素');
        return;
    }

    // 清空现有的内容
    secondLevelTableBody.innerHTML = '';

    // 遍历二级专家组合，生成每一行的内容
    secondLevelExperts.forEach(expert => {
        const row = document.createElement('tr');

        // 创建Expert Index单元格
        const indexCell = document.createElement('td');
        indexCell.textContent = expert['Expert Index'];
        row.appendChild(indexCell);

        // 创建Expert Name和Function Description单元格
        const infoCell = document.createElement('td');
        const nameDiv = document.createElement('div');
        nameDiv.textContent = expert['Expert Name'];
        const descDiv = document.createElement('div');
        descDiv.textContent = expert['Function Description'];
        descDiv.style.fontSize = '12px'; // 设置功能描述字体大小
        descDiv.style.color = '#666'; // 设置功能描述颜色
        infoCell.appendChild(nameDiv);
        infoCell.appendChild(descDiv);
        row.appendChild(infoCell);

        // 将行添加到表格中
        secondLevelTableBody.appendChild(row);
    });
}

// 更新token列表
// updateTokenList函数已移除 - 不再需要token表格功能

let lastHighlightedRow = null;
let lastHighlightedButton = null;
let lastHighlightedColumn = null;

// 高亮行和按钮
function highlightRowAndButton(row, button, column) {
    // 如果之前有高亮的行和按钮，且点击的是同一列，去除背景和按钮颜色
    if (lastHighlightedRow && lastHighlightedColumn === column) {
        lastHighlightedRow.style.backgroundColor = '';
        lastHighlightedButton.style.backgroundColor = '';
    }

    // 如果之前有高亮的按钮，且点击的是不同列，复原按钮
    if (lastHighlightedButton && lastHighlightedColumn !== column) {
        lastHighlightedButton.style.backgroundColor = '';
    }

    // 高亮当前行和按钮
    row.style.backgroundColor = '#ADD8E6'; // 浅蓝色
    button.style.backgroundColor = '#ADD8E6'; // 浅蓝色

    // 更新最后高亮的行、按钮和列
    lastHighlightedRow = row;
    lastHighlightedButton = button;
    lastHighlightedColumn = column;
}

// ... existing code ...

// 初始化文本显示功能
function initializeTextDisplay() {
    const inputText = document.getElementById('input-text');
    const textDisplayArea = document.querySelector('.text-display-area');
    const inputTextDisplay = document.getElementById('input-text-display');
    
    if (!inputText || !textDisplayArea || !inputTextDisplay) {
        console.error('未找到必要的文本显示元素');
        return;
    }
    
    // 监听输入框变化，实时显示用户输入的文本
    inputText.addEventListener('input', function() {
        const text = inputText.value.trim();
        if (text) {
            inputTextDisplay.textContent = text;
            textDisplayArea.style.display = 'block';
        } else {
            textDisplayArea.style.display = 'none';
        }
    });
}

// 处理确认按钮点击事件
function handleConfirmClick() {
    console.log('确认按钮被点击');
    
    // 获取输入文本并显示
    const inputText = document.getElementById('input-text').value.trim();
    const inputTextDisplay = document.getElementById('input-text-display');
    
    console.log('输入文本:', inputText);
    console.log('input-text-display元素:', inputTextDisplay);
    
    if (inputTextDisplay) {
        inputTextDisplay.textContent = inputText;
        console.log('已设置input-text-display内容:', inputTextDisplay.textContent);
        
        // 显示文本显示区域
        const textDisplayArea = document.querySelector('.text-display-area');
        if (textDisplayArea) {
            textDisplayArea.style.display = 'block';
            console.log('已显示文本显示区域');
        } else {
            console.error('未找到.text-display-area元素');
        }
    } else {
        console.error('未找到input-text-display元素');
    }
    
    // 调用处理逻辑以显示专家组合信息
    processInput();
}

// 生成专家组合列表
// generateExpertCombinations函数已移除 - 不再需要token表格功能

// 选择专家组合并高亮对应单词
function selectExpert(expert) {
    console.log('selectExpert被调用，专家ID:', expert);
    selectedExpert = expert;
    
    // 获取对应的单词列表
    const words = expertWordMapping[expert] || [];
    console.log('专家对应的单词列表:', words);
    
    // 激活网格点亮效果
    const expertData = [{'Expert Index': expert}];
    console.log('激活网格，专家数据:', expertData);
    activateCirclesByExperts(expertData);
    
    // 高亮显示对应的单词
    highlightWords(words);
    
    // 高亮选中的专家组合行
    highlightExpertRow(expert);
}

// 高亮显示单词
function highlightWords(words) {
    const inputTextDisplay = document.getElementById('input-text-display');
    if (!inputTextDisplay) {
        console.error('未找到input-text-display元素，无法进行文本高亮');
        return;
    }
    
    let text = inputTextDisplay.textContent;
    if (!text) {
        console.warn('文本显示区域为空，无法进行高亮');
        return;
    }
    
    // 清除之前的高亮
    text = text.replace(/<span[^>]*>(.*?)<\/span>/g, '$1');
    
    // 为匹配的单词添加高亮样式
    words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        text = text.replace(regex, `<span class="highlighted-word">${word}</span>`);
    });
    
    inputTextDisplay.innerHTML = text;
}

// 高亮专家组合行
function highlightExpertRow(expert) {
    // 清除之前的高亮
    const allRows = document.querySelectorAll('.expert-explanation .token-table tbody tr');
    allRows.forEach(row => {
        row.classList.remove('selected-expert');
    });
    
    // 高亮当前选中的行 - 匹配三位数专家ID
    const expertCell = Array.from(document.querySelectorAll('.expert-explanation .token-table tbody td:first-child'))
        .find(cell => cell.textContent.trim() === expert);
    
    if (expertCell) {
        expertCell.closest('tr').classList.add('selected-expert');
        console.log(`高亮专家行: ${expert}`);
    } else {
        console.warn('未找到对应的专家ID行:', expert);
    }
}