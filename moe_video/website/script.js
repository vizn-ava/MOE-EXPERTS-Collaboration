
console.log('axios是否加载成功:', typeof axios);

document.addEventListener('DOMContentLoaded', function () {
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

    // 初始化词云图
    initializeMathWordCloud();

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

async function processInput() {    
    const inputText = document.getElementById('input-text').value;
    console.log('输入文本:', inputText); // 调试信息

    // 直接显示输入文本到token list区域
    displayInputText(inputText);

    try {
        console.log('发送请求到后端'); // 调试信息
        const response = await axios.post('http://localhost:3000/api/process', { input: inputText }, {
            headers: {
                'Content-Type': 'application/json' // 设置请求头
            }
        });
        console.log('后端返回的数据:', response.data); // 调试信息

        const tokenVectors = response.data.tokenVectors;
        if (!tokenVectors || !Array.isArray(tokenVectors)) {
            console.error('tokenVectors 不是数组或未定义:', tokenVectors);
            return;
        }

        console.log('tokenVectors 数据:', tokenVectors); // 调试信息

        // 注意：现在不再显示token列表，而是显示输入文本
        // displayTokenList(tokenVectors); // 这行被注释掉
        console.log('输入文本已显示在token list区域'); // 调试信息

        // 自动显示第一个token的专家组合
        if (tokenVectors.length > 0) {
            const firstTokenVector = tokenVectors[0];
            console.log('第一个token:', firstTokenVector.token, '向量:', firstTokenVector.vector);
            
            // 发送请求查询第一个token的Top 5专家
            const expertResponse = await axios.post('http://localhost:3000/api/top5-experts', {
                tokenVector: firstTokenVector.vector
            });
            console.log('第一个token的Top 5专家:', expertResponse.data);
            
            // 显示Top 5专家
            displayTop5Experts(expertResponse.data);
        }

    } catch (error) {
        console.error('请求失败:', error);
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

// 存储原始tokens，用于后续随机着色
let originalTokens = [];

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
            return `<span style="color: ${color}; font-weight: bold;">${token}</span>`;
        } else {
            // 不点亮，保持默认颜色
            return `<span style="color: inherit;">${token}</span>`;
        }
    });
    
    // 显示带颜色的分词结果
    tokenDisplay.innerHTML = coloredTokens.join(' ');
}

// 原有的displayTokenList函数现在不再使用，保留以防需要
function displayTokenList(tokenVectors) {
    // 这个函数已被废弃，token list现在直接显示输入文本
    console.log('displayTokenList函数已废弃，现在直接显示输入文本');
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
        
        // 为专家名称单元格添加点击事件，用于显示二级专家组合
        infoCell.style.cursor = 'pointer'; // 添加鼠标指针样式
        infoCell.addEventListener('click', async () => {
            console.log('专家名称被点击，专家:', expert['Expert Name']); // 调试信息

            // 清除之前的选中状态
            document.querySelectorAll('.expert-explanation .token-table td:nth-child(2)').forEach(cell => {
                cell.classList.remove('selected');
            });
            
            // 添加选中状态
            infoCell.classList.add('selected');

            // 生成64维随机向量
            const randomVector = Array.from({ length: 64 }, () => Math.random());
            console.log('生成的64维随机向量:', randomVector); // 调试信息

            try {
                // 发送请求查询Top 5二级专家组合
                const response = await axios.post('http://localhost:3000/api/top5-second-level-experts', {
                    tokenVector: randomVector
                });
                console.log('Top 5二级专家组合:', response.data); // 调试信息

                // 显示Top 5二级专家组合
                displaySecondLevelExperts(response.data);

                // 随机点亮Token List中的文本
                highlightTokensRandomly();

                // 高亮当前行
                highlightRowAndButton(row, null, null);

            } catch (error) {
                console.error('请求二级专家组合失败:', error);
            }
        });
        
        row.appendChild(infoCell);

        // 创建"分解"按钮单元格
        const buttonCell = document.createElement('td');
        const button = document.createElement('button');
        button.textContent = '🔍'; // 放大镜图标
        button.classList.add('add-button'); // 添加按钮样式类
        button.addEventListener('click', async () => {
            console.log('分解按钮被点击，专家:', expert['Expert Name']); // 调试信息

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
function displaySecondLevelExperts(secondLevelExperts) {
    const secondLevelTableBody = document.querySelector('.expert-decomposition .token-table tbody');
    if (!secondLevelTableBody) {
        console.error('未找到二级专家组合的tbody元素');
        return;
    }

    // 清空现有的内容
    secondLevelTableBody.innerHTML = '';

    // 遍历二级专家组合，生成每一行的内容
    secondLevelExperts.forEach((expert, index) => {
        const row = document.createElement('tr');
        
        // 为每个专家分配颜色
        const colors = getExpertColors();
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

// 初始化数学词云图
async function initializeMathWordCloud() {
    try {
        const response = await fetch('math_wordcloud_data.json');
        const data = await response.json();
        
        // 创建词云图实例
        const wordcloud = new MathWordCloud('math-wordcloud', data);
        
        console.log('数学词云图初始化成功');
    } catch (error) {
        console.error('初始化数学词云图失败:', error);
    }
}