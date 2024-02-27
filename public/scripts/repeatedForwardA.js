console.log("repeatBroga");
//let trueMap = [];

//IMPORTANT, do i know the goal and start for the mazes??

//fix repeated forward A*
//These are the steps:
// make a big a*
// make a copy of maze that is filled with 2's
// make a helper a*
// return a path 
// if the path reaches the goal, you are good
// if you run into a wall update as you go on each node
// rerun helper a*
// how would i stop it????? from going on forever
// also fix so that the start changes to the node you hit before the wall
// Now that you fixed the previous one, you encountered a new problem with saving extra path lenght making it less optimal, explain 

//second repeated forward A*
// difference being if the f values are the same then it should break on either the g cost being higher or the g cost being lower

// backward start from goal, and move goal

// adaptive idk

// input: map, start, end
// true map: int 2d array
// position: x y
// believed map: int 2d array (0: empty, 1 wall, 2 unknown (assume is empty) )

// A* procedure: input a believed map, position, goal, open, closed lists
//   current state = position, current state is closed
//   while (not done) 
//     look at neighbors of current state
//     add the neighbors that are "empty" and not closed
//     current state = look at best one in the open list, and set that one as closed (if no more in opoen list, then no possible route)

// after A*:
// "try to follow the path"
// reveal parts of hte true map when they are gotten to
// if a part of our super cool path is blocked in reality, then rerun A* entirely, at your current position
class Node {
    constructor(x, y) {
        this.parent = null;
        this.x = x;
        this.y = y;
        this.g = 1000000;
        this.h = 0;
        this.f = 0;
    }
}

// let top = 0;
// const parent = i => ((i + 1) >>> 1) - 1; //i is the node in the binary heap, calculates the floor division of i+1 by 2, -1 gives index of parent 
// const left = i => (i << 1) + 1;
// const right = i => (i + 1) << 1;
//Have to swap with your own heap IMPORTANT for extra credit so change later just for testing
//need to have heap compare the h + g values
//IMPORTANT: so does this make sense to have the main difference between the two repeated foward a* be here 
let globalCounter = 0;
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    enqueue(element) {
        this.heap.push(element);
        this.bubbleUp();
    }

    dequeue(index) {
        globalCounter++;

        let min = this.heap[index];
        let last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[index] = last;
            this.bubbleDown(index);
        }
        return min;
    }

    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2); //???
            if (this.heap[parentIndex].f <= this.heap[index].f) {
                break;
            }
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    bubbleDown(index) {
        let length = this.heap.length;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;
            if (leftChildIndex < length && this.heap[leftChildIndex].f < this.heap[smallest].f) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex < length && this.heap[rightChildIndex].f < this.heap[smallest].f) {
                smallest = rightChildIndex;
            }
            if (smallest === index) {
                break;
            }

            this.swap(index, smallest);
            index = smallest;
        }
    }

    swap(i, j) {
        let temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;

    }

    isEmpty() {
        return this.heap.length === 0;
    }

    contains(node) {
        return this.heap.some(n => n.x === node.x && n.y === node.y);
    }

}

function calculateHeuristic(position, goal, oldGvals, goalVal) {
    let res = -1;
    // check for adaptive A*
    if (oldGvals !== undefined) {
        let oldVal = oldGvals[position.x][position.y]
        if (oldVal != -1) {
            res = oldGvals[goal.x][goal.y] - oldVal;
            //return res;
        }
    }

    let dx = Math.abs(position.x - goal.x);
    let dy = Math.abs(position.y - goal.y);

    // return Math.max(Math.sqrt(dx * dx + dy * dy));
    return Math.max(dx + dy, res);
    // return dx + dy
}

function setContains(set, node) {
    for (let i = 0; i < set.length; i++) {
        let n = set[i]
        if (n.x == node.x && n.y == node.y) {
            return true;
        }
    }
    return false;
}

function nodeIndexOf(arr, node) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].x == node.x && arr[i].y == node.y) {
            return i;
        }
    }
    return -1;
}

