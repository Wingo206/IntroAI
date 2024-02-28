/**
 * The Node class represents a node in the grid.
 * 
 * @param {Number} x The x coordinate of the node.
 * @param {Number} y The y coordinate of the node.
 */
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

let globalCounter = 0;

/**
 * The PriorityQueue class represents a priority queue. This is used for the A* algorithm. The queue is implemented as a binary heap, which is a complete binary tree where each node is less than or equal to its children.
 */
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
        updateStatesExplored()

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

/**
 * The calculateHeuristic function calculates the heuristic value for the A* algorithm. The heuristic value is the estimated cost to move from the current node to the goal node. The heuristic value is calculated using the Manhattan distance. The same function is used for both the forward, backward, and adaptive A* algorithms.
 * 
 * @param {Node} position The current position.
 * @param {Node} goal The goal position.
 * @param {Array} oldGvals The old g-values for the adaptive A* algorithm.
 * @param {Number} goalVal The goal value for the adaptive A* algorithm.
 * @returns {Number} The heuristic value.
 */
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

/**
 * The setContains function checks if a set contains a node. This is used to check if a node is in the open or closed list in the A* algorithm.
 * 
 * @param {Array} set The set to check.
 * @param {Node} node The node to check for.
 * @returns {Boolean} True if the set contains the node, false otherwise.
 */
function setContains(set, node) {
    for (let i = 0; i < set.length; i++) {
        let n = set[i]
        if (n.x == node.x && n.y == node.y) {
            return true;
        }
    }
    return false;
}

/**
 * The nodeIndexOf function gets the index of a node in an array of nodes. This is used to get the index of a node in the open or closed list in the A* algorithm. If the node is not in the array, -1 is returned.
 * 
 * @param {Array} arr The array of nodes to search.
 * @param {Node} node The node to search for.
 * @returns {Number} The index of the node in the array, or -1 if the node is not in the array.
 */
function nodeIndexOf(arr, node) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].x == node.x && arr[i].y == node.y) {
            return i;
        }
    }
    return -1;
}

/**
 * The getNeighbors function gets the neighbors of a node. This is used to get the neighbors of the current node in the A* algorithm. The neighbors are the nodes that are adjacent to the current node and are not walls.
 * 
 * @param {Node} currentNode The current node.
 * @param {Array} trueMap The true map of the maze.
 * @param {Array} nodes The grid of nodes.
 * @returns {Array} An array of the neighbors of the current node.
 */
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

/**
 * The makeCopy function makes a copy of a 2D array. This is used to make a copy of the true map of the maze. The copy is used to keep track of the true map as the A* algorithm runs. The copy is updated as the algorithm runs, and is used to display the true map as the algorithm runs.
 * 
 * @param {Array} map The 2D array to copy.
 * @returns {Array} A copy of the 2D array.
 */
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

/**
 * The repeatedForwardA function runs the repeated forward A* algorithm. The algorithm is used to find the shortest path from the start node to the goal node in the maze. The algorithm uses the A* algorithm to find the shortest path, and then updates the true map of the maze as it runs. The algorithm is run repeatedly until the goal node is reached. The algorithm can be run in forward or backward mode, and can be run with or without adaptive A*.
 * 
 * @param {Array} map The map of the maze.
 * @param {Node} start The start node.
 * @param {Node} goal The goal node.
 * @param {Boolean} isForward True if the algorithm is run in forward mode, false if the algorithm is run in backward mode.
 * @param {Boolean} isAdaptive True if the algorithm is run with adaptive A*, false if the algorithm is run without adaptive A*.
 * @returns {Array} The shortest path from the start node to the goal node.
 */
