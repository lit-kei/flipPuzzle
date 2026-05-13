'use strict';

class Block {
	constructor(id, x, y, rotate, flip) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.rotate = rotate;
		this.flip = flip;
	}
	clone() {
		return new Block(
			this.id,
			this.x,
			this.y,
			this.rotate,
			this.flip
		);
	}
}

const blockInfo = [[2,2],[2,3],[2,4],[4,2]];

const blockShape = {
	1: {
		front: [
			[1,1],
			[1,0]
		],
		back: [
			[1,1],
			[1,0]
		]
	},
	2: {
		front: [
			[1,1],
			[1,0],
			[1,0]
		],
		back: [
			[1,1],
			[0,1],
			[0,1]
		]
	},
	3: {
		front: [
			[1,1],
			[1,0],
			[1,0],
			[1,0]
		],
		back: [
			[1,1],
			[0,1],
			[0,1],
			[0,1]
		]
	},
	4: {
		front: [
			[1,1,1,0],
			[0,0,1,1]
		],
		back: [
			[0,1,1,1],
			[1,1,0,0,]
		]
	}
};

const Flips = {
	front: "front",
	back: "back"
};

const W = 5;
const H = 4;

const blocks = {
	1: new Block(1, 2, 2, 0, Flips.front),
	2: new Block(2, 0, 1, 2, Flips.front),
	3: new Block(3, 3, 0, 2, Flips.front),
	4: new Block(4, 0, 0, 0, Flips.front)
};

//回転
function rotation(id, flip, n) {
	let arr = blockShape[id][flip];

   n = ((n % 4) + 4) % 4;

	let result = arr.map(row => [...row]);

   for (let k = 0; k < n; k++) {
   	result = result[0].map((_, i) =>
      	result.map(row => row[i]).reverse()
   	);
   }

   return result;
}

function toField() {
	let field = [
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];
	for (let i = 1; i < 5; i++) {
		let e = rotation(i, blocks[i].flip, blocks[i].rotate);
		for (let j = 0; j < e.length; j++) {
			for (let k = 0; k < e[j].length; k++) {
				if (e[j][k] == 1) {
					field[blocks[i].y + j][blocks[i].x + k] = i;
				}
			}
		}
	}
	return field;
}
function hashBlocks(blockArray) {
	let hash = 0;
	for (const b of Object.values(blockArray).sort((a,b) => a.id - b.id)) {
		let value = 
			(b.x) |
			(b.y << 2) |
			(b.rotate << 5) |
			(b.flip === Flips.back ? 1 : 0 << 7);
		hash = (hash << 7) | value;
	}
	return hash;
}
function isOverlapping() {
}
function solve() {
	
}
function bfs() {
	const visited = new Set();
	const queue = [];
	
}
