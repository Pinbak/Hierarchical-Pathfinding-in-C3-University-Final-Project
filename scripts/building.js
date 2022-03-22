import Globals from "./globals.js";
import * as ActionSelection from "./actionSelection.js";
import * as Generating from "./generatingGraph.js";
import * as Searching from "./searchingGraph.js";
import * as Ut from "./ut.js";

// what happens when the mouse is clicked
export function onMouseDown(e, runtime){

    // destroy a building (the highest z elevated instance) if right click pressed
    if (e.button === 2){
        if (Globals.SPEED === 0){
            let highestInstance = "";
            let c = 0
            for (const building of runtime.objects.famRooms.getAllInstances()){
                if (building.containsPoint(runtime.mouse.getMouseX(),runtime.mouse.getMouseY())){
                    if (c===0){highestInstance = building;}
                    c++;
                    if (building.zIndex > highestInstance.zIndex){
                        highestInstance = building;
                        
                    }

                }
            }
            if (highestInstance !== ""){highestInstance.destroy();return;}

            // since buildings are on a lower layer, they should be destroyed separately
            for (const building of runtime.objects.sprBuilding.getAllInstances()){
                if (building.containsPoint(runtime.mouse.getMouseX(),runtime.mouse.getMouseY())){
                    building.destroy()
                    return;
                }
            }
            
        }
    }
    // check for left mouse button
    if (e.button === 0){
        // controlling time
        for (const timeControl of runtime.objects.sprTimeControl.getAllInstances()){
            if (timeControl.containsPoint(runtime.mouse.getMouseX(),runtime.mouse.getMouseY())){
                if (timeControl.animationName === "pause"){
                    evacuateBuilding(runtime);
                    Globals.SPEED = 0;
                    clearInterval(Globals.TIMER);
                    clearInterval(Globals.LIFTTIMER);
                    Globals.JUST_BUILT = true;
                }else if (timeControl.animationName === "play"){
                    Globals.SPEED = 1;
                    clearInterval(Globals.TIMER);
                    Globals.TIMER = setInterval(() => ActionSelection.addTime(runtime), 300);
                    clearInterval(Globals.LIFTTIMER);
                    Globals.LIFTTIMER = setInterval(() => ActionSelection.moveLifts(runtime), 300);
                    justBuilt(runtime);
                }else if (timeControl.animationName === "faster"){
                    Globals.SPEED = 3;
                    clearInterval(Globals.TIMER);
                    Globals.TIMER = setInterval(() => ActionSelection.addTime(runtime), 50);
                    clearInterval(Globals.LIFTTIMER);
                    Globals.LIFTTIMER = setInterval(() => ActionSelection.moveLifts(runtime), 50);
                    justBuilt(runtime);
                }
                return;
            }
        }

        // logging information about something
        for (const person of runtime.objects.sprPerson.getAllInstances()){
            if (person.containsPoint(runtime.mouse.getMouseX(),runtime.mouse.getMouseY())){
                console.log(person);
                return;
            }
        }
        for (const room of runtime.objects.sprRoom.getAllInstances()){
            if (room.containsPoint(runtime.mouse.getMouseX(),runtime.mouse.getMouseY())){
                console.log(room);
                return;
            }
        }

    }
    /*
    // check for left mouse button
    if (e.button === 0){
        
        //console.log(Globals.nodes[10][0]);
        //Searching.bfs(Globals.graph, "19", "15");
        //Searching.astar(Globals.graph, "19", "15");
        for (const person of runtime.objects.sprPerson.getAllInstances()){
			Searching.astar(Globals.graph, person.currentRoom, "15", person, runtime);
	    }
    }
    if (e.button === 2){
        for (const person of runtime.objects.sprPerson.getAllInstances()){
            if (person.containsPoint(runtime.mouse.getMouseX(),runtime.mouse.getMouseY())){
                person.currentState = "moving";
                ActionSelection.goToNextNode(runtime, person);
            }
        }
    }
    */
    
}

