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
    constructor (x, y) {
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
        if(this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return min;
    }

    bubbleUp() {
        let index = this.heap.length - 1;
        while(index > 0) {
            let parentIndex = Math.floor((index-1)/2); //???
            if(this.heap[parentIndex].f <= this.heap[index].f) {
                break;
            }
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    bubbleDown() {
        let index = 0;
        let length = this.heap.length;
        while(true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;
            if(leftChildIndex < length && this.heap[leftChildIndex].f < this.heap[smallest].f) {
                smallest = leftChildIndex;
            }
            if(rightChildIndex < length && this.heap[rightChildIndex].f < this.heap[smallest].f) {
                smallest = rightChildIndex;
            }
            if(smallest === index) {
                break;
            }

            this.swap(index, smallest);
            index = smallest;
        }
        }

        swap(i,j) {
            let temp = this.heap[i];
            this.heap[i] = this.heap[j];
            this.heap[j] = temp;

        }

        isEmpty() {
            return this.heap.length === 0;
        }
    }

    // size() {
    //     return this._heap.length;
    // }
    
    // isEmpty() {
    //     return this.size() == 0;
    // }

    // peek() {
    //     return this._heap[top];
    // }

    // push(...values) {
    //     values.forEach(value => {
    //         this._heap.push(value);
    //         this._siftUp();
    //     });
    //     return this.size();
    // }

    // pop() {
    //     const retrievedValue = this.peek();
    //     const bottom = this.size() - 1;
    //     if(bottom > top) {
    //         this._swap(top, bottom);
    //     }
    //     this._heap.pop();
    //     this._siftDown();
    //     return poppedValue;
    // }

    // replace(value) {
    //     const replacedValue = this.peek();
    //     this._heap[top] = value;
    //     this._siftDown();
    //     return replacedValue;
    // }

    // _greater(i, j) {
    //     return this._comparator(this._heap[i], this_heap[j]);
    // }

    // _swap(i, j) {
    //     [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    // }

    // _siftUp() {
    //     let node = this.size() - 1;
    //     while(node > top && this._greater(node, parent(node))) {
    //         this._swap(node, parent(node));
    //         node = parent(node);
    //     }
    // }

    // _siftDown() {
    //     let node = top;
    //     while(
    //         (left(node) < this.size() && this.greater(left(node), node)) ||
    //         (right(node) < this.size() && this._greater(right(node), node))
    //     ) {
    //         let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
    //         this._swap(node, maxChild);
    //         node = maxChild;
    //     }
    // }
// }

function caculateHeuristic(position, goal) {
    let dx = Math.abs(position.x - goal.x);
    let dy = Math.abs(position.y - position.y);

    return Math.sqrt(dx * dx + dy * dy);
}

function getNeighbors(currentNode, map) {
    const directions = [[1,0], [0,1], [-1,0], [0,-1]];
    let validDirections = [];
    for(let d = 0; d < directions.length; d++) {
        let dir = directions[d];
        let neighX = currentNode.getX + dir[0];
        let neighY = currentNode.getY + dir[1];
        if(neighX >= 0 && neighY >= 0 && neighX < map.length && neighY < map[0].length && map[neighX][neighY] === 0) { //check if its valid space in maze
            validDirections.push(new Node(neighX, neighY));
        }
    }
    return validDirections;
}
//is map unknown or known one when inputting, start is node, and goal is node
function repeatedForwardA(map, start, goal) {
    let openList = new PriorityQueue();
    let closedList = [];
    let trueMap = Array.from(Array(map.length), _ => Array(map[0].length).fill(2));
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
    while(!(openList.isEmpty())) {
        let currentNode = openList.dequeue();
        if(currentNode.x === goal.x && currentNode.y === goal.y) {
            console.log("Found goal");
            let path = [];
            let currentPath = currentNode;
            while(currentPath != null) {
                path.unshift({ x: currentPath.x, y: currentPath.y}); //add to the beginning
                currentPath = currentPath.parent;
            }
            return path;
        }
        closedList.push(currentNode);

        let neighbors = getNeighbors(currentNode, map);
        for(let neighbor of neighbors) {
            if(closedList.has(neighbor)) {
                continue; // check neighbor in closed
            }
            let nextCost = currentNode.g + 1;
            if(!(openList.heap.includes(neighbor)) || nextCost < neighbor.g) { //check if taking this would reduce the cost and not in open set
                neighbor.g = nextCost;
                neighbor.h = caculateHeuristic(neighbor, goal);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = currentNode;
                if(!(openList.heap.includes(neighbor))) {
                    openList.enqueue(neighbor);
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



// function repeatedForwardAHelper(map, position, goal, openList, closedList) {
//     if(position == goal) {
//         console.log("You made it");
//         return goal;
//     }
//     return position;
// }





let maze = [ [0,0,0,0], 
             [0,0,0,0], 
             [0,0,0,0],
             [0,0,0,0] ];

let start = new Node(2,1);
let goal = new Node(2,2);

let pathFound = repeatedForwardA(maze, start, goal);
console.log(pathFound);
// let tester = Array.from(Array(3), _ => Array(3).fill(2));
// console.log(tester);
