import Globals from "./globals.js";
import * as Ut from "./ut.js";
import * as Searching from "./searchingGraph.js";

export function generatePeople(runtime){
    let spawn = "";
    for (const room of runtime.objects.sprRoom.getAllInstances()){
        if (room.animationName === "spawn"){
            spawn = room;
        }
    }
    // loop through existing rooms in order to generate new people
    for (const room of runtime.objects.sprRoom.getAllInstances()){
        // generate resident
        residentCheck: if (room.animationName === "flat"){
            if (room.capacity !== 100){break residentCheck;}
            room.capacity = Ut.randomNum(1, 5);
            for(let i = 0; i < room.capacity; i++){
                const lastPersonInstance = runtime.objects.sprPerson.createInstance("characters", spawn.x + Ut.randomNum(-10,10), spawn.y, false);
                lastPersonInstance.y = lastPersonInstance.y - (lastPersonInstance.height/2)
                lastPersonInstance.currentRoom = String(spawn.uid);
                lastPersonInstance.type = "resident";
                lastPersonInstance.primaryBuilding = String(room.uid);
                lastPersonInstance.currentState = "out";
                Searching.astar(Globals.graph, lastPersonInstance.currentRoom, lastPersonInstance.primaryBuilding, lastPersonInstance, runtime);
                room.occupancy++;
            }
        }
        // generate worker
        officeCheck: if (room.animationName === "office"){
            if (room.capacity !== 100){break officeCheck;}
            room.capacity = 10;
            for(let i = 0; i < room.capacity; i++){
                const lastPersonInstance = runtime.objects.sprPerson.createInstance("characters", spawn.x + Ut.randomNum(-10,10), spawn.y, false);
                lastPersonInstance.y = lastPersonInstance.y - (lastPersonInstance.height/2)
                lastPersonInstance.currentRoom = String(spawn.uid);
                lastPersonInstance.type = "worker";
                lastPersonInstance.primaryBuilding = String(room.uid);
                lastPersonInstance.currentState = "out";
                room.occupancy++;
            }
        }
    }
}

export function checkForHomeless(runtime){
    let allRooms = [];
    for (const room of runtime.objects.sprRoom.getAllInstances()){
        if (room.animationName === "office" || room.animationName === "flat"){
            allRooms.push(String(room.uid));
        }
    }
    for (const person of runtime.objects.sprPerson.getAllInstances()){
        if (!allRooms.includes(person.primaryBuilding)){
            person.destroy();
        }
    }
}

export function findLiftShaft(runtime){
    for (const lift of runtime.objects.sprLift.getAllInstances()){
        for (const liftShaft of runtime.objects.sprLiftShaft.getAllInstances() ){
            if (lift.testOverlap(liftShaft)){
                lift.parentLiftShaft = String(liftShaft.uid);
                lift.goesTo = Globals.graph[liftShaft.uid][0];

                // create corresponding queue amount
                if (!Globals.liftShaftAmount.hasOwnProperty(String(liftShaft.uid))){Globals.liftShaftAmount[String(liftShaft.uid)] = 0;}
                lift.queue = [];
                lift.onBoard = 0;
                // add queue (in order of y)
                for (const i of Globals.graph[liftShaft.uid][0]){
                    let relevantIndex = 0;
                    let c = 0;
                    for (const q of lift.queue){
                        c++;
                        if (Globals.nodes[i][2] > Globals.nodes[q[0]][2]){
                            relevantIndex = c;
                        }
                    }
                    lift.queue.splice(relevantIndex, 0, [i,0]);
                    //lift.queue.push([i,0]);
                }
            }
        }
    }
    
}

export function addLiftShaftQueue(runtime){
    for (const liftShaft of runtime.objects.sprLiftShaft.getAllInstances()){
        Globals.liftShaft[String(liftShaft.uid)] = [];
        // add the floors it goes to with the corresponding passengers waiting (at the start 0)
        for (const i of Globals.graph[liftShaft.uid][0]){
            Globals.liftShaft[String(liftShaft.uid)].push([i,0]);
        }
    }
    
}

