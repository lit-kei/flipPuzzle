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

//各ブロックのマス数
const blockShape = {
	1: {
		front: [
			[1,1],
			[1,0]
		],
		back: [
			[1,1],
			[1,0]
		],
		size: 3
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
		],
		size: 4
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
		],
		size: 5
	},
	4: {
		front: [
			[1,1,1,0],
			[0,0,1,1]
		],
		back: [
			[0,1,1,1],
			[1,1,0,0,]
		],
		size: 5
	}
};

const Flips = {
	front: "front",
	back: "back"
};

const W = 5;
const H = 4;

const initialBlocks = {
	1: new Block(1, 2, 2, 0, Flips.front),
	2: new Block(2, 0, 1, 2, Flips.front),
	3: new Block(3, 3, 0, 2, Flips.front),
	4: new Block(4, 0, 0, 0, Flips.front)
};

const rotatedShapes = {};

for (let id = 1; id < 5; id++) {
	rotatedShapes[id] = {};
	for (const flip of [Flips.front, Flips.back]) {
		rotatedShapes[id][flip] = {};
		for (let rotate = 0; rotate < 4; rotate++) {
			rotatedShapes[id][flip][rotate] = rotation(id, flip, rotate);
		}
	}
}
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

function toField(blockArray) {
	let field = [
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];
	for (let i = 1; i < 5; i++) {
		if (blockArray[i].id == 0) continue;
		let e = rotatedShapes[i][blockArray[i].flip][blockArray[i].rotate];
		for (let j = 0; j < e.length; j++) {
			for (let k = 0; k < e[j].length; k++) {
				if (e[j][k] == 1) {
					field[blockArray[i].y + j][blockArray[i].x + k] = i;
				}
			}
		}
	}
	return field;
}
function calcHash(blockArray) {
	let hash = 0;
	for (const b of Object.values(blockArray).sort((a,b) => a.id - b.id)) {
		let value = 
			(b.x) |
			(b.y << 3) |
			(b.rotate << 5) |
			((b.flip === Flips.back ? 1 : 0 )<< 7);
		hash = (hash << 8) | value;
	}
	return hash >>> 0;
}
function getBlocksFromHash(hash) {
	const blocks = {};
	for (let i = 4; i > 0; i--) {
		const value = hash & 0b11111111;

		let x = value & 0b111;
		let y = (value >> 3) & 0b11;
		let rotate = (value >> 5) & 0b11;
		let flip = (value >> 7) == 1 ? Flips.back : Flips.front;

		blocks[i] = new Block(i, x, y, rotate, flip);

		hash >>>= 8;
	}
	return blocks;
}
function isOverlapping(blockArray) {
	const field = toField(blockArray);
	const n = field.flat().filter(e => e === 0).length;
	let empty = 0;
	for (const [key, block] of Object.entries(blockArray)) {
		if (block.id === 0) {
			empty += blockShape[key].size;
		}
	}
	if (n == 3 + empty) return false;
	return true;
}
function solve() {
	const result = detectBlocks();

	if (!result.success) {
		console.error(result.message);
		solution.innerHTML = `<h3>エラー：${result.message}</h3>`;
		return;
	}

	console.log(result.blocks, calcHash(result.blocks));

	const startTime = performance.now();

	const path = bfs(result.blocks);

	const endTime = performance.now();

	const time = endTime - startTime;

	console.log(path);
	if (path == false) {
		solution.innerHTML = `<h3>とけない．．（${time.toFixed(2)} ms）</h3>`;
	} else {
		renderSolution(path, time);
	}
}
function bfs(start) {
	console.time("puzzle");
	const parent = new Map();
	const visited = new Set();
	const queue = [];
	let head = 0;
	const startHash = calcHash(start);

	visited.add(startHash);
	queue.push(startHash);

	while (queue.length > head) {
		const v = queue[head++];
		const blocks = getBlocksFromHash(v);

		for (let i = 1; i < 5; i++) {
			const tmp = {
				1: blocks[1].clone(),
				2: blocks[2].clone(),
				3: blocks[3].clone(),
				4: blocks[4].clone()
			};
			tmp[i].id = 0;
			const baseField = toField(tmp);
			tmp[i].id = i;

			const block = new Block(i, 0, 0, 0, Flips.front);

			//TODO: 今回のパズルでのみ使用可、パーツ次第で不可
			for (let rotate = 0; rotate < 4; rotate++) {
				for (const flip of [Flips.front, Flips.back]) {

					block.rotate = rotate;
					block.flip = flip;

					const shape = rotatedShapes[i][flip][rotate];

					const h = shape.length;
					const w = shape[0].length;

					for (let y = 0; y <= H - h; y++) {
						for (let x = 0; x <= W - w; x++) {

							block.x = x;
							block.y = y;

							if (!canPlace(baseField, block)) continue;

							tmp[i] = block.clone();

							const hash = calcHash(tmp);

							if (visited.has(hash)) continue;

							visited.add(hash);
							queue.push(hash);

							parent.set(hash, v);

							if (isGoal(tmp)) {
								console.timeEnd("puzzle");

								const path = [];

								let cur = hash;

								while (cur !== startHash) {
									console.log(cur);
									path.push(cur);
									cur = parent.get(cur);
								}

								path.push(startHash);

								path.reverse();
								return path;
							}

							visited.add(hash);
							queue.push(hash);

							parent.set(hash, v);
						}
					}
				}
			}


		}
	}

	return false;
}

