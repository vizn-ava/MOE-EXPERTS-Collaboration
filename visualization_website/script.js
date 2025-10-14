
console.log('axios是否加载成功:', typeof axios);

document.addEventListener('DOMContentLoaded', function () {
    // 页面加载时自动加载专家-token映射关系
    loadExpertTokenMapping();
    
    // 加载二级专家-token映射关系
    loadSecondaryExpertTokenMapping();
    
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


    // 绑定确认按钮的点击事件
    const confirmButton = document.getElementById('confirm-button');
    if (confirmButton) {
        confirmButton.addEventListener('click', processInput);
    } else {
        console.error('未找到id为confirm-button的元素');
    }

    // 初始化悬浮窗相关元素
    const modal = document.getElementById('activation-modal');
    const closeButton = document.querySelector('.close-button');
    const modalMoeNetwork = document.getElementById('modal-moe-network');

    // 关闭悬浮窗的事件监听
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // 点击悬浮窗外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 初始化悬浮窗中的MOE网络
    initializeModalMoeNetwork();

    // 移除原有的MOE网络初始化代码，因为已经移到悬浮窗中
    // const moeNetwork = document.getElementById('moe-network');
    // const rows = 64; // 每列64个圆圈
    // const cols = 27; // 共27列

    // // 清空现有的内容
    // moeNetwork.innerHTML = '';

    // // 动态生成64x27的圆圈
    // for (let i = 0; i < rows; i++) {
    //     for (let j = 0; j < cols; j++) {
    //         const circle = document.createElement('div');
    //         circle.classList.add('circle');
    //         moeNetwork.appendChild(circle);
    //     }
    // }

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
            
            // 重新渲染带颜色的内容
            const inputText = document.getElementById('input-text').value;
            if (inputText) {
                // 如果有二级专家显示，则重新随机点亮
                const secondLevelTableBody = document.querySelector('.expert-decomposition .token-table tbody');
                if (secondLevelTableBody && secondLevelTableBody.children.length > 0) {
                    highlightTokensRandomly();
                } else {
                    // 否则只显示分词结果
                    displayInputText(inputText);
                }
            }
            
            // 重新渲染二级专家颜色
            const secondLevelTableBody = document.querySelector('.expert-decomposition .token-table tbody');
            if (secondLevelTableBody && secondLevelTableBody.children.length > 0) {
                const experts = Array.from(secondLevelTableBody.children).map(row => ({
                    'Expert Index': row.children[0].textContent,
                    'Expert Name': row.children[1].children[0].textContent,
                    'Function Description': row.children[1].children[1].textContent
                }));
                displaySecondLevelExperts(experts);
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
            guide_description: 'This page displays the activation and decomposition relationships of SuperExpert in MOE models, providing interactive visualization.',
            guide_step1: 'Enter your text in the input box on the left and click "Confirm".',
            guide_step2: 'Click the "+" buttons in the Token List to query the corresponding Top 5 first-level SuperExpert.',
        guide_step3: 'Click the "+" buttons in the first-level SuperExpert to view Top 5 second-level SuperExpert and visualization branches.',
            input_title: 'Input Text',
            confirm: 'Confirm',
            input_placeholder: 'Enter your text here...',
            token_list: 'Token List',
            first_experts_title: 'First-Level SuperExpert',
            first_expert_index: 'Expert ID',
            first_expert_name: 'Expert Name (Function)',
            decompose_header: 'Detail',
            second_experts_title: 'Second-Level SuperExpert',
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
            guide_step2: '在Token列表中点击"+"查询对应的Top 5一级专家组合。',
            guide_step3: '在一级专家组合中点击"+"查看Top 5二级专家组合与可视化分支。',
            input_title: '输入文本',
            confirm: '确认',
            input_placeholder: '在此输入句子...',
            token_list: 'Token列表',
            first_experts_title: '一级专家组合',
            first_expert_index: '专家ID',
            first_expert_name: '专家名称（功能）',
            decompose_header: '详情',
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

// 发送用户输入到后端并展示结果主要都是调试});

// 初始化悬浮窗中的MOE网络
function initializeModalMoeNetwork() {
    const modalMoeNetwork = document.getElementById('modal-moe-network');
    if (!modalMoeNetwork) {
        console.error('未找到modal-moe-network元素');
        return;
    }

    const rows = 64; // 每列64个圆圈
    const cols = 27; // 共27列

    // 清空现有的内容
    modalMoeNetwork.innerHTML = '';

    // 动态生成64x27的圆圈
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            modalMoeNetwork.appendChild(circle);
        }
    }
}

// 显示悬浮窗并更新激活图
function showActivationModal(expertName, vector) {
    const modal = document.getElementById('activation-modal');
    const modalTitle = document.getElementById('modal-title');
    
    // 更新标题
    if (modalTitle) {
        modalTitle.textContent = `${expertName} - Expert Group Mapping on MOE Network`;
    }
    
    // 显示悬浮窗
    modal.style.display = 'block';
    
    // 更新激活图
    activateModalCirclesByVector(vector);
}

// 在悬浮窗中根据激活向量点亮圆圈
function activateModalCirclesByVector(vector) {
    const modalMoeNetwork = document.getElementById('modal-moe-network');
    const circles = modalMoeNetwork.querySelectorAll('.circle');
    
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
            
            // 保持一致的激活强度，设置为0.75透明度
            circle.style.opacity = '0.75'; // 统一设置为0.75透明度
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

// 修改processInput函数，直接使用本地CSV数据而不是后端API
async function processInput() {    
    const inputText = document.getElementById('input-text').value;
    console.log('输入文本:', inputText);

    // 直接显示输入文本到token list区域
    displayInputText(inputText);

    try {
        // 直接从CSV文件加载专家数据
        const response = await fetch('./experts_summary.csv');
        const csvText = await response.text();
        
        // 解析CSV数据
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const experts = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                experts.push({
                    'Expert Index': values[0],
                    'Expert Name': values[1],
                    'Function Description': values[2]
                });
            }
        }
        
        console.log('从CSV加载的专家数据:', experts);
        
        // 显示前5个专家（或所有专家如果少于5个）
        const top5Experts = experts.slice(0, 5);
        displayTop5Experts(top5Experts);

    } catch (error) {
        console.error('加载专家数据失败:', error);
    }
}