export function findRooms(runtime){
    // finding the room each person is on
    for (const person of runtime.objects.sprPerson.getAllInstances()){
        for (const room of runtime.objects.sprRoom.getAllInstances() ){
            if (person.testOverlap(room)){
                person.currentRoom = String(room.uid);
            }
        }
    }
    for (const lift of runtime.objects.sprLift.getAllInstances()){
        for (const building of runtime.objects.sprBuilding.getAllInstances()){
            if (lift.testOverlap(building)){
                lift.currentFloor = String(building.uid);
            }
        }
    }
}

function liftArrived(lift, runtime){
    for (const person of runtime.objects.sprPerson.getAllInstances()){
        if (person.currentState === "waiting for lift"){
            if (person.testOverlap(lift)){
                if (lift.currentState === "waiting for passengers"){
                    if (lift.onBoard < lift.capacity){
                        // remove old node (in this case the lift they are about to ride)
                        person.previousNode = person.currentPath[0];
                        person.currentPath.shift();
                        // tell the lift where to go
                        activateQueue(lift, person.currentPath[0]);
                        // change state
                        person.currentState = "riding lift";
                        // give some variation to position and pin them to lift
                        person.liftOn = [lift, Ut.randomNum(-10,10), 10];

                        //update amount on board
                        lift.onBoard++;
                    }
                    // if it has left people behind, remember that floor and add it back to the queue later
                    else{
                        lift.missPeopleOn = lift.currentFloor;
                    }
                }
            }
        }
    }
}
export function stillWaiting(runtime){
    for (const person of runtime.objects.sprPerson.getAllInstances()){
        if (person.currentState === "waiting for lift"){
            addToLiftShaftQueue(person.currentPath[0], person.previousNode);
            console.log("I'm still waiting!");
        }
    }
}

/*
export function stillWaiting(runtime){
    for (const person of runtime.objects.sprPerson.getAllInstances()){
        if (person.currentState === "impatient"){
            addToLiftShaftQueue(person.currentPath[0], person.previousNode);
            person.currentState = "waiting for lift";
        }
    }
            if (person.currentState === "waiting for lift"){
            for (const lift of runtime.objects.sprLift.getAllInstances()){
                if (person.testOverlap(lift)){
                    if (lift.currentState === "waiting for passengers"){
                        if (lift.onBoard < lift.capacity){
                        // remove old node (in this case the lift they are about to ride)
                        person.previousNode = person.currentPath[0];
                        person.currentPath.shift();
                        // tell the lift where to go
                        activateQueue(lift, person.currentPath[0]);
                        // change state
                        person.currentState = "riding lift";
                        // give some variation to position and pin them to lift
                        person.liftOn = [lift, Ut.randomNum(-10,10), 10];

                        //update amount on board
                        lift.onBoard++;
                        }
                    }
                    // if it has left people behind, remember that floor and add it back to the queue later
                    else{
                        lift.missPeopleOn = lift.currentFloor;
                    }
                }
            }
        }
}
*/

export function ridingLift(runtime, person){
    person.x = person.liftOn[0].x + person.liftOn[1];
    person.y = person.liftOn[0].y + person.liftOn[2];
    // on arrived at desired floor
    if (person.liftOn[0].currentFloor === person.currentPath[0]){
        person.currentState === "moving";
        // reducing amount of people in queue
        Globals.liftShaftAmount[person.previousNode]--;

        goToNextNode(runtime, person);
        
        //update amount on board
        person.liftOn[0].onBoard--;
        
    }
}

export function arrivedAtLift(person){
    // if they have arrived at the lift
    if (person.currentState === "going to lift" && !person.behaviors.MoveTo.isMoving){
        let nextNode = person.currentPath[1];
        // tell the lift shaft you are waiting (push the button)
        addToLiftShaftQueue(person.currentPath[0], person.previousNode);
        person.currentState = "waiting for lift";
        
    }
    // addToLiftQueue(runtime, nextNode, person.previousNode, person.currentPath[1], person)
}

