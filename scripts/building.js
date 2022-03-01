import Globals from "./globals.js";
import * as Generating from "./generatingGraph.js";

// what happens when the mouse is clicked
export function OnMouseDown(e, runtime){
    // if the user is not placing anything, return
    if (Globals.CURRENTLY_PLACING === 0){
        return;
    }

    // check for left mouse button
    if (e.button === 0){
        Generating.buildEdges(runtime);
        Generating.visualizeNodes(runtime);
        Generating.buildGraph(runtime);
    }
}

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