console.log("repeatBroga");

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
    constructor (x, y, g, h) {
        this.parent = null;
        this.x = x;
        this.y = y;
        this.g = g;
        this.h = h;
    }

    getParent() {
        return this.parent;
    } 

    setParent(parentNode) {
        this.parent = parentNode;
    }
    
    getF() {
        return this.g + this.h;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getG() {
        return this.g;
    }

    getH() {
        return this.h;
    }
}

const top = 0;
const parent = i => ((i + 1) >>> 1) - 1; //i is the node in the binary heap, calculates the floor division of i+1 by 2, -1 gives index of parent 
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;
//Have to swap with your own heap IMPORTANT for extra credit so change later just for testing
//need to have heap compare the h + g values
class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
    }

    size() {
        return this._heap.length;
    }
    
    isEmpty() {
        return this.size() == 0;
    }

    peek() {
        return this._heap[top];
    }

    push(...values) {
        values.forEach(value => {
            this._heap.push(value);
            this._siftUp();
        });
        return this.size();
    }

    pop() {
        const retrievedValue = this.peek();
        const bottom = this.size() - 1;
        if(bottom > top) {
            this._swap(top, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }

    replace(value) {
        const replacedValue = this.peek();
        this._heap[top] = value;
        this._siftDown();
        return replacedValue;
    }

    _greater(i, j) {
        return this._comparator(this._heap[i], this_heap[j]);
    }

    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }

    _siftUp() {
        let node = this.size() - 1;
        while(node > top && this._greater(node, parent(node))) {
            this._swap(node, parent(node));
            node = parent(node);
        }
    }

    _siftDown() {
        let node = top;
        while(
            (left(node) < this.size() && this.greater(left(node), node)) ||
            (right(node) < this.size() && this._greater(right(node), node))
        ) {
            let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}


function repeatedForwardA(map, start, goal) {
    let openList = new PriorityQueue();
    let closedList = [];
    let trueMap = Array.from(Array(map.length), _ => Array(map[0].length).fill(2));
    let startNode = new Node(start[0], start[1], 0, caculateHeuristic(start, goal));
    openList.push(startNode);
    //console.log(trueMap);
    //let path = repeatedForwardAHelper(trueMap, start, goal, openList, closedList);
    //console.log(path);
    let currentNode;
    while(!(openList.isEmpty)) {
        let parentNode = currentNode;
        currentNode = openList.pop();
        currentNode.setParent(parentNode);
        closedList.push(currentNode);
        if([currentNode.getX, currentNode.getY] == goal) {
            console.log("Found goal");
        }
        let neighbors = getNeighbors(currentNode, map);
        for(let i = 0; i < neighbors.length; i++) {
            // check if neighbor is open list
            //if node that is in open set g is greater than the new g update the value with minimum
            //say its not in the open set
            let neighborNode = new Node(neighbors[i][0], neighbors[i],[1], (currentNode.getG + 1),caculateHeuristic(neighbors[i],goal));
        }
    }
}

function getNeighbors(currentNode, map) {
    const directions = [[1,0], [0,1], [-1,0], [0,-1]];
    let validDirections = [];
    for(let d = 0; d < directions.length; d++) {
        let dir = directions[d];
        let neighX = currentNode.getX + dir[0];
        let neighY = currentNode.getY + dir[1];
        if(map[neighX][neighY] == 0) {
            validDirections.push([neighX, neighY]);
        }
    }
    return validDirections;
}

function repeatedForwardAHelper(map, position, goal, openList, closedList) {
    if(position == goal) {
        console.log("You made it");
        return goal;
    }
    return position;
}

function caculateHeuristic(position, goal) {
    let dx = position[0] - goal[0];
    let dy = position[1] - position[1];

    return Math.sqrt(dx * dx + dy * dy);
}



let maze = [ [0,0,0,0], 
             [0,0,1,0], 
             [0,0,1,0],
             [0,0,1,0] ];

let start = [2,1];
let goal = [3,3];

repeatedForwardA(maze, start, goal);

// let tester = Array.from(Array(3), _ => Array(3).fill(2));
// console.log(tester);
