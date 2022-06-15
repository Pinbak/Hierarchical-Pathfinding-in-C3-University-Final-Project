import Globals from "./globals.js";
import * as Ut from "./ut.js";
import * as ActionSelection from "./actionSelection.js";

// breadth first search algorithm
export function bfs(graph, start, dest){
    let explored = [];
    let searched = [];
    // change the room into its corresponding building
    let queue = [[Globals.subGraph[start]]];
    let newDest = Globals.subGraph[dest][0];

    if (start === dest){
        console.log("Already there")
        return
    }

    while (queue.length !== 0){
        let path = queue.pop();
        let node = path[path.length-1];
        if (searched.indexOf(node) === -1){searched.push(node);}

        if (!explored.includes(node)){
            let neighbours = graph[node][0];

            for (const neighbour of neighbours){
               if (searched.indexOf(neighbour) === -1){searched.push(neighbour);}
               let newPath = Array(path);
               newPath.push(neighbour);
               queue.push(newPath);

               if (neighbour === newDest){
                  // original dest and start
                  newPath.push(dest);
                  newPath.unshift(start);
                  console.log("BFS Path: " + newPath);
                  return
               }
            }
            explored.push(node);
        }
    }
    console.log("No connection");
    return
}

export function astar(graph, start, dest, person, runtime){
   let newStart = Globals.subGraph[start][0]
   let openSet = [newStart];
   let cameFrom = {};
   let gScore = {[newStart]: 0};
   let fScore = {[newStart]: Infinity};

   // change the room into its corresponding building
   let newDest = Globals.subGraph[dest][0];

   while (openSet.length !== 0){
      // node with lowest f(n)
      let current = returnLowestFScore(openSet, fScore);
      // old system (broken) let current = Object.keys(fScore).reduce((key, v) => fScore[v] < fScore[key] ? v : key);

      if (current === newDest){
         //console.log("A* Path: " + reconstructPath(cameFrom, current, start, dest));
         person.currentPath = reconstructPath(cameFrom, current, start, dest);
         //console.log(person.currentPath);
         // send the person on the path
         person.currentState = "moving";
         ActionSelection.goToNextNode(runtime, person);
         return
      }
      openSet.splice(openSet.indexOf(current), 1);
      let neighbours = graph[current][0];

      for (const neighbour of neighbours){
         let localGScore = gScore[current] + returnCost(current, neighbour);
         if (!gScore.hasOwnProperty(neighbour)){gScore[neighbour] = Infinity;}
         // if a lift, we increase the cost based on the lift's queue
         if (Globals.nodes[neighbour][0] === "lift"){
            localGScore = localGScore + Globals.liftShaftAmount[neighbour]
         }
         if (localGScore < gScore[neighbour]){
            cameFrom[neighbour] = current;
            gScore[neighbour] = localGScore;
            fScore[neighbour] = localGScore + returnManhattan(neighbour, newDest);
            if (!openSet.includes(neighbour)){
               openSet.push(neighbour);
            }
         }
      }  
   }
   person.currentState = "lost";
   return
}

function reconstructPath(cameFrom, current, start, dest){
   let path = [current];
   let localCurrent = current;
   while (cameFrom.hasOwnProperty(localCurrent)){
      localCurrent = cameFrom[localCurrent];
      path.push(localCurrent);
      
   }
   // original dest and start (of the rooms)
   path.push(start);
   path.unshift(dest);
   return path.reverse();
}

/*
   let open = [[start, 0]];
   let close = [];
   let costs = {
      [start]: 0
   };
   
   while (open){
      // node with lowest f(n)
      let lowest = returnLowestValue(open, 1);
      let currentNode = open[lowest][0];

      open.splice(lowest, 1);
      close.push(currentNode);

      if (currentNode === dest){
         return;
      }
      // looping through neighbours
      let neighbours = graph[currentNode][0];

      for (const neighbour of neighbours){
         // g(n)
         if (!costs.hasOwnProperty(neighbour)){costs[neighbour] = 0}
         let g = costs[currentNode] + returnCost(graph, neighbour, currentNode)
         // h(n)
         let h = Ut.distanceTo(Globals.nodes[neighbour][1],Globals.nodes[neighbour][2],Globals.nodes[dest][1],Globals.nodes[dest][2]);

         if (!open.includes(neighbour)){
            costs[neighbour] = g;
            // f(n)
            let f = h + g;
            open.push(neighbour, f);
         }else if (open.includes(neighbour) && costs[neighbour] < costs[currentNode]){
            let f = g;
            open.push(neighbour, f);
         }
      }
   }
*/
/*
function returnLowestValue(array, axis){
   let value = array[0][axis];
   let index = 0;
   for (let i = 1; i < array.length; i++) {
      if (array[i][axis] < value){
         index = i;
      }
   }
   return index;
}
*/

// returns the lowest fscore, by going through open set, finding the equivalent fscores and comparing the previous, then returning the corresponding node
function returnLowestFScore(openSet, fScore){
   let min = fScore[openSet[0]];
   let node = openSet[0];
   for (const open of openSet){
      if (fScore[open] < min){
         min = fScore[open];
         node = open;
      }
   }
   return node;
}

function returnCost(node, dest){
   return Ut.distanceTo(Globals.nodes[node][1],Globals.nodes[node][2],Globals.nodes[dest][1],Globals.nodes[dest][2]);
}

function returnManhattan(node, dest){
   return Ut.manhattanDistance(Globals.nodes[node][1],Globals.nodes[node][2],Globals.nodes[dest][1],Globals.nodes[dest][2]);
}

/* Old A* (Nodes directly)
export function astar(graph, start, dest){
   let openSet = [start];
   let cameFrom = {};
   let gScore = {[start]: 0};
   let fScore = {[start]: Infinity};

   while (openSet){
      // node with lowest f(n)
      let current = returnLowestFScore(openSet, fScore);
      if (current === dest){
         console.log(reconstructPath(cameFrom, current));
         return
      }
      openSet.splice(openSet.indexOf(current), 1);
      let neighbours = graph[current][0]

      //console.log(i, current, neighbours, fScore)

      for (const neighbour of neighbours){
         let localGScore = gScore[current] + returnH(current, neighbour);
         if (!gScore.hasOwnProperty(neighbour)){gScore[neighbour] = Infinity;}
         if (localGScore < gScore[neighbour]){
            cameFrom[neighbour] = current;
            gScore[neighbour] = localGScore;
            fScore[neighbour] = localGScore + returnH(neighbour, dest);
            if (!openSet.includes(neighbour)){
               openSet.push(neighbour);
            }
         }
      }  
   }
   console.log("No connection");
   return
}
*/
//Unused function
function returnWeight(graph, currentNode, otherNode){
   let localList = graph[currentNode];
   for (const i of localList){
      console.log(i)
      if (i === otherNode){
         return graph[currentNode][1];
      }
   }
}