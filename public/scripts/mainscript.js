/**
 * This file contains the main script to run the A* algorithm and generate the maze. In addition, it contains the functions to visualize the maze, the path, and the algorithm's progress.
 * 
 * @author Brandon Cheng, Arya Shetty, Damon Lin
 */

let ANIMATE = true;
let FORWARD = true;
let ADAPTIVE = false;
let SPEED = 10;

const sleepTime = 10;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function setAnimate() {
    ANIMATE = document.getElementById("animate").checked;
}
function setForward() {
    FORWARD = document.getElementById("forward").checked;
}
function setAdaptive() {
    ADAPTIVE = document.getElementById("adaptive").checked;
}
function test(val) {
    SPEED = val;
}

/**
 * This function draws a line on the canvas.
 * @param {CanvasRenderingContext2D} ctx The context of the canvas to draw on.
 * @param {Number} x1 The x-coordinate of the starting point of the line.
 * @param {Number} y1 The y-coordinate of the starting point of the line.
 * @param {Number} x2 The x-coordinate of the ending point of the line.
 * @param {Number} y2 The y-coordinate of the ending point of the line.
 */
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

/**
 * This function updates the canvas with the given map.
 * 
 * @param {String} id The id of the canvas to update.
 * @param {Array} map The map to update the canvas with.
 */
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

/**
 * The generateMazeButton function reads the seed, width, and height from the input fields, and then generates the maze. It is called when the "Generate Maze" button is clicked.
 */
async function generateMazeButton() {
    let seedString = document.getElementById("seed").value;
    let mazeWidth = Number(document.getElementById("mazeWidth").value);
    let mazeHeight = Number(document.getElementById("mazeHeight").value);
    let map = await generateMaze(seedString, mazeWidth, mazeHeight);

    // await sleep(sleepTime)    
    globalCounter = 0;
    updateStatesExplored()
    await repeatedForwardA(map, new Node(0, 1), new Node(map.length - 1, map[0].length - 2), FORWARD, ADAPTIVE);
    console.log("states explored: " + globalCounter);
}

/**
 * The generateMazeSpots function reads the seed, width, and height from the input fields, and then generates the maze. It is called when the "Generate Maze" button is clicked.
 */
async function generateMazeSpots(seedString, mazeWidth, mazeHeight) {
    let seed = cyrb128(seedString);
    let rand = splitmix32(seed[0]);
    mazeWidth = mazeWidth * 2 + 1
    mazeHeight = mazeHeight * 2 + 1
    let maze = Array.from(Array(mazeWidth), _ => Array(mazeHeight).fill(EMPTY));
    for (let x = 0; x < mazeWidth - 1; x++) {

        for (let y = 0; y < mazeWidth; y++) {
            maze[x][y] = (rand() > 0.1) ? EMPTY : WALL;
        }
    }
    maze[0][1] = EMPTY
    maze[mazeWidth - 1][mazeHeight - 2] = EMPTY
    updateCanvas("canvas", maze);
    return maze;
}
// reads size from the input fields, then generates the maze

/**
 * The generateMaze function generates a maze based on the given seed, width, and height.
 * 
 * @param {String} seedString The seed to use for the random number generator.
 * @param {Number} mazeWidth The width of the maze to generate.
 * @param {Number} mazeHeight The height of the maze to generate.
 * @returns {Array} The generated maze.
 */
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
            if (neighX < 0 || neighX >= mazeWidth || neighY < 0 || neighY >= mazeHeight) {
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
            // updateCanvas("canvas", getMapFromMaze(maze, curX, curY));
            await speedControlled(() => updateCanvas("canvas", getMapFromMaze(maze, curX, curY)));
            // await sleep(sleepTime)
        }
    }

    updateCanvas("canvas", getMapFromMaze(maze, curX, curY));

    //forward
    let map = getMapFromMaze(maze, curX, curY);
    return map;
}

// turns map into maze with walls in between cells
/**
 * The getMapFromMaze function turns the given maze into a map with walls in between cells. It also sets the current position and the exit.
 * 
 * @param {Array} maze The maze to turn into a map.
 * @param {Number} curX The x-coordinate of the current position.
 * @param {Number} curY The y-coordinate of the current position.
 * @returns {Array} The map with walls in between cells.
 */
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

    return map;
}

/**
 * The updateStatesExplored function updates the states explored counter on the page.
 */
function updateStatesExplored() {
    document.getElementById("statesExplored").innerHTML = "States Explored: " + globalCounter;
}

/**
 * The runtests function runs the A* algorithm 50 times and prints the results to the console.
 */
async function runtests() {
    let results = [];
    for (i = 0; i < 50; i++) {
        let seed = "seed" + i;
        let map = await generateMaze(seed, 50, 50)
        globalCounter = 0;
        updateStatesExplored()
        console.log(FORWARD + ", " + ADAPTIVE)
        await repeatedForwardA(map, new Node(0, 1), new Node(map.length - 1, map[0].length - 2), FORWARD, ADAPTIVE);
        console.log(i + " states explored: " + globalCounter);

        results.push(globalCounter);
    }
    console.log(results)
    let avg = 0;
    results.forEach(r => avg += r)
    avg /= 50;
    console.log("average: " + avg)
}

const speedMin = 0;
const transition = 20;
const speedMax = 100;
let frameCounter = 0;
let thresh = 0;

/**
 * This function controls the speed of the visualization.
 * 
 * @param {Function} func The function to call after waiting for the speed.
 */
async function speedControlled(func) {
    if (SPEED == 0) {
        // wait until speed is not 0 anymore
        while (SPEED == 0) {
            await sleep(100);
        }
    }
    if (SPEED <= transition) {
        await sleep(1000 / Math.pow(SPEED, 2));
        func();
    } else {
        // frame skipping: (speed/10)^2 calls per frame
        frameCounter++;
        thresh = Math.pow(((SPEED-transition)/10 + 1), 3)
        if (frameCounter > thresh) {
            func();
            await sleep(1);
            frameCounter -= thresh;
        }
    }
}