function canPlace(field, block) {
	const shape = rotatedShapes[block.id][block.flip][block.rotate];

	for (let j = 0; j < shape.length; j++) {
		for (let k = 0; k < shape[j].length; k++) {

			if (shape[j][k] === 0) continue;

			const ny = block.y + j;
			const nx = block.x + k;

			// 枠外判定
			if (nx < 0 || nx >= W || ny < 0 || ny >= H) {
				return false;
			}

			// 重なり判定
			if (field[ny][nx] !== 0) {
				return false;
			}
		}
	}
	return true;
}
function isGoal(blocks) {
	return (
		blocks[1].flip === Flips.back &&
		blocks[2].flip === Flips.back &&
		blocks[3].flip === Flips.back &&
		blocks[4].flip === Flips.back
	);
}

const inputField = [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]
];

const board = document.getElementById("board");
const solution = document.getElementById("solution");


function createBoard() {
    board.innerHTML = "";

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {

            const cell = document.createElement("button");

            cell.className = `cell color${inputField[y][x]}`;
            cell.textContent = inputField[y][x];

            cell.onclick = () => {
                inputField[y][x] = (inputField[y][x] + 1) % 5;
                updateCell(cell, y, x);
            };

            board.appendChild(cell);
        }
    }
}

function updateCell(cell, y, x) {
    cell.className = `cell color${inputField[y][x]}`;
    cell.textContent = inputField[y][x];
}

function clearBoard() {
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            inputField[y][x] = 0;
        }
    }

	solution.innerHTML = "";

    createBoard();
}

createBoard();

// 入力盤面から blockArray を復元
function detectBlocks() {

	const blocks = {};

	for (let id = 1; id <= 4; id++) {

		const cells = [];

		// id のマスを収集
		for (let y = 0; y < H; y++) {
			for (let x = 0; x < W; x++) {

				if (inputField[y][x] === id) {
					cells.push([x, y]);
				}
			}
		}

		// マス数チェック
		if (cells.length !== blockShape[id].size) {
			return {
				success: false,
				message: `Block ${id} のマス数が違います`
			};
		}

		// 左上基準へ正規化
		let minX = Infinity;
		let minY = Infinity;

		for (const [x, y] of cells) {
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
		}

		const normalized =
			cells.map(([x, y]) => [x - minX, y - minY]);

		let found = false;

		for (const flip of [Flips.front, Flips.back]) {
			for (let rotate = 0; rotate < 4; rotate++) {

				const shape =
					rotatedShapes[id][flip][rotate];

				const shapeCells = [];

				for (let j = 0; j < shape.length; j++) {
					for (let k = 0; k < shape[j].length; k++) {

						if (shape[j][k] === 1) {
							shapeCells.push([k, j]);
						}
					}
				}

				if (sameCells(normalized, shapeCells)) {

					blocks[id] = new Block(
						id,
						minX,
						minY,
						rotate,
						flip
					);

					found = true;
					break;
				}
			}

			if (found) break;
		}

		if (!found) {
			return {
				success: false,
				message: `Block ${id} の形状が一致しません`
			};
		}
	}

	return {
		success: true,
		blocks
	};
}

// セル集合比較
function sameCells(a, b) {

	if (a.length !== b.length) return false;

	const sa = [...a]
		.map(v => v.join(","))
		.sort();

	const sb = [...b]
		.map(v => v.join(","))
		.sort();

	for (let i = 0; i < sa.length; i++) {
		if (sa[i] !== sb[i]) {
			return false;
		}
	}

	return true;
}

function renderSolution(path, time) {

    solution.innerHTML = `<h3>${path.length-1}手でとける！（${time.toFixed(2)} ms）</h3>`;

    path.forEach((hash, index) => {

        const blocks = getBlocksFromHash(hash);

        const field = toField(blocks);

        // 1手分の盤面
        const boardDiv = document.createElement("div");

        boardDiv.className = "solution-board";

        // タイトル
        const title = document.createElement("div");

        title.textContent = `Step ${index}`;

        solution.appendChild(title);

        // マス生成
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {

                const value = field[y][x];

                const cell = document.createElement("div");

				let cls = `solution-cell color${value}`;
					
				if (
				    value !== 0 &&
				    blocks[value].flip === Flips.back
				) {
				    cls += " back";
				}
					
				cell.className = cls;
                //cell.textContent = value;

                boardDiv.appendChild(cell);
            }
        }

        solution.appendChild(boardDiv);
    });
}
