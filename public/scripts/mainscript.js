console.log("hello brogaer");

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// map: 2d array of ints
// 0 = empty, 1 = wall, 2 = unknown, 3 = start, 4 = end, 5 = open, 6 = closed
function updateCanvas(map) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let squareColors = ["#EEEEEE", "#333333", "#999999"];
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let boxSize = Math.min(canvas.width / map[0].length, canvas.height / map.length);
    // draw the boxes
    for (let x = 0; x < map.length; x++) {
        for (let y = 0; y < map.length; y++) {
            let curSquare = map[x][y];
            ctx.fillStyle = squareColors[curSquare];
            ctx.fillRect(x * boxSize, (map[0].length - y - 1) * boxSize, boxSize, boxSize);
        }
    }
    // draw grid lines
    ctx.strokeStyle = "#CCCCCC";
    for (let i = 0; i < map.length + 1; i++) {
        drawLine(ctx, i * boxSize, 0, i * boxSize, map[0].length * boxSize);
    }
    for (let i = 0; i < map[0].length + 1; i++) {
        drawLine(ctx, 0, i * boxSize, map.length * boxSize, i * boxSize);
    }
}

// reads size from the input fields, then generates the maze
function generateMaze() {

    let mazeWidth = document.getElementById("mapWidth").value;

    let mapW = 10;
    let mapH = 7;
    let map = Array.from(Array(mapW), _ => Array(mapH).fill(0));
    map[2][4] = 1;
    map[5][2] = 1;
    map[7][3] = 2;
    updateCanvas(map);
}