function getNeighbors(currentNode, trueMap, nodes) {
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const validDirections = [];
    for (let d = 0; d < directions.length; d++) {
        let dir = directions[d];
        let nx = currentNode.x + dir[0];
        let ny = currentNode.y + dir[1];
        if (nx < 0 || nx >= nodes.length || ny < 0 || ny >= nodes[0].length) {
            continue;
        }
        if (trueMap[nx][ny] == WALL) {
            continue;
        }
        validDirections.push(nodes[nx][ny])

    }
    return validDirections;
}

function makeCopy(map) {
    // let copy = Array.from(Array(map.length), _ => Array(map[0].length).fill(0)); // Initialize each row individually
    // return copy.map((_, i) => map[i].map(n => n));
    let copy = [];
    for (let x = 0; x < map.length; x++) {
        let row = [];
        for (let y = 0; y < map[0].length; y++) {
            row.push(new Number(map[x][y]));
        }
        copy.push(row);
    }
    return copy;
}

async function repeatedForwardA(map, start, goal, isForward, isAdaptive) {
    await (new Promise(r => setTimeout(r, 1000)));
    let trueMap = Array.from(Array(map.length), _ => Array(map[0].length).fill(0).map(_ => 2)); // Initialize each row individually
    let path;
    let currentNode;
    // setup storage of old s values for adaptive
    let oldGvals;
    if (isAdaptive) {
        oldGvals = Array.from(Array(map.length), _ => Array(map[0].length).fill(0).map(_ => -1));
    }
    if (isForward) {
        trueMap[start.x][start.y] = START;
        trueMap[goal.x][goal.y] = GOAL;
        currentNode = start;
        updateSurroundings(start, trueMap, map);
        path = await repeatedForwardAHelper(trueMap, start, goal, oldGvals);
    }
    else { //FOR BACKWARDS IMPLEMENTATION
        trueMap[start.x][start.y] = GOAL;
        trueMap[goal.x][goal.y] = START;
        currentNode = goal;
        updateSurroundings(goal, trueMap, map);
        path = (await repeatedForwardAHelper(trueMap, goal, start, oldGvals)).reverse();
    }
    let realPath = [];
    while (path !== undefined) {

        if (ANIMATE) {
            await displayFollowPath(trueMap, currentNode, realPath, path);
        }

        let nextNode = path[0];
        path.splice(0, 1);

        // check next node
        if (nextNode.x >= 0 && nextNode.y >= 0 && map[nextNode.x][nextNode.y] == WALL) {
            // console.log("Didn't reach the goal, hit a wall");
            if (isForward) {
                path = await repeatedForwardAHelper(trueMap, currentNode, goal, oldGvals);
            }
            else {
                path = (await repeatedForwardAHelper(trueMap, goal, currentNode, oldGvals)).reverse();
            }
            continue;
        }
        else if (trueMap[nextNode.x][nextNode.y] == ((isForward) ? GOAL : START)) {
            console.log("Reached the goal, yay");
            realPath.push(currentNode);
            realPath.push(nextNode);
            displayFollowPath(trueMap, nextNode, realPath, path);
            return realPath;
        }

        // iterate the position
        realPath.push(currentNode);
        currentNode = nextNode;

        // update surroundings
        updateSurroundings(currentNode, trueMap, map);
    }

    console.log(realPath);
    return realPath;
}

function updateSurroundings(currentNode, trueMap, map) {

    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    for (let d = 0; d < directions.length; d++) {
        let direction = directions[d];

        let cX = currentNode.x + direction[0];
        let cY = currentNode.y + direction[1];
        if (cX >= 0 && cX < map.length && cY >= 0 && cY < map[0].length) {
            let val = map[cX][cY];
            if (val == EMPTY || val == WALL) {
                if (trueMap[cX][cY] == UNKNOWN) {
                    trueMap[cX][cY] = val;
                }
            }
        }
    }

}