// 定义5种主题一致的颜色
const EXPERT_COLORS = {
    light: [
        '#FF6B6B', // 红色
        '#4ECDC4', // 青色
        '#45B7D1', // 蓝色
        '#96CEB4', // 绿色
        '#FFEAA7'  // 黄色
    ],
    dark: [
        '#FF8A80', // 亮红色
        '#80CBC4', // 亮青色
        '#81D4FA', // 亮蓝色
        '#A5D6A7', // 亮绿色
        '#FFF59D'  // 亮黄色
    ]
};

// 获取当前主题的颜色
function getExpertColors() {
    const body = document.body;
    if (!body) {
        return EXPERT_COLORS.light; // 默认返回亮色主题
    }
    const isDarkTheme = body.classList.contains('dark-theme');
    return isDarkTheme ? EXPERT_COLORS.dark : EXPERT_COLORS.light;
}

// 获取当前选中的主专家颜色
function getCurrentPrimaryExpertColor() {
    const selectedCell = document.querySelector('.expert-explanation .token-table td:nth-child(2).selected');
    if (!selectedCell) {
        // 如果没有选中的专家，返回第一个专家的颜色
        const colors = getExpertColors();
        return colors[0];
    }
    
    // 获取选中专家的索引
    const expertRows = document.querySelectorAll('.expert-explanation .token-table tbody tr');
    let selectedIndex = 0;
    expertRows.forEach((row, index) => {
        const infoCell = row.querySelector('td:nth-child(2)');
        if (infoCell && infoCell.classList.contains('selected')) {
            selectedIndex = index;
        }
    });
    
    const colors = getExpertColors();
    return colors[selectedIndex % colors.length];
}

// 生成二级专家的同色系颜色
function generateSecondaryColor(primaryColor, index) {
    // 将十六进制颜色转换为RGB
    const hex = primaryColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 为不同的二级专家生成不同的变化
    const variations = [
        { r: 0.8, g: 0.8, b: 0.8, alpha: 0.9 }, // 稍微变暗，高透明度
        { r: 1.2, g: 1.2, b: 1.2, alpha: 0.8 }, // 稍微变亮，中透明度
        { r: 0.9, g: 0.9, b: 0.9, alpha: 0.85 }, // 轻微变暗，中高透明度
        { r: 1.1, g: 1.1, b: 1.1, alpha: 0.75 }  // 轻微变亮，中低透明度
    ];
    
    const variation = variations[index % variations.length];
    
    // 应用变化并确保值在0-255范围内
    const newR = Math.min(255, Math.max(0, Math.round(r * variation.r)));
    const newG = Math.min(255, Math.max(0, Math.round(g * variation.g)));
    const newB = Math.min(255, Math.max(0, Math.round(b * variation.b)));
    
    return `rgba(${newR}, ${newG}, ${newB}, ${variation.alpha})`;
}

