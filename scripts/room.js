export default class RoomInstance extends globalThis.ISpriteInstance{
	constructor(){
		super();
		this.capacity = 100;
        this.occupancy = 0;
	}
}