function addToLiftShaftQueue(liftShaft, currentFloor){
    let liftQueue = Globals.liftShaft[liftShaft];
    let c = 0;
    for (const floor of liftQueue){
        if (floor[0] === currentFloor){
            Globals.liftShaft[liftShaft][c][1] = Globals.liftShaft[liftShaft][c][1]+1;
            //Globals.liftShaftAmount[liftShaft]++;
        }
        c++;
    }
}
/*
function updateCostforQueue(liftShaft, floor, amount){
    let connectedNodes = Globals.graph[liftShaft];
    let c = 0;
    let subC = 0;
    let subNodes = ""; 
    let modifier = 10;
    for (const n of connectedNodes[0]){
        Globals.graph[liftShaft][1][c] = Globals.graph[liftShaft][1][c] + (amount * modifier);
        subNodes = Globals.graph[n];
        for (const s of subNodes[0]){
            if (s === liftShaft){
                Globals.graph[liftShaft][1][c] = Globals.graph[liftShaft][1][c] + (amount * modifier);
            }
            subC++;
        }
        
        c++;
    }
}
*/

export function goToNextNode(runtime, person){
    while (person.currentPath.length !== 0){
        let nextNode = person.currentPath[0]
        if (!Globals.nodes.hasOwnProperty(nextNode)){person.currentState="lost";break;}
        // if they have arrived
        if (person.currentPath.length === 1){
                person.behaviors.MoveTo.moveToPosition(Globals.nodes[nextNode][1] + Ut.randomNum(-20,20), person.y, true);
                person.currentRoom = person.currentPath[0];

                // depending on where they arrive, change their current state
                let arrivedRoom = getArrivedRoomAnimationName(runtime, person, person.currentPath[0]);
                if (arrivedRoom === "foodCourt"){
                    person.currentState = "eating";
                }else if (arrivedRoom === "office"){
                    person.currentState = "working";
                }else if (arrivedRoom === "spawn"){
                    person.currentState = "out";
                }else{
                    person.currentState = "idle";
                }
                // remove the last node from their path
                person.currentPath.shift();
                return
        }else{
            // check what the node is
            if (Globals.nodes[nextNode][0] === "room"){
                person.behaviors.MoveTo.moveToPosition(Globals.nodes[nextNode][1], person.y, true);
                person.previousNode = nextNode;
                person.currentPath.shift();
            }else if (Globals.nodes[nextNode][0] === "building"){
                person.previousNode = nextNode;
                person.currentPath.shift();
            }else if (Globals.nodes[nextNode][0] === "groundFloor"){
                person.previousNode = nextNode;
                person.currentPath.shift();
            }else if (Globals.nodes[nextNode][0] === "lift"){
                Globals.liftShaftAmount[nextNode]++;
                person.behaviors.MoveTo.moveToPosition(Globals.nodes[nextNode][1] + Ut.randomNum(-10,10), person.y, true);
                person.currentState = "going to lift";
                return
            }
        }
    }
}

function getArrivedRoomAnimationName(runtime, person, currentRoom){
    for (const room of runtime.objects.sprRoom.getAllInstances()){
        if (String(room.uid) === currentRoom){
            return room.animationName;
        }
    }
}
export function callLiftToFloor(runtime){
    // go to each liftShaft and look through all of the floors that have people waiting there, then send relevant lifts to pick them up
    for (const liftShaft of runtime.objects.sprLiftShaft.getAllInstances()){
        const floors = Globals.liftShaft[String(liftShaft.uid)];
        for (const floor of floors){
            // if at least one person is waiting
            if(floor[1] > 0){
                //console.log(findLeastEmptyLift(runtime, liftShaft));
                const leastEmpty = findLeastEmptyLift(runtime, liftShaft);
                activateQueue(leastEmpty, floor[0]);
                reduceWaiting(liftShaft, floor[0], leastEmpty.capacity);
            }
        }
    }
}

function reduceWaiting(liftShaft, floor, amount){
    // reduces the amount of people listed as waiting
    let c = 0;
    for (const i of Globals.liftShaft[String(liftShaft.uid)]){
        if (i[0] === floor){
            Globals.liftShaft[String(liftShaft.uid)][c][1] = Globals.liftShaft[String(liftShaft.uid)][c][1] - amount;
        }
        if (i[1] < 0){ 
            Globals.liftShaft[String(liftShaft.uid)][c][1] = 0;
        }
        c++;
    }

}

export function activateQueue(lift, dest){
    let localQueue = lift.queue;
    let c = 0;
    for (const q of localQueue){
        if (q[0] === dest){
            lift.queue[c][1] = 1;
        }
        c++
    }
}