function evacuateBuilding(runtime){
    for (const person of runtime.objects.sprPerson.getAllInstances()){
        person.x = -60;
        person.y = 370;
        person.currentState = "idle";
    }
}

// resetting global objects
export function resetGlobal(){
	Globals.graph = Object();
	Globals.nodes = Object();
	Globals.subGraph = Object();
	Globals.liftShaft = Object();
	Globals.liftShaftAmount = Object();
    Globals.edges = [];
    Globals.subEdges = [];
}

// if you have just built something/moved something arround, recreate the map
function justBuilt(runtime){
    if (Globals.JUST_BUILT){
        Globals.JUST_BUILT = false;

        
        resetGlobal()
        // generate the graph
        Generating.buildEdges(runtime);
        //Generating.visualizeNodes(runtime, true);
        Generating.buildGraphs();
    
        // use the graph to search
        ActionSelection.addLiftShaftQueue(runtime);
        ActionSelection.findLiftShaft(runtime);
        ActionSelection.findRooms(runtime);
    
        // secondary problem
        ActionSelection.generatePeople(runtime);
        ActionSelection.checkForHomeless(runtime);

        // checks for problems in positioning and queue's needing to be updated again
        let overlap = false;
        let roomX = -10;
        let roomY = -10;
        
        // if they are waiting for the lift, the lift needs to be told again
        for (const person of runtime.objects.sprPerson.getAllInstances()){
            
            if (person.type === "resident" || (person.type === "worker" && (Globals.TIME < 1110 && Globals.TIME > 480))){
                Searching.astar(Globals.graph, person.currentRoom, person.primaryBuilding, person, runtime);
            }
            /*
            if (person.currentPath.length > 0){
                Searching.astar(Globals.graph, person.currentRoom, person.currentPath[person.currentPath.length-1], person, runtime);
            }

            
                        for (const liftShaft of runtime.objects.sprLiftShaft.getAllInstances()){
                if (person.testOverlap(liftShaft)){
                    ActionSelection.addToLiftShaftQueue(String(liftShaft.uid), person.previousNode)
                }
            }
            if (person.currentState === "waiting for lift"){
                for (const liftShaft of runtime.objects.sprLiftShaft.getAllInstances()){
                    if (person.testOverlap(liftShaft)){
                        for (const lift of runtime.objects.sprLift.getAllInstances()){
                            if (lift.testOverlap(liftShaft)){
                                ActionSelection.activateQueue(lift, person.previousNode)
                            }
                        }
                    }
                }
            }
            /*
            // check if they are not on a room
            for (const room of runtime.objects.sprRoom.getAllInstances()){
                if (person.testOverlap(room)){
                    overlap = true;
                }
                if (String(room.uid) === person.primaryBuilding){
                    roomX = room.x;
                    roomY = room.y;
                }
            }
            if (!overlap){
                if (person.x === 10){person.destroy();}
                person.x = roomX;
                person.y = roomY;
            }
            */
        }
    }
}

export function placeBuilding(e, runtime){
    if (Globals.SPEED === 0){
        const mouseX = runtime.mouse.getMouseX();
        const mouseY = runtime.mouse.getMouseY();
        let built = false;
        let tempBuilding = "";
        // place building
        if (e.key === "1"){
            tempBuilding = runtime.objects.sprBuilding.createInstance("building", mouseX, mouseY, false);
            built = true;
            tempBuilding.width = 30;
        }else if (e.key === "2"){
            tempBuilding = runtime.objects.sprLiftShaft.createInstance("rooms", mouseX, mouseY, false);
            built = true;
            tempBuilding.height = 40;
            tempBuilding.moveToBottom();
        }else if (e.key === "3"){
            tempBuilding = runtime.objects.sprLift.createInstance("rooms", mouseX, mouseY, false);
            built = true;
            tempBuilding.height = 40;
        }else if (e.key === "4"){
            tempBuilding = runtime.objects.sprRoom.createInstance("rooms", mouseX, mouseY, false);
            built = true;
            tempBuilding.setAnimation("flat", "beginning")
        }else if (e.key === "5"){
            tempBuilding = runtime.objects.sprRoom.createInstance("rooms", mouseX, mouseY, false);
            built = true;
            tempBuilding.setAnimation("office", "beginning")
        }else if (e.key === "6"){
            tempBuilding = runtime.objects.sprRoom.createInstance("rooms", mouseX, mouseY, false);
            built = true;
            tempBuilding.setAnimation("bathroom", "beginning")
        }else if (e.key === "7"){
            tempBuilding = runtime.objects.sprRoom.createInstance("rooms", mouseX, mouseY, false);
            built = true;
            tempBuilding.setAnimation("foodCourt", "beginning")
        }
        if (built){
            tempBuilding.x = (Math.round(tempBuilding.x/Globals.GRID_SIZE_X))*Globals.GRID_SIZE_X;
            tempBuilding.y = (Math.round(tempBuilding.y/Globals.GRID_SIZE_Y))*Globals.GRID_SIZE_Y;
        }

    }
}

