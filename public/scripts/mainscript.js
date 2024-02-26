const ANIMATE = true;
const FORWARD = true;
const ADAPTIVE = true;

const sleepTime = 10;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// map: 2d array of ints
// 0 = empty, 1 = wall, 2 = unknown, 3 = currentPos, 4 = start, 5 = end, 6 = open, 7 = closed
const EMPTY = 0; // gray
const WALL = 1; // black
const UNKNOWN = 2; // dark gray
const CURRENTPOS = 3; // red
const START = 4; // green
const GOAL = 5; // blue
const OPEN = 6; // yellow
const CLOSED = 7; // cyan
const REALPATH = 8 // pink
const RESTPATH = 9 // purple

function updateCanvas(id, map) {
    let canvas = document.getElementById(id);
    let ctx = canvas.getContext("2d");
    let squareColors = ["#EEEEEE", "#333333", "#999999", "#EE3333", "#33EE33", "#3333EE", "#EEEE33", "#33EEEE", "#EE33EE", "#AD33EE"];
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let boxSize = Math.min(canvas.width / map[0].length, canvas.height / map.length);
    // draw the boxes
    for (let x = 0; x < map.length; x++) {
        for (let y = 0; y < map[0].length; y++) {
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

// right, up, left, down
const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

async function generateMazeButton() {
    let seedString = document.getElementById("seed").value;
    let mazeWidth = Number(document.getElementById("mazeWidth").value);
    let mazeHeight = Number(document.getElementById("mazeHeight").value);
    let map = await generateMaze(seedString, mazeWidth, mazeHeight);

    // await sleep(sleepTime)    
    globalCounter = 0;
    await repeatedForwardA(map, new Node(0, 1), new Node(map[0].length - 1, map.length - 2), FORWARD, ADAPTIVE);
    console.log("states explored: " + globalCounter);

    ////adaptive
    //map = getMapFromMaze(maze, curX, curY);
    //await sleep(sleepTime)    
    //globalCounter = 0;
    //await repeatedForwardA(map, new Node(0, 1), new Node(map[0].length-1, map.length-2), true, true);
    //console.log("states explored: " + globalCounter);
    // choose random spot for end
    // let startx = Math.floor(Math.random() * maze[0].length)*2+1
    // let starty = Math.floor(Math.random() * maze[0].length)*2+1
    // let endx = Math.floor(Math.random() * maze[0].length)*2+1
    // let endy = Math.floor(Math.random() * maze[0].length)*2+1
    // repeatedForwardA(map, new Node(startx, starty), new Node(endx, endy), false, true);
}

async function generateMazebad(seedString, mazeWidth, mazeHeight) {
    let seed = cyrb128(seedString);
    let rand = splitmix32(seed[0]);
    mazeWidth = mazeWidth * 2 + 1
    mazeHeight = mazeHeight * 2 + 1
    let maze = Array.from(Array(mazeWidth), _ => Array(mazeHeight).fill(EMPTY));
    for (let x = 0; x < mazeWidth-1; x++) {

        for (let y = 0; y < mazeWidth; y++) {
            maze[x][y] = (rand() > 0.1) ? EMPTY : WALL;
        }
    }
    maze[0][1] = EMPTY
    maze[mazeWidth-1][mazeHeight-2] = EMPTY
    updateCanvas("canvas", maze);
    return maze;
}
// reads size from the input fields, then generates the maze
async function generateMaze(seedString, mazeWidth, mazeHeight) {
    let seed = cyrb128(seedString);
    let rand = splitmix32(seed[0]);

    // array with numbers saying which direction you came from, -1 if unvisited
    let maze = Array.from(Array(mazeWidth), _ => Array(mazeHeight).fill(-1));

    let curX = 0;
    let curY = 0;
    maze[curX][curY] = 0; // went right to get here
    let endX = mazeWidth - 1;
    let endY = mazeHeight - 1;

    let count = 1; // initialize as 1 (starting square)
    let totalSquares = mazeWidth * mazeHeight;

    while (count < totalSquares) {
        // determine which directions are valid
        let validDirections = [];
        for (let d = 0; d < directions.length; d++) {
            let dir = directions[d]
            let neighX = curX + dir[0];
            let neighY = curY + dir[1];
            // check for out of bounds
            if (neighX < 0 || neighX >= mazeWidth || neighY < 0 || neighY >= mazeWidth) {
                continue;
            }
            // check if visited already
            if (maze[neighX][neighY] != -1) {
                continue;
            }
            // this direction is good to explore
            validDirections.push(dir);
        }
        // if there are no valid direcitons, then backtrack
        if (validDirections.length == 0 || (curX == endX && curY == endY)) {
            let dirCameFrom = directions[maze[curX][curY]];
            curX -= dirCameFrom[0];
            curY -= dirCameFrom[1];
            // updateCanvas(getMapFromMaze(maze, curX, curY));
            // await sleep(sleepTime)
            continue;
        }
        // move to a random neighbor
        let pickedDir = validDirections[Math.floor(rand() * validDirections.length)]
        curX += pickedDir[0];
        curY += pickedDir[1];
        maze[curX][curY] = directions.indexOf(pickedDir);
        count++;
        // uppdate the visual
        if (ANIMATE) {
            updateCanvas("canvas", getMapFromMaze(maze, curX, curY));
            await sleep(sleepTime)
        }
    }

    updateCanvas("canvas", getMapFromMaze(maze, curX, curY));

    //forward
    let map = getMapFromMaze(maze, curX, curY);
    return map;
}

// turns map into maze with walls in between cells
function getMapFromMaze(maze, curX, curY) {
    let mapW = 2 * maze.length + 1;
    let mapH = 2 * maze[0].length + 1;
    let map = Array.from(Array(mapW), _ => Array(mapH).fill(1));

    for (let x = 0; x < maze.length; x++) {
        for (let y = 0; y < maze[0].length; y++) {
            // empty the path to show where you came from
            if (maze[x][y] == -1) {
                continue;
            }
            // empty out the cell
            map[2 * x + 1][2 * y + 1] = 0;
            let dirCameFrom = directions[maze[x][y]];
            map[2 * x + 1 - dirCameFrom[0]][2 * y + 1 - dirCameFrom[1]] = 0;
        }
    }
    // set current position
    map[2 * curX + 1][2 * curY + 1] = 3
    map[mapW - 1][mapH - 2] = 0; // open the exit

    //testing

    return map;
}

async function runtests() {
    let results = [];
    for (i = 0; i < 50; i++) {
        let seed = "seed" + i;
        let map = await generateMaze(seed, 50, 50)
        globalCounter = 0;
        console.log(FORWARD + ", " + ADAPTIVE)
        await repeatedForwardA(map, new Node(0, 1), new Node(map[0].length - 1, map.length - 2), FORWARD, ADAPTIVE);
        console.log(i + " states explored: " + globalCounter);

        results.push(globalCounter);
    }
    console.log(results)
    let avg = 0;
    results.forEach(r => avg += r)
    avg /= 50;
    console.log("average: " + avg)

}
