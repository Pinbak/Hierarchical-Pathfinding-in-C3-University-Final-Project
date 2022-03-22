import Globals from "./globals.js";

export default class PersonInstance extends globalThis.ISpriteInstance{
	constructor(){
		super();

		// for primary problem
		this.currentRoom = "";
		this.currentPath = [];
        this.currentState = "";
        this.previousNode = "";
        this.liftOn = [];
        this.chosenLift = "";

		// for secondary problem
		this.type = "";
		this.primaryBuilding = "";
	}
}