// 词云图可视化组件
class MathWordCloud {
    constructor(containerId, data) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.width = 400;
        this.height = 300;
        this.init();
    }

    init() {
        // 创建SVG容器
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', this.width);
        this.svg.setAttribute('height', this.height);
        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this.svg.style.width = '100%';
        this.svg.style.height = '100%';
        
        this.container.appendChild(this.svg);
        this.render();
    }

    // 生成词云布局
    generateLayout() {
        const words = this.data.math_tokens.map(token => ({
            ...token,
            fontSize: Math.max(10, Math.min(32, token.weight * 0.35)),
            color: this.data.categories[token.category] || '#333'
        }));

        // 改进的分散布局算法
        const center = { x: this.width / 2, y: this.height / 2 };
        const positions = [];
        
        words.forEach((word, index) => {
            // 使用更大的角度步长和半径增长，使分布更分散
            const angle = index * 0.8 + Math.random() * 0.4; // 增加随机性
            const radius = Math.sqrt(index) * 12 + Math.random() * 20; // 增加半径和随机偏移
            
            // 添加一些随机偏移使分布更自然
            const randomOffsetX = (Math.random() - 0.5) * 40;
            const randomOffsetY = (Math.random() - 0.5) * 40;
            
            const x = center.x + radius * Math.cos(angle) + randomOffsetX;
            const y = center.y + radius * Math.sin(angle) + randomOffsetY;
            
            // 确保文字在画布范围内，留更多边距
            const margin = word.fontSize * 2;
            const clampedX = Math.max(margin, Math.min(this.width - margin, x));
            const clampedY = Math.max(margin, Math.min(this.height - margin, y));
            
            positions.push({
                ...word,
                x: clampedX,
                y: clampedY
            });
        });

        return positions;
    }

    render() {
        const words = this.generateLayout();
        
        words.forEach(word => {
            const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElement.setAttribute('x', word.x);
            textElement.setAttribute('y', word.y);
            textElement.setAttribute('font-size', word.fontSize);
            textElement.setAttribute('fill', word.color);
            textElement.setAttribute('text-anchor', 'middle');
            textElement.setAttribute('dominant-baseline', 'middle');
            textElement.setAttribute('font-family', 'Arial, sans-serif');
            textElement.setAttribute('font-weight', word.weight > 70 ? 'bold' : 'normal');
            textElement.textContent = word.text;
            
            // 添加悬停效果
            textElement.style.cursor = 'pointer';
            textElement.style.transition = 'all 0.3s ease';
            
            textElement.addEventListener('mouseenter', () => {
                textElement.setAttribute('fill', '#ff6b6b');
                textElement.setAttribute('font-size', word.fontSize * 1.2);
            });
            
            textElement.addEventListener('mouseleave', () => {
                textElement.setAttribute('fill', word.color);
                textElement.setAttribute('font-size', word.fontSize);
            });
            
            this.svg.appendChild(textElement);
        });
    }

    // 更新数据
    updateData(newData) {
        this.data = newData;
        this.svg.innerHTML = '';
        this.render();
    }
}

// 导出类供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathWordCloud;
}