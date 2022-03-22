// CTRL+SHIFT+P

// importing globals
import * as Building from "./building.js";
import * as ActionSelection from "./actionSelection.js";
import * as Generating from "./generatingGraph.js";

import Globals from "./globals.js";

import PersonInstance from "./person.js";
import LiftInstance from "./lift.js";
// secondary problem
import RoomInstance from "./room.js";

runOnStartup(async runtime =>
{
	// creating person class
	runtime.objects.sprPerson.setInstanceClass(PersonInstance);
	// creating lift class
	runtime.objects.sprLift.setInstanceClass(LiftInstance);
	// creating room class
	runtime.objects.sprRoom.setInstanceClass(RoomInstance);

	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
	
});

async function OnBeforeProjectStart(runtime)
{
	// every tick event (fires Tick)
	runtime.addEventListener("tick", () => Tick(runtime));
	// create mousedown event
	runtime.addEventListener("mousedown", e => Building.onMouseDown(e, runtime));
	// mouse wheel
	runtime.addEventListener("wheel", e => Building.expandRoom(e, runtime));
	// keyboard interaction
	runtime.addEventListener("keydown", e => Building.placeBuilding(e, runtime));
	// waitinig time for the lifts before they move again
	Globals.LIFTTIMER = setInterval(() => ActionSelection.moveLifts(runtime), 300);
	// moving time along
	Globals.TIMER = setInterval(() => ActionSelection.addTime(runtime), 300);
	// still waiting for lift
	setInterval(() => ActionSelection.stillWaiting(runtime), 10000);

	Building.resetGlobal()
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

	
}

function Tick(runtime)
{
	// if riding a lift or going to it
	if (Globals.SPEED !== 0){
		for (const person of runtime.objects.sprPerson.getAllInstances()){
			if (person.currentState === "riding lift"){
				ActionSelection.ridingLift(runtime, person);
			}
			if (person.currentState === "going to lift"){
				ActionSelection.arrivedAtLift(person);
			}
		}
		ActionSelection.callLiftToFloor(runtime)
	}
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