async function repeatedForwardA(map, start, goal, isForward, isAdaptive) {
    // await (new Promise(r => setTimeout(r, 1000)));
    let trueMap = Array.from(Array(map.length), _ => Array(map[0].length).fill(0).map(_ => 2)); // Initialize each row individually
    let path;
    let currentNode;
    // setup storage of old s values for adaptive
    let oldGvals;
    let realPath = [];
    if (isAdaptive) {
        oldGvals = Array.from(Array(map.length), _ => Array(map[0].length).fill(0).map(_ => -1));
    }
    if (isForward) {
        trueMap[start.x][start.y] = START;
        trueMap[goal.x][goal.y] = GOAL;
        currentNode = start;
        updateSurroundings(start, trueMap, map);
        path = await repeatedForwardAHelper(trueMap, start, goal, oldGvals, realPath);
    }
    else { //FOR BACKWARDS IMPLEMENTATION
        trueMap[start.x][start.y] = GOAL;
        trueMap[goal.x][goal.y] = START;
        currentNode = goal;
        updateSurroundings(goal, trueMap, map);
        path = (await repeatedForwardAHelper(trueMap, goal, start, oldGvals, realPath)).reverse();
    }
    while (path !== undefined) {

        if (ANIMATE) {
            // await displayFollowPath(trueMap, currentNode, realPath, path);
            await speedControlled(() => displayFollowPath(trueMap, currentNode, realPath, path))
        }

        let nextNode = path[0];
        path.splice(0, 1);

        // check next node
        if (nextNode.x >= 0 && nextNode.y >= 0 && map[nextNode.x][nextNode.y] == WALL) {
            // console.log("Didn't reach the goal, hit a wall");
            if (isForward) {
                path = await repeatedForwardAHelper(trueMap, currentNode, goal, oldGvals, realPath);
            }
            else {
                path = (await repeatedForwardAHelper(trueMap, goal, currentNode, oldGvals, realPath)).reverse();
            }
            if (path === undefined) {
                // no path was found
                console.log("no path found");
                return;
            }
            continue;
        }
        else if (trueMap[nextNode.x][nextNode.y] == ((isForward) ? GOAL : START)) {
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

/**
 * The updateSurroundings function updates the true map of the maze as the A* algorithm runs. The function updates the true map with the values of the map as the algorithm runs. The function is used to update the true map as the algorithm runs, and is used to display the true map as the algorithm runs.
 * 
 * @param {Node} currentNode The current node.
 * @param {Array} trueMap The true map of the maze.
 * @param {Array} map The map of the maze.
 */
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
/**
 * The repeatedForwardAHelper function helps the repeated forward A* algorithm.
 * 
 * @param {Array} trueMap The true map of the maze.
 * @param {Node} start The start node.
 * @param {Node} goal The goal node.
 * @param {Array} oldGvals The old g-values for the adaptive A* algorithm.
 * @param {Array} realPath The real path of the maze.
 * @returns {Array} The shortest path from the start node to the goal node.
 */
async function repeatedForwardAHelper(trueMap, start, goal, oldGvals, realPath) {
    // create grid of nodes
    let nodes = [];
    for (let x = 0; x < trueMap.length; x++) {
        let row = [];
        for (let y = 0; y < trueMap[0].length; y++) {
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
    goal.parent = null
    while (openList.heap.length > 0 && goal.f > openList.heap[0].f) {

        let currentNode = openList.dequeue(0);
        if (ANIMATE) {
            // await displayAHelper(trueMap, currentNode, start, goal, openList, closedList, realPath);
            await speedControlled(() => displayAHelper(trueMap, currentNode, start, goal, openList, closedList, realPath));
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

/**
 * The displayAHelper function displays the A* algorithm as it runs. The function displays the true map of the maze as the A* algorithm runs. The function is used to display the true map as the algorithm runs.
 * 
 * @param {Array} map The true map of the maze.
 * @param {Node} current The current node.
 * @param {Node} start The start node.
 * @param {Node} goal The goal node.
 * @param {Array} openList The open list.
 * @param {Array} closedList The closed list.
 * @param {Array} realPath The real path of the maze.
 */
async function displayAHelper(map, current, start, goal, openList, closedList, realPath) {
    let mapCopy = makeCopy(map);
    realPath.forEach(n => mapCopy[n.x][n.y] = REALPATH);
    closedList.forEach(n => mapCopy[n.x][n.y] = CLOSED)
    openList.heap.forEach(n => mapCopy[n.x][n.y] = OPEN)
    mapCopy[start.x][start.y] = START;
    mapCopy[goal.x][goal.y] = GOAL;
    mapCopy[current.x][current.y] = CURRENTPOS;
    updateCanvas("canvas2", mapCopy);
    // await sleep(10);
}

/**
 * The displayFollowPath function displays the path as it is followed. The function displays the true map of the maze as the path is followed. The function is used to display the true map as the path is followed.
 * 
 * @param {Array} trueMap The true map of the maze.
 * @param {Node} currentPos The current position.
 * @param {Array} realPath The real path of the maze.
 * @param {Array} restPath The rest of the path.
 */
async function displayFollowPath(trueMap, currentPos, realPath, restPath) {
    let mapCopy = makeCopy(trueMap);
    realPath.forEach(n => mapCopy[n.x][n.y] = REALPATH);
    restPath.forEach(n => mapCopy[n.x][n.y] = RESTPATH);
    mapCopy[currentPos.x][currentPos.y] = CURRENTPOS;
    updateCanvas("canvas2", mapCopy);
    await sleep(100);
}

/**
 * The displayA function displays the A* algorithm as it runs. The function displays the true map of the maze as the A* algorithm runs. The function is used to display the true map as the algorithm runs.
 * 
 * @param {Array} map The true map of the maze.
 */
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
