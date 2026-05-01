document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.getElementById('cards-container');
    const refreshBtn = document.getElementById('refresh-btn');
    const showAnswerBtn = document.getElementById('show-answer-btn');
    const answerContainer = document.getElementById('answer-container');
    const toast = document.getElementById('toast');

    let currentSolution = "";

    // 1. 24点计算逻辑 (增强版：返回解法字符串)
    function solve24(nums) {
        // nums 是对象数组 [{ val: number, expr: string }]
        if (nums.length === 1) {
            if (Math.abs(nums[0].val - 24) < 0.001) {
                return nums[0].expr;
            }
            return null;
        }

        for (let i = 0; i < nums.length; i++) {
            for (let j = 0; j < nums.length; j++) {
                if (i === j) continue;

                const nextNumsBase = [];
                for (let k = 0; k < nums.length; k++) {
                    if (k !== i && k !== j) nextNumsBase.push(nums[k]);
                }

                const n1 = nums[i];
                const n2 = nums[j];

                const ops = [
                    { val: n1.val + n2.val, expr: `(${n1.expr} + ${n2.expr})` },
                    { val: n1.val - n2.val, expr: `(${n1.expr} - ${n2.expr})` },
                    { val: n1.val * n2.val, expr: `(${n1.expr} * ${n2.expr})` }
                ];
                if (Math.abs(n2.val) > 0.001) {
                    ops.push({ val: n1.val / n2.val, expr: `(${n1.expr} / ${n2.expr})` });
                }

                for (const op of ops) {
                    const res = solve24([...nextNumsBase, op]);
                    if (res) return res;
                }
            }
        }
        return null;
    }

    // 2. 弹窗提示
    function showToast(message, duration = 2000) {
        toast.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }

    /**
     * 生成并更新4张卡片的数字，确保可解
     */
    async function generateNumbers() {
        // 隐藏上一次的答案
        answerContainer.style.display = 'none';
        answerContainer.textContent = "";

        let numbers = [];
        let solution = null;

        while (!solution) {
            numbers = [];
            for (let i = 0; i < 4; i++) {
                numbers.push(Math.floor(Math.random() * 13) + 1);
            }

            // 转换格式给 solve24
            const initialNums = numbers.map(n => ({ val: n, expr: n.toString() }));
            solution = solve24(initialNums);

            if (!solution) {
                showToast("无法生成24");
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        currentSolution = solution;

        const cards = cardsContainer.querySelectorAll('.num');
        cards.forEach((card, index) => {
            const cardParent = card.parentElement;
            cardParent.style.opacity = '0';
            cardParent.style.transform = 'translateY(20px) scale(0.8)';
            
            setTimeout(() => {
                card.textContent = numbers[index];
                cardParent.style.opacity = '1';
                cardParent.style.transform = 'translateY(0) scale(1)';
            }, index * 100);
        });
    }

    // 3. 绑定按钮事件
    refreshBtn.addEventListener('click', generateNumbers);

    showAnswerBtn.addEventListener('click', () => {
        if (currentSolution) {
            // 去掉最外层的括号
            let displayExpr = currentSolution;
            if (displayExpr.startsWith('(') && displayExpr.endsWith(')')) {
                displayExpr = displayExpr.substring(1, displayExpr.length - 1);
            }
            answerContainer.textContent = `解法：${displayExpr} = 24`;
            answerContainer.style.display = 'block';
        }
    });

    // 初始生成一次
    generateNumbers();
});
