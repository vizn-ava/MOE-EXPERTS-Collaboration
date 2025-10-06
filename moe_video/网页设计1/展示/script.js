// 假设你已经有一个函数来处理一级专家组合的点击事件
document.getElementById('decompose-button').addEventListener('click', function() {
    console.log('分解按钮被点击'); // 确保按钮点击事件被捕获

    // 生成激活向量
    const activationVector = generateActivationVector();
    console.log('生成的激活向量:', activationVector); // 展示激活向量

    // 从 experts_summary2.csv 中获取数据
    axios.get('experts_summary2.csv')
        .then(function(response) {
            console.log('成功获取 experts_summary2.csv 数据'); // 确保数据已成功获取
            const data = parseCSV(response.data);
            console.log('解析后的数据:', data); // 展示解析后的数据

            // 使用激活向量查找 top5 的二级专家组合
            const top5SecondLevelExperts = findTop5SecondLevelExperts(data, activationVector);
            console.log('找到的 top5 二级专家组合:', top5SecondLevelExperts); // 展示 top5 二级专家组合

            // 显示 top5 二级专家组合
            displaySecondLevelExperts(top5SecondLevelExperts);
        })
        .catch(function(error) {
            console.error('请求失败:', error); // 展示请求失败的错误信息
        });
});

// 生成激活向量的函数
function generateActivationVector() {
    // 这里可以根据需要生成一个激活向量
    const vector = Array.from({ length: 64 }, () => Math.random().toFixed(4));
    console.log('生成的激活向量:', vector); // 展示生成的激活向量
    return vector;
}

// 使用激活向量查找 top5 的二级专家组合的函数
function findTop5SecondLevelExperts(data, vector) {
    if (!data || !Array.isArray(data)) {
        console.error('无效的数据:', data); // 检查 data 参数是否有效
        return [];
    }

    console.log('正在使用向量查找 top5 二级专家组合:', vector); // 展示使用的激活向量

    const expertsWithSimilarity = data.map(item => {
        // 假设每个数据项有一个向量字段
        const similarity = calculateSimilarity(item.vector, vector);
        console.log(`计算二级专家 ${item['Expert Name']} 的相似度: ${similarity}`); // 展示每个二级专家的相似度
        return { ...item, similarity };
    });

    const sortedExperts = expertsWithSimilarity.sort((a, b) => b.similarity - a.similarity);
    const top5Experts = sortedExperts.slice(0, 5);
    console.log('排序后的二级专家列表:', sortedExperts); // 展示排序后的二级专家列表
    return top5Experts;
}

// 计算相似度的函数
function calculateSimilarity(itemVector, activationVector) {
    if (!itemVector || !activationVector) {
        console.error('无效的向量:', itemVector, activationVector); // 检查向量是否有效
        return 0;
    }

    const similarity = itemVector.reduce((sum, v, i) => sum + v * activationVector[i], 0);
    console.log(`计算向量 ${itemVector} 和 ${activationVector} 的相似度: ${similarity}`); // 展示相似度计算结果
    return similarity;
}