/*
function chooseRelevantQueue(lift, dest){
    // if the lift's y is greater than the new node's y (we are further down)
    if (Globals.nodes[lift.currentFloor][2] > Globals.nodes[dest][2]){
        addToLiftQueue(lift, dest, "queueUp");
    }else{
        addToLiftQueue(lift, dest, "queueDown");
    }
}

function addToLiftQueue(lift, dest, queue){
    let relevantIndex = 0;
    // if it's not already going to the floor,
    if (lift[queue].length === 0){
        lift[queue].push(dest);
    }else if (!lift[queue].includes(dest)){
        for (const q of lift[queue]){
            // if the y is greater, put it there
            if (Globals.nodes[q][2] < Globals.nodes[dest][2]){
                relevantIndex = lift[queue].indexOf(q);
            }
        }
        lift[queue].splice(relevantIndex+1, 0, dest);
    }
}
*/
function findLeastEmptyLift(runtime, liftShaft){
    let smallestQueueLift = 0;
    let smallestQueue = Infinity;
    for (const lift of runtime.objects.sprLift.getAllInstances()){
        // if its a child of the liftShaft
        if (String(liftShaft.uid) === lift.parentLiftShaft){
            // get the lift with the smallest queue
            if (countQueue(lift) < smallestQueue){
                smallestQueueLift = lift;
                smallestQueue = countQueue(lift);
            }
        }
    }
    return smallestQueueLift;
}



/*
export function addToLiftQueue(runtime, liftID, currentFloor, desiredFloor, person){
    // get the correct lift shaft
    for (const liftShaft of runtime.objects.sprLiftShaft.getAllInstances()){
        if (String(liftShaft.uid) === liftID){
            // get the lift with the smallest queue
            let smallestQueueLift = 0;
            let smallestQueue = Infinity;
            for (const lift of runtime.objects.sprLift.getAllInstances()){
                if (lift.parentLiftShaft === liftID){
                    if (lift.queue.length < smallestQueue){
                        smallestQueueLift = lift;
                        smallestQueue = lift.queue.length;
                    }
                }
            }
            if (smallestQueueLift.queue.includes(currentFloor) && smallestQueueLift.queue.includes(desiredFloor)){
                smallestQueueLift.queue.splice(smallestQueueLift.queue.indexOf(currentFloor), 1);
                smallestQueueLift.queue.splice(smallestQueueLift.queue.indexOf(desiredFloor), 1);
                smallestQueueLift.queue.push(currentFloor, desiredFloor);
            }else{
                smallestQueueLift.queue.push(currentFloor, desiredFloor);
            }

            // set the specific lift that the person will go on (not just any lift that arrives)
            person.chosenLift = smallestQueueLift;
        }
    }
}
*/
function countQueue(lift){
    let c = 0
    for (const floor of lift.queue){
        if (floor[1] === 1){
            c++;
        }
    }
    return c;
}

function isQueueNotEmpty(lift){
    for (const floor of lift.queue){
        if (floor[1] === 1){
            return true;
        }
    }
    return false;
}

export function moveLifts(runtime){
    for (const lift of runtime.objects.sprLift.getAllInstances()){
        // if there is something in the queue -> move to it
        if (lift.currentState === "waiting for passengers" && isQueueNotEmpty(lift)){
            // keep incrementing the pointer until it gets to the size of the queue, then reverse the queue and keep going
            updatePointer(lift);
            // once at a floor that someone is waiting at, move to it
            lift.behaviors.MoveTo.moveToPosition(lift.x, Globals.nodes[lift.queue[lift.pointer][0]][2], true);
            lift.queue[lift.pointer][1] = 0;
            lift.currentState = "moving";
        }

        // stop the lift when at destination
        if (!lift.behaviors.MoveTo.isMoving){
            if (lift.currentState === "moving"){
                lift.currentState = "waiting for passengers";
                lift.currentFloor = lift.queue[lift.pointer][0];
                // if it has missed people
                if (lift.missPeopleOn !== "" && lift.missPeopleOn !== lift.currentFloor){
                    activateQueue(lift, lift.missPeopleOn);
                    lift.missPeopleOn = "";
                }
                liftArrived(lift, runtime);
            }
        }
    }
}

function updatePointer(lift){
    while (lift.queue[lift.pointer][1] !== 1){
        lift.pointer++;
        if(lift.pointer === lift.queue.length){
            console.log("reverse");
            lift.queue.reverse();
            lift.pointer = 0;
        }
    }
}

