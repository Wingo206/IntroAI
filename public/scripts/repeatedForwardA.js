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
        this.g = 0;
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
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    enqueue(element) {
        this.heap.push(element);
        this.bubbleUp();
    }

    dequeue() {
        let min = this.heap[0];
        let last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown();
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

    bubbleDown() {
        let index = 0;
        let length = this.heap.length;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;
            if (leftChildIndex < length && this.heap[leftChildIndex].f < this.heap[smallest].f) {
                if(this.heap[leftChildIndex].f == this.heap[smallest].f) {                                   //Do you have to check if g cost should be larger or smaller 
                    if(this.heap[leftChildIndex].g < this.heap[smallest].g) { //Check if smallest g cost is greater, if it is change the order
                        smallest = leftChildIndex;     
                    }
                }
                else {
                    smallest = leftChildIndex;
                }
            }
            if (rightChildIndex < length && this.heap[rightChildIndex].f < this.heap[smallest].f) {
                if(this.heap[rightChildIndex].f == this.heap[smallest].f) {                                   //Do you have to check if g cost should be larger or smaller 
                    if(this.heap[rightChildIndex].g < this.heap[smallest].g) { //Check if smallest g cost is greater, if it is change the order
                        smallest = rightChildIndex;     
                    }
                }
                else {
                    smallest = rightChildIndex;
                }
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

function caculateHeuristic(position, goal) {
    let dx = Math.abs(position.x - goal.x);
    let dy = Math.abs(position.y - goal.y);

    return Math.sqrt(dx * dx + dy * dy);
}

function getNeighbors(currentNode, trueMap) {
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    let validDirections = [];
    for (let d = 0; d < directions.length; d++) {
        let dir = directions[d];
        let neighX = currentNode.x + dir[0];
        let neighY = currentNode.y + dir[1];
        if (neighX >= 0 && neighY >= 0 && neighX < trueMap.length && neighY < trueMap[0].length && trueMap[neighX][neighY] != 1) { //check if its valid space in maze
            validDirections.push(new Node(neighX, neighY));
            //trueMap[neighX][neighY] = 0;
            //displayA(trueMap);
        }
        // if(neighX >= 0 && neighY >= 0 && neighX < trueMap.length && neighY < trueMap[0].length && trueMap[neighX][neighY] === 1) {
        //     trueMap[neighX][neighY] = 1;
        //     displayA(trueMap);
        // }
    }
    return validDirections;
}

function makeCopy(map) {
    // let copy = Array.from(Array(map.length), _ => Array(map[0].length).fill(0)); // Initialize each row individually
    // return copy.map((_, i) => map[i].map(n => n));
    let copy = [];
    for (let x= 0; x < map.length; x++) {
        let row = [];
        for (let y= 0; y < map[0].length; y++) {
            row.push(new Number(map[x][y]));
        }
        copy.push(row);
    }
    return copy;
}

// const sleep = ms => new Promise(r => setTimeout(r, ms));
async function displayA(map) {
    updateCanvas(map)
}

async function repeatedForwardA(map, start, goal) {
    await (new Promise(r => setTimeout(r, 1000)));
    let trueMap = Array.from(Array(map.length), _ => Array(map[0].length).fill(0).map(_ => 2)); // Initialize each row individually
    trueMap[start.x][start.y] = START;
    trueMap[goal.x][goal.y] = END;
    //console.log(trueMap);
    console.log('broga')
    // console.log(makecopylol(trueMap))
    let realPath = [];
    let validPath = false;
    do {
        // console.log(trueMap);
        let path = await repeatedForwardAHelper(trueMap, start, goal);
        let validPathResult = checkPath(path, map, trueMap, start);
        validPath = validPathResult.validPath;
        start = validPathResult.updatedStart;
        path = validPathResult.updatedPath
        //console.log(path);
        //console.log(start);
        realPath.push(...path);                                        //IMPORTANT NOTES, seems like it doesn't update start and doesn;t cut off the nodes not included 
        await displayA(trueMap);
        await sleep(100);
        // console.log(path);
    } while (!validPath);

    // path = repeatedForwardAHelper(trueMap, start, goal);
    // checkPath(path, map, trueMap);
    // await displayA(trueMap);
    // await sleep(1000);
    // console.log(path);

    //console.log(path);
    //console.log(path);
    //console.log(map);
    //while(!checkPath(path, map, trueMap)) {
    // path = repeatedForwardAHelper(trueMap, start, goal);
    // console.log(trueMap);
    // path = repeatedForwardAHelper(trueMap, start, goal);
    // console.log(trueMap);
    // path = repeatedForwardAHelper(trueMap, start, goal);
    // console.log(trueMap);
    //}
    console.log(realPath);
    return realPath;
}

function checkPath(path, map, trueMap, start) {
    for (let i = 0; i < path.length; i++) {
        let currentNode = path[i];
        //console.log(map);
        if (currentNode.x >= 0 && currentNode.y >= 0 && map[currentNode.x][currentNode.y] == 1) {
            console.log("Didn't reach the goal, hit a wall");
            trueMap[currentNode.x][currentNode.y] = 1;
            if(i != 0) {
                start = path[i-1];
            }
            path = path.slice(0,i);
            //console.log(trueMap);
            return { validPath: false, updatedStart: start, updatedPath: path};
        }
        else if (map[currentNode.x][currentNode.y] == 0 && trueMap[currentNode.x][currentNode.y] != 5 && trueMap[currentNode.x][currentNode.y] != 4) {
            trueMap[currentNode.x][currentNode.y] = 0;
            //console.log(trueMap);
        }
        else if (trueMap[currentNode.x][currentNode.y] == 5) {
            console.log("Reached the goal, yay");
            return { validPath: true, updatedStart: start, updatedPath: path};
        }
    }
    // /console.log(trueMap);
    return { validPath: false, updatedStart: start, updatedPath: path};
}

//is map unknown or known one when inputting, start is node, and goal is node
async function repeatedForwardAHelper(trueMap, start, goal) {
    let openList = new PriorityQueue();
    let closedList = new Set();
    //displayA(trueMap);
    start.g = 0;
    start.h = caculateHeuristic(start, goal);
    start.f = start.g + start.h;
    openList.enqueue(start); //put start into open list;
    // let startNode = new Node(start[0], start[1], 0, caculateHeuristic(start, goal));
    // openList.push(startNode);
    //console.log(trueMap);
    //let path = repeatedForwardAHelper(trueMap, start, goal, openList, closedList);
    //console.log(path);
    // let currentNode;
    while (!(openList.isEmpty())) {
        displayAHelper(trueMap, start, goal, openList, closedList);
        await sleep(10);

        let currentNode = openList.dequeue();
        //trueMap[currentNode.x][currentNode.y] = 3;
        //displayA(trueMap);
        if (currentNode.x === goal.x && currentNode.y === goal.y) {
            console.log("Possibly found goal");
            let path = [];
            let currentPath = currentNode;
            while (currentPath != null) {
                //add nodes to the path instead pls
                path.unshift(currentPath); //add to the beginning
                currentPath = currentPath.parent;
            }
            return path;
        }
        closedList.add(currentNode);
        //trueMap[currentNode.x][currentNode.y] = 7;
        //displayA(trueMap);

        let neighbors = getNeighbors(currentNode, trueMap);
        for (let neighbor of neighbors) {
            if (closedList.has(neighbor)) {
                continue; // check neighbor in closed
            }
            let nextCost = currentNode.g + 1;
            if (!(openList.contains(neighbor)) || nextCost < neighbor.g) { //check if in open set alredy taking this would reduce the cost or not in open set then also check
                neighbor.g = nextCost;
                neighbor.h = caculateHeuristic(neighbor, goal);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = currentNode;
                if (!(openList.heap.includes(neighbor))) {
                    openList.enqueue(neighbor);
                    //trueMap[currentNode.x][currentNode.y] = 6;
                    //displayA(trueMap);
                }
            }

            // check if neighbor is open list
            //if node that is in open set g is greater than the new g update the value with minimum
            //say its not in the open set
            //let neighborNode = new Node(neighbors[i][0], neighbors[i],[1], (currentNode.getG + 1),caculateHeuristic(neighbors[i],goal));
        }
    }
    console.log("Finished a*, no goal found");
}

function displayAHelper(map, start, goal, openList, closedList) {
    let mapCopy = makeCopy(map);
    openList.heap.forEach(n => mapCopy[n.x][n.y] = OPEN)
    //closedList.forEach(n => mapCopy[n.x][n.y] = CLOSED)
    mapCopy[start.x][start.y] = START;
    mapCopy[goal.x][goal.y] = END;
    console.log(mapCopy);
    updateCanvas(mapCopy);
}

function displayA(map) {
    updateCanvas(map);
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
