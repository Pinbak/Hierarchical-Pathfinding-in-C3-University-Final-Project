export function distanceTo(x1, y1, x2, y2){
	return Math.hypot(x2 - x1, y2 - y1);
}

export function angleTo(x1, y1, x2, y2){
	return Math.atan2(y2 - y1, x2 - x1);
}

export function manhattanDistance(x1, y1, x2, y2){
	return Math.abs(x2-x1) + Math.abs(y2-y1);
}

export function randomNum(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min)
  }