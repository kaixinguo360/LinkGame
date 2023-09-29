
let canvas;
let canvasContext;
let timeoutHandle;

onload = () => {
    canvas = document.getElementById("canvas");
    canvasContext = canvas.getContext("2d");

    let timeDiv = document.getElementById("timeDiv");
    timeDiv.innerText = Date();

    init();

    canvas.onmousedown = (mouseEvent) => {
        clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(() => {
            clearCanvas();
            drawGrid();
            mainLoop();
        }, 100);
        
        // x和y参数为点击处相对于canvas原点的坐标
        let { x, y } = windowToCanvas(canvas, mouseEvent.clientX, mouseEvent.clientY);
        if (x > bx && x < bx+lSize*lx && y > by && y < by+lSize*ly) {
            canvasClickHandler(Math.floor((x-bx)/lSize), Math.floor((y-by)/lSize));
        }
    };
};

const lx = 14, ly = 10; // 砖块数量 (lx*ly)
const lSize = 50; // 砖块大小
const level = 20; // 难度级别, 即多少种不同的砖块
let bx, by; //
let icons, colors, tiles;
let select1, select2;

const init = () => {

    bx = (canvas.width - lSize * lx)/2;
    by = (canvas.height - lSize * ly)/2;

    icons = [
        "🐻","🐷","🐪","🐳","🐘","🐙","🐸","🐵","🐭","🐼",
        "🐌","🦋","🐢","🐇","🦔","🐉","🐈","🐧","🦊","🐰"
    ];

    colors = [];
    for (let i = 0; i < level; i++) {
        colors[i] = getRandomColor();
    }

    tiles = [];
    for (let i = 0; i < lx/2; i++) {
        tiles[i] = [];
        for (let j = 0; j < ly; j++) {
            tiles[i][j] = (i*5+j+level)%level;
        }
    }
    for (let i = lx/2; i < lx; i++) {
        tiles[i] = [];
        for (let j = 0; j < ly; j++) {
            tiles[i][j] = tiles[i-lx/2][j];
        }
    }
    for (let i = 0; i < 100; i++) {
        let ax = Math.floor(Math.random() * lx);
        let ay = Math.floor(Math.random() * ly);
        let bx = Math.floor(Math.random() * lx);
        let by = Math.floor(Math.random() * ly);
        let tmp = tiles[ax][ay];
        tiles[ax][ay] = tiles[bx][by];
        tiles[bx][by] = tmp;
    }

    clearCanvas();
    drawGrid();
    mainLoop();
};

// 坐标为(i, j)的格子被点击事件的处理函数
const canvasClickHandler = (i, j) => {
    drawBox(i, j);
    if (tiles[i][j] !== null) {
        if (!select1) {
            select1 = select1 ? select1 : {i, j};
        } else {
            if (i === select1.i && j === select1.j) {
                select1 = null;
            } else {
                select2 = select2 ? select2 : {i, j};
                check(select1, select2);
                select1 = select2 = null;
            }
        }
    } else {
        select1 = select2 = null;
    }
};

// 已选择的两点后的处理函数
const check = (point1, point2) => {
    if (tiles[point1.i][point1.j] !== tiles[point2.i][point2.j]) {
        return;
    }

    let bool = false;
    let a, b, i, j, test, draw;
    //X
    if (point1.i > point2.i) {
        a = point1; b = point2;
    } else {
        a = point2; b = point1;
    }
    test = () => {
        return (!isBlocked(b.i, j) || j === b.j) &&
            (!isBlocked(a.i, j) || j === a.j) &&
            isConnected(b, {i:b.i, j:j}) &&
            isConnected({i:a.i, j:j}, a) &&
            isConnected({i:a.i, j:j}, {i:b.i, j:j});
    };
    draw = () => {
        drawLine(b, {i:b.i, j:j});
        drawLine({i:a.i, j:j}, a);
        drawLine({i:a.i, j:j}, {i:b.i, j:j});
    };
    for (j = a.j; j>=-1&&!bool; j--) {
        if (test()) {
            draw();
            bool = true;
            break;
        }
    }
    for (j = a.j+1; j<ly+1&&!bool; j++) {
        if (test()) {
            draw();
            bool = true;
            break;
        }
    }
    //Y
    if (point1.j > point2.j) {
        a = point1; b = point2;
    } else {
        a = point2; b = point1;
    }
    test = () => {
        return (!isBlocked(i, b.j) || i === b.i) &&
            (!isBlocked(i, a.j) || i === a.i) &&
            isConnected(b, {i:i, j:b.j}) &&
            isConnected({i:i, j:a.j}, a) &&
            isConnected({i:i, j:a.j}, {i:i, j:b.j});
    };
    draw = () => {
        drawLine(b, {i:i, j:b.j});
        drawLine({i:i, j:a.j}, a);
        drawLine({i:i, j:a.j}, {i:i, j:b.j});
    };
    for (i = a.i; i>=-1&&!bool; i--) {
        if (test()) {
            draw();
            bool = true;
            break;
        }
    }
    for (i = a.i+1; i<lx+1&&!bool; i++) {
        if (test()) {
            draw();
            bool = true;
            break;
        }
    }
    if (bool) {
        removeTile(point1.i, point1.j);
        removeTile(point2.i, point2.j);
    }
};