// 显示 top5 二级专家组合的函数
function displaySecondLevelExperts(experts) {
    if (!experts || !Array.isArray(experts)) {
        console.error('无效的专家数据:', experts); // 检查 experts 参数是否有效
        return;
    }

    const tbody = document.querySelector('.expert-decomposition tbody');
    if (!tbody) {
        console.error('tbody 元素未找到'); // 检查 tbody 元素是否存在
        return;
    }

    tbody.innerHTML = ''; // 清空现有内容

    console.log('正在显示 top5 二级专家组合:'); // 展示正在显示的 top5 二级专家组合
    experts.forEach((expert, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expert['Expert Index']}</td>
            <td>${expert['Expert Name']}</td>
            <td>${expert['Function Description']}</td>
        `;
        tbody.appendChild(row);

        // 修改实际功能
        modifyExpertFunctionality(expert, index);
    });
}

// 修改专家实际功能的函数
function modifyExpertFunctionality(expert, index) {
    console.log(`正在修改二级专家 ${expert['Expert Name']} (${expert['Expert Index']}) 的功能`); // 展示正在修改功能的专家
    // 这里可以根据需要修改专家的实际功能
    // 例如：expert.functionality = 'New functionality';
}

async function processInput() {
    console.log('分解按钮被点击'); // 确保按钮点击事件被捕获

    // 生成激活向量
    const activationVector = generateActivationVector();
    console.log('生成的激活向量:', activationVector); // 展示激活向量

    // 从 experts_summary2.csv 中获取数据
    try {
        console.log('正在从 experts_summary2.csv 获取数据'); // 调试信息
        const response = await axios.get('experts_summary2.csv');
        console.log('成功获取 experts_summary2.csv 数据'); // 确保数据已成功获取

        const data = parseCSV(response.data);
        console.log('解析后的数据:', data); // 展示解析后的数据

        // 使用激活向量查找 top5 的专家
        const top5Experts = findTop5Experts(data, activationVector);
        console.log('找到的 top5 专家:', top5Experts); // 展示 top5 的专家

        // 显示 top5 的专家
        displayTop5Experts(top5Experts);
    } catch (error) {
        console.error('请求失败:', error); // 展示请求失败的错误信息
    }
}

function displayTop5Experts(top5Experts) {
    if (!top5Experts || !Array.isArray(top5Experts)) {
        console.error('无效的专家数据:', top5Experts); // 检查 experts 参数是否有效
        return;
    }

    const tbody = document.querySelector('.expert-explanation .token-table tbody');
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
        row.appendChild(infoCell);

        // 创建"分解"按钮单元格
        const buttonCell = document.createElement('td');
        const button = document.createElement('button');
        button.textContent = '+'; // 按钮文本
        button.classList.add('add-button'); // 添加按钮样式类
        button.addEventListener('click', () => {
            console.log('分解按钮被点击，专家:', expert['Expert Name']); // 调试信息
            // 显示三个示例的专家组合
            displaySecondLevelExperts([
                { 'Expert Index': '2-1', 'Expert Name': 'Second Expert A', 'Function Description': '功能描述A' },
                { 'Expert Index': '2-2', 'Expert Name': 'Second Expert B', 'Function Description': '功能描述B' },
                { 'Expert Index': '2-3', 'Expert Name': 'Second Expert C', 'Function Description': '功能描述C' }
            ]);

            // 随机点亮右上角MOE网络上的圆圈
            randomActivateCircles();
        });
        buttonCell.appendChild(button);
        row.appendChild(buttonCell);

        // 将行添加到表格中
        expertTableBody.appendChild(row);
    });
}

// 生成随机查找向量的函数
function generateRandomVector() {
    // 这里可以根据需要生成一个随机向量
    const vector = [Math.random(), Math.random(), Math.random()];
    console.log('Generated random vector:', vector); // 展示生成的随机向量
    return vector;
}

// 使用随机向量查找 top5 的专家的函数
function findTop5Experts(data, vector) {
    console.log('Finding top 5 experts with vector:', vector); // 展示使用的随机向量

    const expertsWithSimilarity = data.map(item => {
        // 假设每个数据项有一个向量字段
        const similarity = calculateSimilarity(item.vector, vector);
        console.log(`Calculated similarity for expert ${item.expertName}: ${similarity}`); // 展示每个专家的相似度
        return { ...item, similarity };
    });

    const sortedExperts = expertsWithSimilarity.sort((a, b) => b.similarity - a.similarity);
    const top5Experts = sortedExperts.slice(0, 5);
    console.log('Sorted experts:', sortedExperts); // 展示排序后的专家列表
    return top5Experts;
}

// 计算相似度的函数
function calculateSimilarity(itemVector, randomVector) {
    // 这里可以根据需要计算相似度
    const similarity = itemVector.reduce((sum, v, i) => sum + v * randomVector[i], 0);
    console.log(`Calculated similarity for vector ${itemVector} and ${randomVector}: ${similarity}`); // 展示相似度计算结果
    return similarity;
}

// 修改实际功能并显示结果的函数
function modifyAndDisplayExperts(experts) {
    const tbody = document.querySelector('.expert-decomposition tbody');
    tbody.innerHTML = ''; // 清空现有内容

    console.log('Displaying top 5 experts:'); // 展示正在显示的 top5 专家
    experts.forEach((expert, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expert.expertId}</td>
            <td>${expert.expertName}</td>
            <td>${expert.similarity.toFixed(2)}</td>
        `;
        tbody.appendChild(row);

        // 修改实际功能
        modifyExpertFunctionality(expert, index);
    });
}