// 存储原始tokens，用于后续随机着色
let originalTokens = [];
// 存储一级专家与token的对应关系
let expertTokenMapping = new Map();
// 存储二级专家-token映射关系
let secondaryExpertTokenMapping = new Map();

// 新函数：显示分词后的token列表到token list区域（初始不点亮颜色）
function displayInputText(inputText) {
    const tokenDisplay = document.getElementById('token-display');
    if (!tokenDisplay) {
        console.error('未找到token-display元素');
        return;
    }

    // 使用空格分词
    const tokens = inputText.split(' ').filter(token => token.trim() !== '');
    originalTokens = tokens; // 保存原始tokens
    
    // 初始显示不带颜色的分词结果
    tokenDisplay.textContent = tokens.join(' ');
}

// 新函数：随机点亮Token List中的文本（部分点亮，部分不点亮）
function highlightTokensRandomly() {
    const tokenDisplay = document.getElementById('token-display');
    if (!tokenDisplay || originalTokens.length === 0) {
        console.error('未找到token-display元素或tokens为空');
        return;
    }

    // 获取当前主题颜色
    const colors = getExpertColors();
    
    // 为每个token随机决定是否点亮（70%概率点亮）
    const coloredTokens = originalTokens.map((token) => {
        const shouldHighlight = Math.random() < 0.7; // 70%概率点亮
        
        if (shouldHighlight) {
            // 随机选择颜色
            const randomColorIndex = Math.floor(Math.random() * colors.length);
            const color = colors[randomColorIndex];
            return `<span style="background-color: ${color}20; padding: 2px 4px; border-radius: 3px;">${token}</span>`;
        } else {
            // 不点亮，保持默认颜色
            return `<span style="color: inherit;">${token}</span>`;
        }
    });
    
    // 显示带颜色的分词结果
    tokenDisplay.innerHTML = coloredTokens.join(' ');
}

// 新函数：为特定专家高亮对应的token
function highlightTokensForExpert(expertIndex, expertColor) {
    const tokenDisplay = document.getElementById('token-display');
    if (!tokenDisplay || originalTokens.length === 0) {
        console.error('未找到token-display元素或tokens为空');
        return;
    }

    let highlightedTokens = [];
    
    // 添加调试信息
    console.log(`查找专家 ${expertIndex} 的映射关系`);
    console.log('expertTokenMapping内容:', expertTokenMapping);
    console.log('expertTokenMapping.has(' + expertIndex + '):', expertTokenMapping.has(expertIndex));
    console.log('expertTokenMapping.has(' + parseInt(expertIndex) + '):', expertTokenMapping.has(parseInt(expertIndex)));
    
    // 检查是否已有保存的映射关系
    if (expertTokenMapping.has(parseInt(expertIndex))) {
        const savedMapping = expertTokenMapping.get(parseInt(expertIndex));
        highlightedTokens = savedMapping.tokens;
        console.log(`使用已保存的专家 ${expertIndex} 映射关系:`, highlightedTokens);
    } else {
        // 如果没有保存的映射，生成新的映射关系
        const seed = parseInt(expertIndex) || 0;
        
        // 简单的伪随机数生成器，基于专家索引
        function seededRandom(seed) {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        }
        
        // 为每个token决定是否被该专家高亮（40%的token会被高亮）
        const highlightProbability = 0.4;
        highlightedTokens = originalTokens.filter((token, index) => {
            const randomValue = seededRandom(seed + index);
            return randomValue < highlightProbability;
        });
        
        // 保存新生成的映射关系到内存中（不自动保存到文件）
        expertTokenMapping.set(parseInt(expertIndex), {
            color: expertColor,
            tokens: highlightedTokens
        });
        
        // 注释掉自动保存功能，防止覆盖手动修改的JSON文件
        // saveExpertTokenMapping();
        
        console.log(`生成专家 ${expertIndex} 的临时映射关系:`, highlightedTokens);
    }
    
    // 创建高亮显示的token数组
    const coloredTokens = originalTokens.map((token) => {
        const shouldHighlight = highlightedTokens.includes(token);
        
        if (shouldHighlight) {
            return `<span style="background-color: ${expertColor}20; padding: 2px 4px; border-radius: 3px;">${token}</span>`;
        } else {
            // 不高亮的token保持默认颜色
            return `<span style="color: inherit;">${token}</span>`;
        }
    });
    
    // 显示高亮后的分词结果
    tokenDisplay.innerHTML = coloredTokens.join(' ');
}