// 主循环
const mainLoop = () => {
    for (let i = 0; i < tiles.length; i++) {
        for (let j = 0; j < tiles[i].length; j++) {
            if (tiles[i][j] !== null) {
                canvasContext.fillStyle = colors[tiles[i][j]];
                canvasContext.fillRect(bx+i*lSize, by+j*lSize, lSize, lSize);
                canvasContext.font="32px Arial";
                canvasContext.fillStyle = "#ffffff";
                canvasContext.fillText(icons[tiles[i][j]], bx+i*lSize+4, by+j*lSize+37);
            }
        }
    }
    if (select1) {
        drawBox(select1.i, select1.j);
    }
    if (select2) {
        drawBox(select2.i, select2.j);
    }

    for (let i = 0; i<lx; i++) {
        for (let j = 0; j<ly; j++) {
            if (tiles[i][j] !== null) return;
        }
    }

    drawSuccess();
};

// ---------- 工具函数 ---------- //

// 判断坐标(i, j)的格子是否为可选择的砖块: true/false
const isBlocked = (i, j) => {
    return i >= 0 && i < lx && j >= 0 && j < ly && tiles[i][j] !== null;
};

// 判断两砖块是否符合消除要求: true/false
const isConnected = (point1, point2) => {
    let a, b;
    if (point1.i === point2.i) {
        if (point1.j > point2.j) {
            a = point1; b = point2;
        } else {
            a = point2; b = point1;
        }
        for (let j = b.j+1; j<a.j; j++) {
            if (isBlocked(a.i, j)) {
                return false;
            }
        }
        return true;
    } else if (point1.j === point2.j) {
        if (point1.i > point2.i) {
            a = point1; b = point2;
        } else {
            a = point2; b = point1;
        }
        for (let i = b.i+1; i<a.i; i++) {
            if (isBlocked(i,a.j)) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
};

// 生成随机颜色: "#RGB"
const getRandomColor = () => {
    let color = "", x;
    for (let i = 0; i < 3; i++) {
        x = Math.floor(Math.random() * 256).toString(16);
        x = (x.length === 1) ? ("0" + x) : x;
        color += x;
    }
    return "#" + color;
};

// 删除指定砖块
const removeTile = (i, j) => {
    tiles[i][j] = null;
};

// ---------- 绘图函数 ---------- //

// 清空屏幕
const clearCanvas = () => {
    // canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvas.setAttribute('width', canvas.width);
    canvas.setAttribute('height', canvas.height);
};

// 绘制背景 (栅格线)
const drawGrid = () => {
    canvasContext.lineWidth = 1;
    canvasContext.fillStyle = "#cdcdcd";
    canvasContext.strokeStyle = "#ededed";
    canvasContext.font = "10px sans-serif";
    for (let i = 0; i < canvas.width; i+=100) {
        canvasContext.fillText(i+"", i, 10);
        canvasContext.moveTo(i, 0);
        canvasContext.lineTo(i, canvas.height);
    }
    for (let j = 0; j < canvas.height; j+=100) {
        canvasContext.fillText(j+"", 0, j);
        canvasContext.moveTo(0, j);
        canvasContext.lineTo(canvas.width, j);
    }
    canvasContext.stroke();

};

// 绘制直线
const drawLine = (point1, point2) => {
    canvasContext.lineWidth = 5;
    canvasContext.strokeStyle = "#fffd00";
    canvasContext.beginPath();
    canvasContext.moveTo(bx+point1.i*lSize+(lSize/2), by+point1.j*lSize+(lSize/2));
    canvasContext.lineTo(bx+point2.i*lSize+(lSize/2), by+point2.j*lSize+(lSize/2));
    canvasContext.stroke();
};

// 在指定坐标的砖块外绘制一个选中框
const drawBox = (i, j) => {
    canvasContext.fillStyle = "#00000022";
    canvasContext.fillRect(bx+i*lSize, by+j*lSize, lSize, lSize);
    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = "#0099ff";
    canvasContext.strokeRect(bx+i*lSize, by+j*lSize, lSize, lSize);
};

// 绘制成功庆祝画面
const drawSuccess = () => {

    let timeHandle = setInterval(() => {
        canvasContext.font = 22 + Math.floor(Math.random()*40) + "px Arial";
        canvasContext.fillText(icons[Math.floor(Math.random()*20)], -100+Math.random()*(canvas.width+200), -100+Math.random()*(canvas.height+200));
    }, 50);

    setTimeout(() => {
        clearInterval(timeHandle);
        canvasContext.font = "64px Arial";
        canvasContext.fillStyle = "#ffffff";
        canvasContext.fillRect(canvas.width/2-150, canvas.height/2-70, 300, 100);
        canvasContext.strokeStyle = "#cdcdcd";
        canvasContext.lineWidth = 5;
        canvasContext.strokeRect(canvas.width/2-150, canvas.height/2-70, 300, 100);
        canvasContext.fillStyle = "#cdcdcd";
        canvasContext.fillText("Success!", canvas.width/2-130, canvas.height/2);
    }, 3000);
};

// Copy
const windowToCanvas = (canvas, x, y) => {
    //获取canvas元素距离窗口的一些属性，MDN上有解释
    let rect = canvas.getBoundingClientRect();
    //x和y参数分别传入的是鼠标距离窗口的坐标，然后减去canvas距离窗口左边和顶部的距离。
    return {
        x: x - rect.left * (canvas.width/rect.width),
        y: y - rect.top * (canvas.height/rect.height)
    }
};
