// CTRL+SHIFT+P

// importing globals
import * as Building from "./building.js";
import Globals from "./globals.js";

runOnStartup(async runtime =>
{
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
	
});

async function OnBeforeProjectStart(runtime)
{
	// every tick event (fires Tick)
	runtime.addEventListener("tick", () => Tick(runtime));
	// create mousedown event
	runtime.addEventListener("mousedown", e => Building.OnMouseDown(e, runtime));
	
}



function Tick(runtime)
{
	
	// building
	// if the left button is down
	/*
	if (runtime.mouse.isMouseButtonDown(0)){
		// if the user is building a building
		if (Globals.CURRENTLY_PLACING === 1){
			Building.placeBuilding(runtime);
		}
	}
	*/
}