export function expandRoom(e, runtime){
    if (Globals.SPEED !== 0){return;}
    if (Globals.SPEED === 0){
        if (e.deltaY < 0){
            for (const liftShaft of runtime.objects.sprLiftShaft.getAllInstances()){
                if (liftShaft.containsPoint(runtime.mouse.getMouseX(), runtime.mouse.getMouseY())){
                    liftShaft.height = liftShaft.height + 40;
                    return;
                }
            }
            for (const building of runtime.objects.sprBuilding.getAllInstances()){
                if (building.containsPoint(runtime.mouse.getMouseX(), runtime.mouse.getMouseY())){
                    building.width = building.width + 10;
                    return;
                }
            }
        }else{
            Globals.JUST_BUILT = true;
            for (const liftShaft of runtime.objects.sprLiftShaft.getAllInstances()){
                if (liftShaft.containsPoint(runtime.mouse.getMouseX(), runtime.mouse.getMouseY())){
                    if (liftShaft.height > 40){
                        liftShaft.height = liftShaft.height - 40;
                        return;
                    }
                }
            }
            for (const building of runtime.objects.sprBuilding.getAllInstances()){
                if (building.containsPoint(runtime.mouse.getMouseX(), runtime.mouse.getMouseY())){
                    if (building.width > 40){
                        building.width = building.width - 10;
                        return;
                    }
                }
            }
        }
    }
}

/*
export function placeBuilding(runtime){
    // get the mouse object
    const mouse = runtime.mouse;
    const mouseX = mouse.getMouseX();
    const mouseY = mouse.getMouseY();

    let overlapping = false; 
    // check to see if building is not overlapping current
    for (const buildingInstance of runtime.objects.sprBuilding.instances()){
        if (buildingInstance.containsPoint(mouseX, mouseY)){
            overlapping = true;
        }
    } 
    // cannot overlap ground
    const groundInstance = runtime.objects.sprGround.getFirstInstance();
    if (groundInstance.containsPoint(mouseX,mouseY)){
        overlapping = true;
    }
    
    // if the new placement is not overlapping an existing building and above an old one
    if (!overlapping && checkBelow(runtime, mouseX, mouseY)){

        // so it builds on a grid
        const mouseXGrid = Math.round(mouseX/Globals.GRID_SIZE_X)*Globals.GRID_SIZE_X;
        const mouseYGrid = Math.round(mouseY/Globals.GRID_SIZE_Y)*Globals.GRID_SIZE_Y;

        // create building
        runtime.objects.sprBuilding.createInstance("building",mouseXGrid,mouseYGrid,false);
    }
}

// checks if there is a building below
function checkBelow(runtime, mouseX, mouseY){
    const groundInstance = runtime.objects.sprGround.getFirstInstance(); 
    // loop through all of the buildings and check that the mouse is above or ground below, if so, return true
    for (const buildingInstance of runtime.objects.sprBuilding.instances()){
        if (buildingInstance.containsPoint(mouseX, mouseY + buildingInstance.height) || groundInstance.containsPoint(mouseX, mouseY + buildingInstance.height)){
            return true;
        }
    }
}
*/