// 原有的displayTokenList函数现在不再使用，保留以防需要
function displayTokenList(tokenVectors) {
    // 这个函数已被废弃，token list现在直接显示输入文本
    console.log('displayTokenList函数已废弃，现在直接显示输入文本');
}

// 从服务器加载专家-token映射关系
async function loadExpertTokenMapping() {
    try {
        const response = await fetch('http://localhost:3000/api/expert-token-mapping');
        if (response.ok) {
            const data = await response.json();
            if (data.mappings) {
                // 将JSON对象转换为Map
                expertTokenMapping.clear();
                for (const [key, value] of Object.entries(data.mappings)) {
                    expertTokenMapping.set(parseInt(key), value);
                }
                console.log('专家-token映射关系加载成功:', expertTokenMapping);
            }
        } else {
            console.warn('加载映射关系失败，使用空映射');
        }
    } catch (error) {
        console.error('加载专家-token映射关系时出错:', error);
    }
}

// 从服务器加载二级专家-token映射关系
async function loadSecondaryExpertTokenMapping() {
    try {
        const response = await fetch('secondary_expert_token_mapping.json');
        if (response.ok) {
            const data = await response.json();
            if (data.secondary_mappings) {
                // 将JSON对象转换为Map
                secondaryExpertTokenMapping.clear();
                for (const [key, value] of Object.entries(data.secondary_mappings)) {
                    secondaryExpertTokenMapping.set(parseInt(key), value);
                }
                console.log('二级专家-token映射关系加载成功:', secondaryExpertTokenMapping);
            }
        } else {
            console.warn('加载二级专家映射关系失败，使用空映射');
        }
    } catch (error) {
        console.error('加载二级专家-token映射关系时出错:', error);
    }
}

// 新函数：为二级专家高亮对应的token
function highlightTokensForSecondaryExpert(secondaryExpertId, expertColor) {
    const tokenDisplay = document.getElementById('token-display');
    if (!tokenDisplay) {
        console.error('未找到token-display元素');
        return;
    }

    let highlightedTokens = [];
    
    // 检查是否有二级专家的映射关系
    if (secondaryExpertTokenMapping.has(secondaryExpertId)) {
        const secondaryMapping = secondaryExpertTokenMapping.get(secondaryExpertId);
        highlightedTokens = secondaryMapping.tokens;
        console.log(`使用二级专家 ${secondaryExpertId} 的映射关系:`, highlightedTokens);
    } else {
        console.warn(`未找到二级专家 ${secondaryExpertId} 的token映射关系`);
        return;
    }
    
    // 先清除之前的二级专家高亮效果
    clearSecondaryExpertHighlight();
    
    // 获取当前所有的span元素
    const spans = tokenDisplay.querySelectorAll('span');
    
    spans.forEach((span) => {
        const token = span.textContent.trim();
        
        if (highlightedTokens.includes(token)) {
            // 为二级专家的token添加额外的样式，保持原有背景色
            span.style.color = expertColor;
            span.style.fontWeight = 'bold';
            span.style.fontStyle = 'italic';
            span.style.textDecoration = 'underline';
            span.classList.add('secondary-expert-highlight');
        }
    });
}

// 清除二级专家高亮效果的辅助函数
function clearSecondaryExpertHighlight() {
    const tokenDisplay = document.getElementById('token-display');
    if (!tokenDisplay) return;
    
    const spans = tokenDisplay.querySelectorAll('span.secondary-expert-highlight');
    spans.forEach((span) => {
        span.style.color = '';
        span.style.fontWeight = '';
        span.style.fontStyle = '';
        span.style.textDecoration = '';
        span.classList.remove('secondary-expert-highlight');
    });
}
async function saveExpertTokenMapping() {
    try {
        // 将Map转换为普通对象
        const mappingsObj = {};
        for (const [key, value] of expertTokenMapping.entries()) {
            mappingsObj[key] = value;
        }
        
        const data = {
            mappings: mappingsObj,
            metadata: {
                created_at: new Date().toISOString(),
                last_updated: new Date().toISOString(),
                version: "1.0",
                description: "专家组合与token映射关系存储文件"
            }
        };
        
        const response = await fetch('http://localhost:3000/api/expert-token-mapping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('映射关系保存成功:', result.message);
        } else {
            console.error('保存映射关系失败');
        }
    } catch (error) {
        console.error('保存专家-token映射关系时出错:', error);
    }
}