// 修改专家实际功能的函数
function modifyExpertFunctionality(expert, index) {
    console.log(`Modifying functionality for expert ${expert.expertName} (${expert.expertId})`); // 展示正在修改功能的专家
    // 这里可以根据需要修改专家的实际功能
    // 例如：expert.functionality = 'New functionality';
}

// 绑定一级专家组合后面的按钮点击事件
document.getElementById('confirm-button').addEventListener('click', function() {
    console.log('一级专家组合按钮被点击'); // 确保按钮点击事件被捕获

    // 生成随机向量
    const randomVector = generateRandomVector();
    console.log('生成的随机向量:', randomVector); // 展示随机向量

    // 从 experts_summary2.csv 中获取数据
    axios.get('experts_summary2.csv')
        .then(function(response) {
            console.log('成功获取 experts_summary2.csv 数据'); // 确保数据已成功获取
            const data = parseCSV(response.data);
            console.log('解析后的数据:', data); // 展示解析后的数据

            // 使用随机向量查找 top5 的专家
            const top5Experts = findTop5ExpertsNew(data, randomVector);
            console.log('找到的 top5 专家:', top5Experts); // 展示 top5 的专家

            // 显示 top5 的专家
            displayTop5ExpertsNew(top5Experts);
        })
        .catch(function(error) {
            console.error('请求失败:', error); // 展示请求失败的错误信息
        });
});

// 生成随机向量的函数
function generateRandomVector() {
    // 这里可以根据需要生成一个随机向量
    const vector = Array.from({ length: 64 }, () => Math.random().toFixed(4));
    console.log('生成的随机向量:', vector); // 展示生成的随机向量
    return vector;
}

// 使用随机向量查找 top5 的专家的新函数
function findTop5ExpertsNew(data, vector) {
    if (!data || !Array.isArray(data)) {
        console.error('无效的数据:', data); // 检查 data 参数是否有效
        return [];
    }

    console.log('正在使用向量查找 top5 专家:', vector); // 展示使用的随机向量

    const expertsWithSimilarity = data.map(item => {
        // 假设每个数据项有一个向量字段
        const similarity = calculateSimilarityNew(item.vector, vector);
        console.log(`计算专家 ${item['Expert Name']} 的相似度: ${similarity}`); // 展示每个专家的相似度
        return { ...item, similarity };
    });

    const sortedExperts = expertsWithSimilarity.sort((a, b) => b.similarity - a.similarity);
    const top5Experts = sortedExperts.slice(0, 5);
    console.log('排序后的专家列表:', sortedExperts); // 展示排序后的专家列表
    return top5Experts;
}

// 计算相似度的新函数
function calculateSimilarityNew(itemVector, randomVector) {
    if (!itemVector || !randomVector) {
        console.error('无效的向量:', itemVector, randomVector); // 检查向量是否有效
        return 0;
    }

    const similarity = itemVector.reduce((sum, v, i) => sum + v * randomVector[i], 0);
    console.log(`计算向量 ${itemVector} 和 ${randomVector} 的相似度: ${similarity}`); // 展示相似度计算结果
    return similarity;
}

// 显示 top5 专家的新函数
function displayTop5ExpertsNew(experts) {
    if (!experts || !Array.isArray(experts)) {
        console.error('无效的专家数据:', experts); // 检查 experts 参数是否有效
        return;
    }

    const tbody = document.querySelector('.expert-decomposition tbody');
    if (!tbody) {
        console.error('tbody 元素未找到'); // 检查 tbody 元素是否存在
        return;
    }

    tbody.innerHTML = ''; // 清空现有内容

    console.log('正在显示 top5 专家:'); // 展示正在显示的 top5 专家
    experts.forEach((expert, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expert['Expert Index']}</td>
            <td>${expert['Expert Name']}</td>
            <td>${expert['Function Description']}</td>
        `;
        tbody.appendChild(row);

        // 修改实际功能
        modifyExpertFunctionalityNew(expert, index);
    });
}

// 修改专家实际功能的新函数
function modifyExpertFunctionalityNew(expert, index) {
    console.log(`正在修改专家 ${expert['Expert Name']} (${expert['Expert Index']}) 的功能`); // 展示正在修改功能的专家
    // 这里可以根据需要修改专家的实际功能
    // 例如：expert.functionality = 'New functionality';
} 