// secondary problem (action selection)

// change the time forward
export function addTime(runtime){
    if (Globals.SPEED !== 0){
        Globals.TIME++;
        if (Globals.TIME > 1440){
            Globals.TIME = 0;
        }
        // update clock
        const timeText = runtime.objects.txtTime.getFirstInstance();
        timeText.text = String(Math.floor(Globals.TIME / 60)).padStart(2, "0") + ":" + String(Globals.TIME % 60).padStart(2, "0");
        
        // check schedule
        checkSchedule(runtime);
    }
}

// every time the time changes, check if a corresponding schedule event needs to be checked
export function checkSchedule(runtime){
    let workerSchedule = Globals.schedule["worker"];
    let residentSchedule = Globals.schedule["resident"];

    if (workerSchedule.hasOwnProperty(Globals.TIME)){
        updateTasks(runtime, workerSchedule[Globals.TIME], "worker");
    }
    if (residentSchedule.hasOwnProperty(Globals.TIME)){
        updateTasks(runtime, residentSchedule[Globals.TIME], "resident");
    }

    // certain tasks always run every hour
    if (Globals.TIME % 60 === 0){
        updateTasks(runtime, ["eating", 1, "go back home"], "resident");
        updateTasks(runtime, ["eating", 1, "go to work"], "worker");
        updateTasks(runtime, ["out", 0.5, "go back home"], "resident");
        updateTasks(runtime, ["idle", 1, "go to work"], "worker");

        //if they are lost
        updateTasks(runtime, ["lost", 1, "go to work"], "worker");
        updateTasks(runtime, ["lost", 1, "go back home"], "resident");

        // after a certain time, on the hour certain tasks can run
        if (Globals.TIME > 1110 || Globals.TIME < 480){
            updateTasks(runtime, ["working", 1, "go home"], "worker");
        }
    }

}

// if an event is checked, then check requirements and activate is possible
function updateTasks(runtime, tasks, type){
    for (const person of runtime.objects.sprPerson.getAllInstances()){
        if (person.type === type){
            if (person.currentState === tasks[0]){
                if (Math.random() < tasks[1]){
                    activateTask(runtime, tasks[2], person);
                }
            }
        }
    }
}

// what to do with specific tasks
// some tasks, a person goes to a prestored room, other times they find the nearest relevant room
function activateTask(runtime, task, person){
    if (task === "go to work"){
        Searching.astar(Globals.graph, person.currentRoom, person.primaryBuilding, person, runtime);
    }else if (task === "go to eat"){
        let nearestRoom = findNearestRoom(runtime, person, "foodCourt")
        // if there is a nearest room,
        if (nearestRoom !== "no rooms"){
            Searching.astar(Globals.graph, person.currentRoom, nearestRoom, person, runtime);
        }
    }else if (task === "go back home"){
        Searching.astar(Globals.graph, person.currentRoom, person.primaryBuilding, person, runtime);
    }else if (task === "go home" || task === "go out"){
        let nearestRoom = findNearestRoom(runtime, person, "spawn")
        // if there is a nearest room,
        if (nearestRoom !== "no rooms"){
            Searching.astar(Globals.graph, person.currentRoom, nearestRoom, person, runtime);
        }
    }else if (task === "go to bathroom"){
        let nearestRoom = findNearestRoom(runtime, person, "bathroom")
        // if there is a nearest room,
        if (nearestRoom !== "no rooms"){
            Searching.astar(Globals.graph, person.currentRoom, nearestRoom, person, runtime);
        }
    }
}

// to find the nearest relevant room, this function is called
function findNearestRoom(runtime, person, type){
    let currentLowestDist = Infinity;
    let currentRoom = "";
    let chance = 0.3;
    for (const room of runtime.objects.sprRoom.getAllInstances()){
        if (room.animationName === type){
            if (Ut.distanceTo(room.x, room.y, person.x, person.y) < currentLowestDist){
                currentLowestDist = Ut.distanceTo(room.x, room.y, person.x, person.y);
                currentRoom = String(room.uid);

                // chance of leaving the loop and retaining the current smallest (sometimes they don't find the smallest)
                if (Math.random() < chance){
                    break;
                }
            }
        }
    }
    if (currentRoom !== ""){
        return currentRoom;
    }else{
        return "no rooms";
    }
}