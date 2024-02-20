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

function repeatedForwardA(map, start, goal) {
    let openList = [];
    let closedList = [];
    let trueMap = Array.from(Array(map.length), _ => Array(map[0].length).fill(2));
    console.log(trueMap);
}

let tester = Array.from(Array(3), _ => Array(3).fill(2));
console.log(tester);
