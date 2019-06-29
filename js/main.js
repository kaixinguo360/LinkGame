
let c;
let ctx;
let timeoutHandle;

onload = () => {
    c = document.getElementById("canvas");
    ctx = c.getContext("2d");

    let time = document.getElementById("time");
    time.innerText = Date();

    init();

    c.onmousedown = (e) => {
        clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(() => {
            clearAll();
            drawGrid();
            mainLoop();
        }, 100);
        let ele = windowToCanvas(c, e.clientX, e.clientY);
        let { x, y } = ele;
        if (x > bx && x < bx+50*lx && y > by && y < by+50*ly) {
            onclick(Math.floor((x-bx)/50), Math.floor((y-by)/50));
        }
    };
};

const lx = 14, ly = 10;
const level = 20;
let bx, by;
let icons, colors, tiles;
let select1, select2;

const init = () => {

    bx = (c.width - 50 * lx)/2;
    by = (c.height - 50 * ly)/2;

    icons = [
        "🐻","🐷","🐪","🐳","🐘","🐙","🐸","🐵","🐭","🐼",
        "🐌","🦋","🐢","🐇","🦔","🐉","🐈","🐧","🦊","🐰"
    ];

    colors = [];
    for (let i = 0; i < level; i++) {
        colors[i] = randomColor();
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

    clearAll();
    drawGrid();
    mainLoop();
};

const onclick = (i, j) => {
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

const isBlocked = (i, j) => {
    return i >= 0 && i < lx && j >= 0 && j < ly && tiles[i][j] !== null;
};

const clearAll = () => {
    // ctx.clearRect(0, 0, c.width, c.height);
    c.setAttribute('width', c.width);
    c.setAttribute('height', c.height);
};

const drawGrid = () => {
    ctx.lineWidth = 1;
    ctx.fillStyle = "#cdcdcd";
    ctx.strokeStyle = "#ededed";
    ctx.font = "10px sans-serif";
    for (let i = 0; i < c.width; i+=100) {
        ctx.fillText(i+"", i, 10);
        ctx.moveTo(i, 0);
        ctx.lineTo(i, c.height);
    }
    for (let j = 0; j < c.height; j+=100) {
        ctx.fillText(j+"", 0, j);
        ctx.moveTo(0, j);
        ctx.lineTo(c.width, j);
    }
    ctx.stroke();

};

const mainLoop = () => {
    for (let i = 0; i < tiles.length; i++) {
        for (let j = 0; j < tiles[i].length; j++) {
            if (tiles[i][j] !== null) {
                ctx.fillStyle = colors[tiles[i][j]];
                ctx.fillRect(bx+i*50, by+j*50, 50, 50);
                ctx.font="32px Arial";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(icons[tiles[i][j]], bx+i*50+4, by+j*50+37);
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

const randomColor = () => {
    let color = "", x;
    for (let i = 0; i < 3; i++) {
        x = Math.floor(Math.random() * 256).toString(16);
        x = (x.length === 1) ? ("0" + x) : x;
        color += x;
    }
    return "#" + color;
};

const removeTile = (i, j) => {
    tiles[i][j] = null;
};

const drawLine = (point1, point2) => {
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#fffd00";
    ctx.beginPath();
    ctx.moveTo(bx+point1.i*50+25, by+point1.j*50+25);
    ctx.lineTo(bx+point2.i*50+25, by+point2.j*50+25);
    ctx.stroke();
};

const drawBox = (i, j) => {
    ctx.fillStyle = "#00000022";
    ctx.fillRect(bx+i*50, by+j*50, 50, 50);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0099ff";
    ctx.strokeRect(bx+i*50, by+j*50, 50, 50);
};

const drawSuccess = () => {

    let timeHandle = setInterval(() => {
        ctx.font = 22 + Math.floor(Math.random()*40) + "px Arial";
        ctx.fillText(icons[Math.floor(Math.random()*20)], -100+Math.random()*(c.width+200), -100+Math.random()*(c.height+200));
    }, 50);

    setTimeout(() => {
        clearInterval(timeHandle);
        ctx.font = "64px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(c.width/2-150, c.height/2-70, 300, 100);
        ctx.strokeStyle = "#cdcdcd";
        ctx.lineWidth = 5;
        ctx.strokeRect(c.width/2-150, c.height/2-70, 300, 100);
        ctx.fillStyle = "#cdcdcd";
        ctx.fillText("Success!", c.width/2-130, c.height/2);
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