// 显示Top 5专家
function displayTop5Experts(top5Experts) {
    const expertTableBody = document.querySelector('.expert-explanation .token-table tbody');
    if (!expertTableBody) {
        console.error('未找到一级专家组合的tbody元素');
        return;
    }

    // 清空现有的内容
    expertTableBody.innerHTML = '';
    
    // 获取颜色数组
    const colors = getExpertColors();

    // 遍历Top 5专家，生成每一行的内容
    top5Experts.forEach((expert, index) => {
        const row = document.createElement('tr');
        
        // 为每个一级专家分配不同颜色
        const colorIndex = index % colors.length;
        const expertColor = colors[colorIndex];

        // 创建Expert Index单元格
        const indexCell = document.createElement('td');
        indexCell.textContent = expert['Expert Index'];
        indexCell.style.color = expertColor;
        indexCell.style.fontWeight = 'bold';
        row.appendChild(indexCell);

        // 创建Expert Name和Function Description单元格
        const infoCell = document.createElement('td');
        const nameDiv = document.createElement('div');
        nameDiv.textContent = expert['Expert Name'];
        nameDiv.style.color = expertColor;
        nameDiv.style.fontWeight = 'bold';
        
        const descDiv = document.createElement('div');
        descDiv.textContent = expert['Function Description'];
        descDiv.style.fontSize = '12px';
        descDiv.style.color = '#666';
        
        infoCell.appendChild(nameDiv);
        infoCell.appendChild(descDiv);
        
        // 为专家名称单元格添加点击事件，用于显示二级专家组合和高亮对应token
        infoCell.style.cursor = 'pointer';
        infoCell.addEventListener('click', async () => {
            console.log('专家名称被点击，专家:', expert['Expert Name']);

            // 清除之前的选中状态
            document.querySelectorAll('.expert-explanation .token-table td:nth-child(2)').forEach(cell => {
                cell.classList.remove('selected');
            });
            
            // 添加选中状态
            infoCell.classList.add('selected');

            // 直接显示真实的二级专家数据，传入专家ID
            displaySecondLevelExperts(expert['Expert Index']);

            // 高亮对应的token（使用该专家的颜色）
            highlightTokensForExpert(expert['Expert Index'], expertColor);

            // 高亮当前行
            highlightRowAndButton(row, null, null);
        });
        
        row.appendChild(infoCell);

        // 创建"分解"按钮单元格
        const buttonCell = document.createElement('td');
        const button = document.createElement('button');
        button.textContent = '🔍';
        button.classList.add('add-button');
        button.addEventListener('click', async () => {
            console.log('分解按钮被点击，专家:', expert['Expert Name']);

            // 生成1728维随机向量用于激活图显示
            const activationVector = Array.from({ length: 1728 }, () => Math.random() > 0.95 ? Math.random() : 0);
            
            // 只显示悬浮窗并展示激活图
            showActivationModal(expert['Expert Name'], activationVector);
        });
        buttonCell.appendChild(button);
        row.appendChild(buttonCell);

        // 将行添加到表格中
        expertTableBody.appendChild(row);
    });
}

// 根据激活向量点亮圆圈 - 这个函数现在不再使用，因为激活图已移到悬浮窗中
function activateCirclesByVector(vector) {
    // 这个函数保留但不再使用，激活图现在在悬浮窗中显示
    console.log('activateCirclesByVector函数已废弃，请使用悬浮窗显示激活图');
}

