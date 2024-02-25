console.log("repeatBroga");

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
    }
    return validDirections;
}

function makeCopy(map) {
    let copy = Array.from(Array(map.length), _ => Array(map[0].length).fill(0)); // Initialize each row individually
    return copy.map((_, i) => map[i].map(n => n));
}

// const sleep = ms => new Promise(r => setTimeout(r, ms));
async function displayA(map) {
    updateCanvas(map)
}

async function repeatedForwardA(map, start, goal) {
    await (new Promise(r => setTimeout(r, 1000)));
    let trueMap = Array.from(Array(map.length), _ => Array(map[0].length).fill(0).map(_ => 2)); // Initialize each row individually
    trueMap[start.x][start.y] = 4;
    trueMap[goal.x][goal.y] = 5;
    //console.log(trueMap);
    console.log('broga')
    // console.log(makecopylol(trueMap))
    let realPath = [];
    let validPath = false;
    do {
        // console.log(trueMap);
        let path = repeatedForwardAHelper(trueMap, start, goal);
        validPath = checkPath(path, map, trueMap, start);
        realPath.push(...path);                                        //IMPORTANT NOTES, seems like it doesn't update start and doesn;t cut off the nodes not included 
        await displayA(trueMap);
        await sleep(100);
        // console.log(path);
    } while (!validPath);

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
            return false;
        }
        else if (map[currentNode.x][currentNode.y] == 0 && trueMap[currentNode.x][currentNode.y] != 5 && trueMap[currentNode.x][currentNode.y] != 4) {
            trueMap[currentNode.x][currentNode.y] = 0;
            //console.log(trueMap);
        }
        else if (trueMap[currentNode.x][currentNode.y] == 5) {
            console.log("Reached the goal, yay");
            return true;
        }
    }
    // /console.log(trueMap);
    return false;
}

//is map unknown or known one when inputting, start is node, and goal is node
function repeatedForwardAHelper(trueMap, start, goal) {
    let openList = new PriorityQueue();
    let closedList = new Set();
    //displayA(trueMap);
    start.g = 0;
    start.h = caculateHeuristic(start, goal);
    start.f = start.g + start.h;
    openList.enqueue(start); //put start into open list;
    while (!(openList.isEmpty())) {
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
        }
    }
    console.log("Finished a*, no goal found");
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