//is map unknown or known one when inputting, start is node, and goal is node
async function repeatedForwardAHelper(trueMap, start, goal, oldGvals) {
    // create grid of nodes
    let nodes = [];
    for (let x = 0; x < trueMap.length; x++) {
        let row = [];
        for (let y = 0; y < trueMap.length; y++) {
            row.push(new Node(x, y));
        }
        nodes.push(row);
    }
    let openList = new PriorityQueue();
    let closedList = [];
    nodes[start.x][start.y] = start;
    nodes[goal.x][goal.y] = goal;
    start.g = 0;
    start.h = calculateHeuristic(start, goal, oldGvals);
    start.f = 100000 * (start.g + start.h) - start.g;
    openList.enqueue(start);
    goal.g = 1000000
    goal.h = 0;
    goal.f = 100000 * (goal.g + goal.h) - goal.g;
    while (openList.heap.length > 0 && goal.f > openList.heap[0].f) {

        let currentNode = openList.dequeue(0);
        if (ANIMATE) {
            await displayAHelper(trueMap, currentNode, start, goal, openList, closedList);
        }
        closedList.push(currentNode);

        let neighbors = getNeighbors(currentNode, trueMap, nodes);
        for (let neighbor of neighbors) {
            let nextCost = currentNode.g + 1;
            if (nextCost < neighbor.g) { //check if in open set alredy taking this would reduce the cost or not in open set then also check
                neighbor.g = nextCost;
                neighbor.h = calculateHeuristic(neighbor, goal, oldGvals);
                // tie breaking
                neighbor.f = 100000 * (neighbor.g + neighbor.h) - neighbor.g;
                neighbor.parent = currentNode;

                // add/update queue
                if (openList.contains(neighbor)) {
                    openList.dequeue(nodeIndexOf(openList.heap, neighbor));
                }

                openList.enqueue(neighbor);
            }
        }
    }
    // after done, reconstruct the path
    if (goal.parent !== null) {
        let path = [];
        let currentPath = goal;
        while (currentPath != null) {
            //add nodes to the path instead pls
            path.unshift(currentPath); //add to the beginning
            // check if we hit the start
            if (currentPath == start) {
                break;
            }
            currentPath = currentPath.parent;
        }
        // if adaptive, give array of g vals
        if (oldGvals !== undefined) {
            //openList.heap.forEach(n => oldGvals[n.x][n.y] = n.g);
            closedList.forEach(n => oldGvals[n.x][n.y] = n.g);
            oldGvals[goal.x][goal.y] = goal.g;
            // console.log(goal.g)
        }
        return path;
    }
    console.log("Finished a*, no goal found");
}

async function displayAHelper(map, current, start, goal, openList, closedList) {
    let mapCopy = makeCopy(map);
    closedList.forEach(n => mapCopy[n.x][n.y] = CLOSED)
    openList.heap.forEach(n => mapCopy[n.x][n.y] = OPEN)
    mapCopy[start.x][start.y] = START;
    mapCopy[goal.x][goal.y] = GOAL;
    mapCopy[current.x][current.y] = CURRENTPOS;
    updateCanvas("canvas2", mapCopy);
    await sleep(10);
}

async function displayFollowPath(trueMap, currentPos, realPath, restPath) {
    let mapCopy = makeCopy(trueMap);
    realPath.forEach(n => mapCopy[n.x][n.y] = REALPATH);
    restPath.forEach(n => mapCopy[n.x][n.y] = RESTPATH);
    mapCopy[currentPos.x][currentPos.y] = CURRENTPOS;
    updateCanvas("canvas2", mapCopy);
    await sleep(100);
}

function displayA(map) {
    updateCanvas("canvas2", map);
}

let maze = [[0, 0, 0, 0],
[0, 0, 1, 0],
[0, 1, 1, 0],
[0, 1, 1, 0]];

let start = new Node(2, 0);
let goal = new Node(3, 3);

// let pathFound = repeatedForwardA(maze, start, goal);
// console.log(pathFound);
// let tester = Array.from(Array(3), _ => Array(3).fill(2));
// console.log(tester);
