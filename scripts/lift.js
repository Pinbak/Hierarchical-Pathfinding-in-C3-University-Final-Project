export default class LiftInstance extends globalThis.ISpriteInstance{
	constructor(){
		super();
		this.parentLiftShaft = "";
        this.goesTo = [];
        this.queue = [];
        this.currentState = "waiting for passengers";
        this.currentFloor = "";
        this.pointer = 0;
        this.capacity = 10;
        this.onBoard = 0;
        this.missPeopleOn = "";
	}
}