// 显示二级专家组合
async function displaySecondLevelExperts(primaryExpertId) {
    const secondLevelTableBody = document.querySelector('.expert-decomposition .token-table tbody');
    if (!secondLevelTableBody) {
        console.error('未找到二级专家组合的tbody元素');
        return;
    }

    // 清空现有的内容
    secondLevelTableBody.innerHTML = '';
    
    // 获取颜色数组
    const colors = getExpertColors();

    let secondLevelExperts = [];
    
    try {
        // 从expert_activation_patterns.json加载真实的二级专家数据
        const response = await fetch('expert_activation_patterns.json');
        if (response.ok) {
            const activationData = await response.json();
            const expertData = activationData[primaryExpertId.toString()];
            
            if (expertData && expertData.secondary_experts) {
                secondLevelExperts = expertData.secondary_experts;
                console.log(`加载专家 ${primaryExpertId} 的二级专家数据:`, secondLevelExperts);
            } else {
                console.warn(`未找到专家 ${primaryExpertId} 的二级专家数据`);
            }
        }
    } catch (error) {
        console.error('加载二级专家数据时出错:', error);
    }

    // 如果没有加载到真实数据，使用模拟数据
    if (secondLevelExperts.length === 0) {
        console.log('使用模拟的二级专家数据');
        secondLevelExperts = [
            { 'index': '12', 'name': 'Numerical Computing Sub-Expert', 'description': 'Specialized numerical algorithms' },
            { 'index': '13', 'name': 'Data Processing Sub-Expert', 'description': 'Advanced data manipulation' },
            { 'index': '14', 'name': 'Research Methods Sub-Expert', 'description': 'Methodological approaches' },
            { 'index': '15', 'name': 'Problem Solving Sub-Expert', 'description': 'Solution optimization' }
        ];
    }

    // 遍历二级专家，生成每一行的内容
    secondLevelExperts.forEach((expert, index) => {
        const row = document.createElement('tr');
        
        // 获取当前选中的主专家颜色
        const primaryColor = getCurrentPrimaryExpertColor();
        
        // 生成二级专家的同色系颜色
        const secondaryColor = generateSecondaryColor(primaryColor, index);

        // 创建Expert Index单元格
        const indexCell = document.createElement('td');
        indexCell.textContent = expert.index || expert['Expert Index'];
        indexCell.style.color = secondaryColor;
        indexCell.style.fontWeight = 'bold';
        row.appendChild(indexCell);

        // 创建Expert Name和Function Description单元格
        const infoCell = document.createElement('td');
        const nameDiv = document.createElement('div');
        nameDiv.textContent = expert.name || expert['Expert Name'];
        nameDiv.style.color = secondaryColor;
        nameDiv.style.fontWeight = 'bold';
        nameDiv.style.cursor = 'pointer'; // 添加鼠标指针样式
        
        // 为二级专家名称添加点击事件
        nameDiv.addEventListener('click', () => {
            console.log('二级专家名称被点击，专家ID:', expert.index || expert['Expert Index']);
            
            // 清除之前的选中状态
            document.querySelectorAll('.expert-decomposition .token-table td:nth-child(2) div:first-child').forEach(div => {
                div.classList.remove('selected');
            });
            
            // 添加选中状态
            nameDiv.classList.add('selected');
            
            // 高亮对应的token（使用二级专家的颜色和加粗效果）
            const secondaryExpertId = parseInt(expert.index || expert['Expert Index']);
            highlightTokensForSecondaryExpert(secondaryExpertId, secondaryColor);
        });
        
        const descDiv = document.createElement('div');
        descDiv.textContent = expert.description || expert['Function Description'];
        descDiv.style.fontSize = '12px';
        descDiv.style.color = '#666';
        
        infoCell.appendChild(nameDiv);
        infoCell.appendChild(descDiv);
        row.appendChild(infoCell);

        // 将行添加到表格中
        secondLevelTableBody.appendChild(row);
    });
}

// 更新token列表
function updateTokenList(tokenVectors) {
    const tokenTableBody = document.querySelector('.token-list .token-table tbody');
    tokenTableBody.innerHTML = tokenVectors
        .map(({ token }) => `
            <tr>
                <td>${token}</td>
                <td><button class="add-button">+</button></td>
            </tr>
        `)
        .join('');
}

let lastHighlightedRow = null;
let lastHighlightedButton = null;
let lastHighlightedColumn = null;

// 高亮行和按钮
function highlightRowAndButton(row, button, column) {
    console.log('highlightRowAndButton called with:', {row, button, column});
    
    // 移除之前的高亮
    if (lastHighlightedRow && lastHighlightedRow.classList) {
        lastHighlightedRow.classList.remove('highlighted');
    }
    if (lastHighlightedButton && lastHighlightedButton.classList) {
        lastHighlightedButton.classList.remove('highlighted');
    }
    if (lastHighlightedColumn && lastHighlightedColumn.classList) {
        lastHighlightedColumn.classList.remove('highlighted');
    }

    // 添加新的高亮（检查元素是否存在）
    if (row && row.classList) {
        row.classList.add('highlighted');
    }
    if (button && button.classList) {
        button.classList.add('highlighted');
    }
    if (column && column.classList) {
        column.classList.add('highlighted');
    }

    // 更新记录
    lastHighlightedRow = row;
    lastHighlightedButton = button;
    lastHighlightedColumn = column;
}