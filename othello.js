'use strict';

const BOARD_SIZE = 8; //正方形で8×8の盤面なため高さと幅をまとめてる
let turnOfBlack = true;
let playerTurnOfBlack = true;
let cpuTurnOfBlack = false;
let cpuMode = true;
let nowCpuTurn = false;
let cpuTimeOut = 1000;
let displayCanPutPosition = false;
let nowBoardStatusArray = []
let canTurnOverPositionStack = []
let pieceCount = ["black", "white", "space"]
pieceCount["black"] = 2;
pieceCount["white"] = 2;
pieceCount["space"] = BOARD_SIZE * BOARD_SIZE - pieceCount["black"] - pieceCount["white"];

function initBoardStatusArray() {
	for (let y = 0; y <= BOARD_SIZE + 1; ++y) {
		let line = []
		for (let x = 0; x <= BOARD_SIZE + 1; ++x) {
			switch (y) {
				case 0:
				case BOARD_SIZE + 1:
					line.push("outzone");
					break;
				case 4:
					switch (x) {
						case 0:
						case BOARD_SIZE + 1:
							line.push("outzone");
							break;
						case 4:
							line.push("white");
							break;
						case 5:
							line.push("black");
							break;
						default:
							line.push("space");
							break;
					}
					break;
				case 5:
					switch (x) {
						case 0:
						case BOARD_SIZE + 1:
							line.push("outzone");
							break;
						case 4:
							line.push("black");
							break;
						case 5:
							line.push("white");
							break;
						default:
							line.push("space");
							break;
					}
					break;
				default:
					switch (x) {
						case 0:
						case BOARD_SIZE + 1:
							line.push("outzone");
							break;
						default:
							line.push("space");
							break;
					}
			}
		}
		nowBoardStatusArray.push(line);
	}
}

let clickedBoard = function(e) {
	let pieceId = e.target.id || e.target.parentElement.id;
	let pieceCoordinate = {
		y: parseInt(pieceId.slice(0, 1)),
		x: parseInt(pieceId.slice(2, 3))
	}

	if (nowBoardStatusArray[pieceCoordinate.y][pieceCoordinate.x] == "space") {
		if ((turnOfBlack && playerTurnOfBlack) || (nowCpuTurn && cpuTurnOfBlack)) {
			let canTurnOverPosition = searchEnemy("black", "white", pieceCoordinate);
			
			if (canTurnOverPosition.length == 0) {
				return;
			}

			let returnValues = turnOver("black", "white", pieceCoordinate, canTurnOverPosition);

			nowBoardStatusArray = returnValues.nextTurnBoardStatusArray;

			for (let i = 0; i < pieceCount.length; ++i) {
				pieceCount[pieceCount[i]] += returnValues.nextTurnPieceCountDif[pieceCount[i]];
			}

			insertArrayDataToBoard();
			clearCanPutPositionColor();

			if (checkNextTurn("black", "white") === 1) {
				document.getElementById("white-pass-button").style.display = "block";
				clearCanPutPositionColor();
			} else if (checkNextTurn("black", "white") === 2) {
				nextTurnProcess("black", "white");
				setTimeout(gameEndProcess, 40);
				return;
			}

			nextTurnProcess("black","white");
			nowCpuTurn = false;
		} else if ((!(turnOfBlack || playerTurnOfBlack)) || (nowCpuTurn && !(cpuTurnOfBlack))) {
			let canTurnOverPosition = searchEnemy("white", "black", pieceCoordinate);

			if (canTurnOverPosition.length == 0) {
				return;
			}

			let returnValues = turnOver("white", "black", pieceCoordinate, canTurnOverPosition);

			nowBoardStatusArray = returnValues.nextTurnBoardStatusArray;

			for (let i = 0; i < pieceCount.length; ++i) {
				pieceCount[pieceCount[i]] += returnValues.nextTurnPieceCountDif[pieceCount[i]];
			}

			insertArrayDataToBoard();
			clearCanPutPositionColor();
			
			if (checkNextTurn("white", "black") === 1) {
				document.getElementById("black-pass-button").style.display = "block";
				clearCanPutPositionColor();
			} else if (checkNextTurn("white", "black") === 2) {
				nextTurnProcess("white", "black");
				setTimeout(gameEndProcess, 40);
				return;
			}

			nextTurnProcess("white","black");
			nowCpuTurn = false;
		}

		if (!(pieceCount["space"])) {
			setTimeout(gameEndProcess, 40);
			return;
		}
		if (cpuMode && (cpuTurnOfBlack == turnOfBlack)) {
			if (document.getElementById("white-pass-button").style.display == "block") {
				let temp = function() {document.getElementById("white-pass-button").click();}
				setTimeout(temp, cpuTimeOut);
			} else if (document.getElementById("black-pass-button").style.display == "block") {
					let temp = function() {document.getElementById("black-pass-button").click();}
					setTimeout(temp, cpuTimeOut);
			} else {
				if (cpuTurnOfBlack && turnOfBlack) {
					setTimeout(cpuTurn, cpuTimeOut);
				} else if (!(cpuTurnOfBlack || turnOfBlack)) {
					setTimeout(cpuTurn, cpuTimeOut);
				}
			}
		} else if (!cpuMode) {
			playerTurnOfBlack = !playerTurnOfBlack;
		}
	}
}

let clickedBoardBugMode = function(e) {
	let pieceId = e.target.id || e.target.parentElement.id;
	let pieceCoordinate = {
		y: parseInt(pieceId.slice(0, 1)),
		x: parseInt(pieceId.slice(2, 3))
	}

	if (nowBoardStatusArray[pieceCoordinate.y][pieceCoordinate.x] == "space") {
		if ((turnOfBlack && playerTurnOfBlack) || (nowCpuTurn && cpuTurnOfBlack)) {
			let returnValues = searchEnemyBugMode("black", "white", pieceCoordinate);
			canTurnOverPositionStack = canTurnOverPositionStack.concat(returnValues.canTurnOverPositionBugMode);

			if (!returnValues.canTurnOverPosition.length && !returnValues.canTurnOverPositionBugMode.length) {
				return;
			}

			returnValues = turnOverBugMode("black", "white", pieceCoordinate, returnValues.canTurnOverPosition);
			nowBoardStatusArray = returnValues.nextTurnBoardStatusArray;

			for (let i = 0; i < pieceCount.length; ++i) {
				pieceCount[pieceCount[i]] += returnValues.nextTurnPieceCountDif[pieceCount[i]];
			}

			insertArrayDataToBoard();
			clearCanPutPositionColor();

			if (checkNextTurnBugMode("black", "white") === 1) {
				document.getElementById("white-pass-button").style.display = "block";
				clearCanPutPositionColor();
			} else if (checkNextTurnBugMode("black", "white") === 2) {
				nextTurnProcess("black", "white");
				setTimeout(gameEndProcess, 40);
				return;
			}

			nextTurnProcess("black","white");
			nowCpuTurn = false;
		} else if ((!(turnOfBlack || playerTurnOfBlack)) || (nowCpuTurn && !(cpuTurnOfBlack))) {
			let returnValues = searchEnemyBugMode("white", "black", pieceCoordinate);
			canTurnOverPositionStack = canTurnOverPositionStack.concat(returnValues.canTurnOverPositionBugMode);

			if (!returnValues.canTurnOverPosition.length && !returnValues.canTurnOverPositionBugMode.length) {
				return;
			}

			returnValues = turnOverBugMode("white", "black", pieceCoordinate, returnValues.canTurnOverPosition);
			nowBoardStatusArray = returnValues.nextTurnBoardStatusArray;

			for (let i = 0; i < pieceCount.length; ++i) {
				pieceCount[pieceCount[i]] += returnValues.nextTurnPieceCountDif[pieceCount[i]];
			}

			insertArrayDataToBoard();
			clearCanPutPositionColor();
			
			if (checkNextTurnBugMode("white", "black") === 1) {
				document.getElementById("black-pass-button").style.display = "block";
				clearCanPutPositionColor();
			} else if (checkNextTurnBugMode("white", "black") === 2) {
				nextTurnProcess("white", "black");
				setTimeout(gameEndProcess, 40);
				return;
			}

			nextTurnProcess("white","black");
			nowCpuTurn = false;
		}

		if (!(pieceCount["space"])) {
			setTimeout(gameEndProcess, 40);
			return;
		}

		if (cpuMode && (cpuTurnOfBlack == turnOfBlack)) {
			if (document.getElementById("white-pass-button").style.display == "block") {
				let temp = function() { document.getElementById("white-pass-button").click(); }
				setTimeout(temp, cpuTimeOut);
			} else {
				if (cpuTurnOfBlack && turnOfBlack) {
					setTimeout(cpuTurnBugMode, cpuTimeOut);
				} else if (!(cpuTurnOfBlack || turnOfBlack)) {
					setTimeout(cpuTurnBugMode, cpuTimeOut);
				}
			}
		} else if (!cpuMode) {
			playerTurnOfBlack = !playerTurnOfBlack;
		}
	}
}

function searchEnemy(myColor, enemyColor, pieceCoordinate) {
	let canTurnOverPosition = []
	for (let y = pieceCoordinate.y - 1; y <= pieceCoordinate.y + 1; ++y) {
		for (let x = pieceCoordinate.x - 1; x <= pieceCoordinate.x + 1; ++x) {
			let yDirection = y - pieceCoordinate.y;
			let xDirection = x - pieceCoordinate.x;

			if (nowBoardStatusArray[y][x] == enemyColor && nowBoardStatusArray[y][x] != "outzone") {
				let searchPosition = {
					y: y,
					x: x
				}

				while (nowBoardStatusArray[searchPosition.y][searchPosition.x] == enemyColor) {
					searchPosition = {
						y: searchPosition.y + yDirection,
						x: searchPosition.x + xDirection
					}
				}

				if (nowBoardStatusArray[searchPosition.y][searchPosition.x] == myColor) {
					canTurnOverPosition.push(searchPosition);
				}
			}
		}
	}
	return canTurnOverPosition;
}

function searchEnemyBugMode(myColor, enemyColor, pieceCoordinate) {
	let canTurnOverPosition = []
	let canTurnOverPositionBugMode = [];
	for (let y = pieceCoordinate.y - 1; y <= pieceCoordinate.y + 1; ++y) {
		for (let x = pieceCoordinate.x - 1; x <= pieceCoordinate.x + 1; ++x) {
			let yDirection = y - pieceCoordinate.y;
			let xDirection = x - pieceCoordinate.x;
			let searchPositionId = y * BOARD_SIZE + x;

			if (searchPositionId <= 0 || searchPositionId > BOARD_SIZE * BOARD_SIZE + BOARD_SIZE) {
				continue;
			}

			let searchPosition = {
				searchDirection: {
					yDirection: yDirection,
					xDirection: xDirection
				}
			}

			searchPosition.searchPositionCoordinate = convertBugModePosition(searchPositionId);

			if (nowBoardStatusArray[searchPosition.searchPositionCoordinate.y][searchPosition.searchPositionCoordinate.x] == enemyColor) {
				while (nowBoardStatusArray[searchPosition.searchPositionCoordinate.y][searchPosition.searchPositionCoordinate.x] == enemyColor) {
					searchPosition.searchPositionCoordinate = convertBugModePosition(searchPositionId);

					if (searchPositionId <= BOARD_SIZE || searchPositionId > (BOARD_SIZE * BOARD_SIZE + BOARD_SIZE)) {
						searchPosition.putPieceCoordinate = {
							y: pieceCoordinate.y + searchPosition.searchDirection.yDirection,
							x: pieceCoordinate.x + searchPosition.searchDirection.xDirection
						}
						
						searchPosition.owner = myColor;
						searchPosition.canTurnOverFlag = false;
						canTurnOverPositionBugMode.push(searchPosition);
						return {
							"canTurnOverPosition": canTurnOverPosition,
							"canTurnOverPositionBugMode": canTurnOverPositionBugMode
						}
					}		
					searchPositionId = (searchPosition.searchPositionCoordinate.y + yDirection) * BOARD_SIZE + (searchPosition.searchPositionCoordinate.x + xDirection);
				}

				if (nowBoardStatusArray[searchPosition.searchPositionCoordinate.y][searchPosition.searchPositionCoordinate.x] == myColor) {
					canTurnOverPosition.push(searchPosition);
				}
			}
		}
	}

	return {
		"canTurnOverPosition": canTurnOverPosition,
		"canTurnOverPositionBugMode": canTurnOverPositionBugMode
	}
}

//https://www.deep-rain.com/programming/javascript/755
function objectSort(obj) {
	// まずキーのみをソートする
	var keys = Object.keys(obj).sort();

	// 返却する空のオブジェクトを作る
	var map = {}

	// ソート済みのキー順に返却用のオブジェクトに値を格納する
	keys.forEach(function (key) {
		map[key] = obj[key];
	});

	return map;
}

function turnOver(myColor, enemyColor, pieceCoordinate,canTurnOverPosition) {
	let nextTurnBoardStatusArray = JSON.parse(JSON.stringify(nowBoardStatusArray));
	let nextTurnPieceCountDif = {
		"black": 0,
		"white": 0,
		"space": -1
	}

	nextTurnBoardStatusArray[pieceCoordinate.y][pieceCoordinate.x] = myColor;
	++nextTurnPieceCountDif[myColor];

	for (let i = 0; i < canTurnOverPosition.length; ++i) {
		let yDirection = (canTurnOverPosition[i].y - pieceCoordinate.y) / Math.abs(canTurnOverPosition[i].y - pieceCoordinate.y);
		let xDirection = (canTurnOverPosition[i].x - pieceCoordinate.x) / Math.abs(canTurnOverPosition[i].x - pieceCoordinate.x);
		let turnOverPosition = {
			x: pieceCoordinate.x,
			y: pieceCoordinate.y
		}

		while (!(JSON.stringify(objectSort(canTurnOverPosition[i])) === JSON.stringify(objectSort(turnOverPosition)))) {
			if (nextTurnBoardStatusArray[turnOverPosition.y][turnOverPosition.x] == enemyColor) {
				nextTurnBoardStatusArray[turnOverPosition.y][turnOverPosition.x] = myColor;
				++nextTurnPieceCountDif[myColor];
				--nextTurnPieceCountDif[enemyColor];
			}

			if (yDirection) {
				turnOverPosition.y += yDirection;
			} else {
				turnOverPosition.y += 0;
			}

			if (xDirection) {
				turnOverPosition.x += xDirection;
			} else {
				turnOverPosition.x += 0;
			}
		}
	}

	return {
		"nextTurnBoardStatusArray": nextTurnBoardStatusArray,
		"nextTurnPieceCountDif": nextTurnPieceCountDif
	}
}

function turnOverBugMode(myColor, enemyColor, pieceCoordinate,canTurnOverPosition) {
	let nextTurnBoardStatusArray = JSON.parse(JSON.stringify(nowBoardStatusArray));
	let nextTurnPieceCountDif = {
		"black": 0,
		"white": 0,
		"space": -1
	}

	nextTurnBoardStatusArray[pieceCoordinate.y][pieceCoordinate.x] = myColor;
	++nextTurnPieceCountDif[myColor];

	for (let i = 0; i < canTurnOverPosition.length; ++i) {
		let turnOverPositionId = pieceCoordinate.y * BOARD_SIZE + pieceCoordinate.x;
		let turnOverPosition = convertBugModePosition(turnOverPositionId);

		while (!(JSON.stringify(objectSort(canTurnOverPosition[i].searchPositionCoordinate)) === JSON.stringify(objectSort(turnOverPosition)))) {
			if (nextTurnBoardStatusArray[turnOverPosition.y][turnOverPosition.x] == enemyColor) {
				nextTurnBoardStatusArray[turnOverPosition.y][turnOverPosition.x] = myColor;
				++nextTurnPieceCountDif[myColor];
				--nextTurnPieceCountDif[enemyColor];
			}

			turnOverPositionId = (turnOverPosition.y + canTurnOverPosition[i].searchDirection.yDirection) * BOARD_SIZE + (turnOverPosition.x + canTurnOverPosition[i].searchDirection.xDirection);
			turnOverPosition = convertBugModePosition(turnOverPositionId);
		}
	}

	for (let i = 0; i < canTurnOverPositionStack.length; ++i) {
		if (canTurnOverPositionStack[i].owner != myColor) {
			continue;
		}

		if (canTurnOverPositionStack[i].canTurnOverFlag) {
			let turnOverPositionId = canTurnOverPositionStack[i].putPieceCoordinate.y * BOARD_SIZE + canTurnOverPositionStack[i].putPieceCoordinate.x;
			let turnOverPosition = convertBugModePosition(turnOverPositionId);

			while (!(JSON.stringify(objectSort(canTurnOverPositionStack[i].searchPositionCoordinate)) === JSON.stringify(objectSort(turnOverPosition)))) {
				if (nextTurnBoardStatusArray[turnOverPosition.y][turnOverPosition.x] == enemyColor) {
					nextTurnBoardStatusArray[turnOverPosition.y][turnOverPosition.x] = myColor;
					++nextTurnPieceCountDif[myColor];
					--nextTurnPieceCountDif[enemyColor];
				}

				turnOverPositionId = (turnOverPosition.y + canTurnOverPositionStack[i].searchDirection.yDirection) * BOARD_SIZE + (turnOverPosition.x + canTurnOverPositionStack[i].searchDirection.xDirection);
				turnOverPosition = convertBugModePosition(turnOverPositionId);
			}
			
			canTurnOverPositionStack.splice(i--, 1);
		} else {
			canTurnOverPositionStack[i].canTurnOverFlag = true;
		}
	}

	return {
		"nextTurnBoardStatusArray": nextTurnBoardStatusArray,
		"nextTurnPieceCountDif": nextTurnPieceCountDif
	}
}

function canPutEnemy(nowTurnColor, nextTurnColor) {
	let passStatus = true;
	for (let y = 1; y <= BOARD_SIZE; ++y) {
		for (let x = 1; x <= BOARD_SIZE; ++x) {
			if (nowBoardStatusArray[y][x] == "space") {
				let imagnaryPosition = {
					y: y,
					x: x
				}

				let canTurnOverPosition = searchEnemy(nowTurnColor, nextTurnColor, imagnaryPosition);

				if (canTurnOverPosition.length > 0) {
					if (displayCanPutPosition) {
						paintCanPutPosition(y, x);
					}

					passStatus = false;
				}
			}
		}
	}
	return passStatus;
}

function canPutEnemyBugMode(nowTurnColor, nextTurnColor) {
	let passStatus = true;
	for (let y = 1; y <= BOARD_SIZE; ++y) {
		for (let x = 1; x <= BOARD_SIZE; ++x) {
			if (nowBoardStatusArray[y][x] == "space") {
				let imagnaryPosition = {
					y: y,
					x: x
				}

				let returnValues = searchEnemyBugMode(nowTurnColor, nextTurnColor, imagnaryPosition);

				if (returnValues.canTurnOverPosition.length || returnValues.canTurnOverPositionBugMode.length) {
					if (displayCanPutPosition) {
						paintCanPutPosition(y, x);
					}

					passStatus = false;
				}
			}
		}
	}
	return passStatus;
}

function checkNextTurn(nowTurnColor, nextTurnColor) {
	if (canPutEnemy(nextTurnColor, nowTurnColor)) {
		if (canPutEnemy(nowTurnColor, nextTurnColor)) {
			return 2;
		}
		return 1;
	} else {
		return 0;
	}
}

function checkNextTurnBugMode(nowTurnColor, nextTurnColor) {
	if (canPutEnemyBugMode(nextTurnColor, nowTurnColor)) {
		if (canPutEnemyBugMode(nowTurnColor, nextTurnColor)) {
			return 2;
		}
		return 1;
	} else {
		return 0;
	}
}

function paintCanPutPosition(y, x) {
	document.getElementById(y + "-" + x).style.backgroundColor = "palegreen";
}

function clearCanPutPositionColor() {
	for (let y = 1; y <= BOARD_SIZE; ++y) {
		for (let x = 1; x <= BOARD_SIZE; ++x) {
			document.getElementById(y + "-" + x).style.backgroundColor = "rgba(0,0,0,0)"
		}
	}
}

function nextTurnProcess(nowTurnColor, nextTurnColor) {
	turnOfBlack = !turnOfBlack;
	nowPieces();
	changeTurnDisplay(nowTurnColor, nextTurnColor)
}

function changeTurnDisplay(nowTurnColor, nextTurnColor) {
	document.getElementById(nowTurnColor + "-turn-display").className = "not-now-turn";
	document.getElementById(nextTurnColor + "-turn-display").className = "now-turn";
}

function gameEndProcess() {
	alert("どちらも置ける場所がありません")
	winDecision();
	nextGameProcess();
	clearCanPutPositionColor();
}

function winDecision() {
	if (pieceCount["black"] == pieceCount["white"]) {
		alert("引き分け");
	}
	else if (pieceCount["black"] > pieceCount["white"]) {
		alert("黒の勝ち");
	}
	else {
		alert("白の勝ち");
	}
}

function passProcess() {
	if (turnOfBlack) {
		turnOfBlack = !turnOfBlack;
		document.getElementById("black-pass-button").style.display = "none";
		document.getElementById("black-turn-display").className = "not-now-turn";
		document.getElementById("white-turn-display").className = "now-turn";
		clearCanPutPositionColor();
		checkNextTurn("black", "white");
	}
	else {
		turnOfBlack = !turnOfBlack;
		document.getElementById("white-pass-button").style.display = "none";
		document.getElementById("black-turn-display").className = "now-turn";
		document.getElementById("white-turn-display").className = "not-now-turn";
		clearCanPutPositionColor();
		checkNextTurn("white", "black");
	}
}

function nextGameProcess() {
	let nextGame = confirm("次の試合をしますか？");
	if (nextGame) {
		location.href = location.href;
	}
	else {
		document.getElementById("next-game-button").style.display = "block";
	}
}

function nowPieces() {
	document.getElementById("now-white-pieces").innerHTML = pieceCount["white"];
	document.getElementById("now-black-pieces").innerHTML = pieceCount["black"];
}

function cpuTurn() {
	let cpuPutPosition = decideCpuPutPosition();
	nowCpuTurn = true;
	document.getElementById(cpuPutPosition.y + "-" + cpuPutPosition.x).click();
}

function cpuTurnBugMode() {
	let cpuPutPosition = decideCpuPutPositionBugMode();
	nowCpuTurn = true;
	document.getElementById(cpuPutPosition.y + "-" + cpuPutPosition.x).click();
}

function convertBugModePosition(normalModePositionId) {
	if (normalModePositionId % BOARD_SIZE) {
		let bugModePosition = {
			y: Math.floor(normalModePositionId / BOARD_SIZE),
			x: normalModePositionId % BOARD_SIZE
		}

		return bugModePosition;
	} else {
		let bugModePosition = {
			y: Math.floor(normalModePositionId / BOARD_SIZE) - 1,
			x: BOARD_SIZE
		}

		return bugModePosition;
	}
}

function decideCpuPutPosition() {
	let boardScoreArray = []
	let higherScore = 0;
	let higherScorePosition = {
		y: 0,
		x: 0
	}
	for (let y = 0; y <= BOARD_SIZE + 1; ++y) {
		let line = []
		for (let x = 0; x <= BOARD_SIZE + 1; ++x) {
			if (nowBoardStatusArray[y][x] == "space") {
				let nowPositionScore = 0;
				let canTurnOverPosition = []
				let imagnaryPosition = {
					y: y,
					x: x
				}

				if (cpuTurnOfBlack) {
					canTurnOverPosition = searchEnemy("black", "white", imagnaryPosition);
				} else {
					canTurnOverPosition = searchEnemy("white", "black", imagnaryPosition);
				}

				if (canTurnOverPosition.length == 0) {
					line.push([0]);
					continue;
				}

				for (let i = 0; i < canTurnOverPosition.length; ++i) {
					let yDirection = Math.abs(canTurnOverPosition[i].y - y);
					let xDirection = Math.abs(canTurnOverPosition[i].x - x);

					if (yDirection && xDirection) {
						nowPositionScore += yDirection - 1;
					} else {
						if (yDirection) {
							nowPositionScore += yDirection - 1;
						} else {
							nowPositionScore += xDirection - 1;
						}
					}
				}

				line.push([nowPositionScore]);
			} else {
				line.push([0]);
			}
		}
		boardScoreArray.push(line);
	}

	for (let y = 0; y < BOARD_SIZE + 1; ++y) {
		for (let x = 0; x < BOARD_SIZE + 1; ++x) {
			if (higherScore < boardScoreArray[y][x]) {
				higherScore = boardScoreArray[y][x];
				higherScorePosition = {
					y: y,
					x: x
				}
			}
		}
	}

	return higherScorePosition;
}

function decideCpuPutPositionBugMode() {
	let boardScoreArray = []
	let higherScore = 0;
	let higherScorePosition = {
		y: 0,
		x: 0
	}
	for (let y = 0; y <= BOARD_SIZE + 1; ++y) {
		let line = []
		for (let x = 0; x <= BOARD_SIZE + 1; ++x) {
			if (nowBoardStatusArray[y][x] == "space") {
				let nowPositionScore = 0;
				let imagnaryPosition = {
					y: y,
					x: x
				}

				if (cpuTurnOfBlack) {
					let returnValues = searchEnemyBugMode("black", "white", imagnaryPosition);
					nowPositionScore += returnValues.canTurnOverPositionBugMode.length;

					if (!returnValues.canTurnOverPosition.length && !returnValues.canTurnOverPositionBugMode.length) {
						line.push([0]);
						continue;
					}

					returnValues = turnOverBugMode("black", "white", imagnaryPosition, returnValues.canTurnOverPosition);
					nowPositionScore += returnValues.nextTurnPieceCountDif["black"] - 1;
				} else {
					let returnValues = searchEnemyBugMode("white", "black", imagnaryPosition);
					nowPositionScore += returnValues.canTurnOverPositionBugMode.length;

					if (!returnValues.canTurnOverPosition.length && !returnValues.canTurnOverPositionBugMode.length) {
						line.push([0]);
						continue;
					}

					returnValues = turnOverBugMode("white", "black", imagnaryPosition, returnValues.canTurnOverPosition);
					nowPositionScore += returnValues.nextTurnPieceCountDif["white"] - 1;
				}

				line.push([nowPositionScore]);
			} else {
				line.push([0]);
			}
		}
		boardScoreArray.push(line);
	}

	for (let y = 0; y < BOARD_SIZE + 1; ++y) {
		for (let x = 0; x < BOARD_SIZE + 1; ++x) {
			if (higherScore < boardScoreArray[y][x]) {
				higherScore = boardScoreArray[y][x][0];
				higherScorePosition = {
					y: y,
					x: x
				}
			}
		}
	}

	return higherScorePosition;
}

function changeDisplayCanPutPosition() {
	displayCanPutPosition = !displayCanPutPosition;

	if (displayCanPutPosition) {
		document.getElementById("display-can-put-position-button").innerHTML = "駒を置ける場所：<br>表示中";
		if (turnOfBlack) {
			canPutEnemy("black", "white");
		} else {
			canPutEnemy("white", "black");
		}
	} else {
		document.getElementById("display-can-put-position-button").innerHTML = "駒を置ける場所：<br>非表示中";
		clearCanPutPositionColor();
	}
}

function changeCpuMode() {
	cpuMode = !cpuMode;
	
	if (cpuMode) {
		document.getElementById("change-cpu-mode-button").innerHTML = "CPU: ON";
	} else {
		document.getElementById("change-cpu-mode-button").innerHTML = "CPU: OFF";
	}
}


function initBoard() {
	for (let y = 0; y < BOARD_SIZE + 1; ++y) {
		if (y === 0) {
			let htmlTr = document.createElement("tr");
			let htmlTh = document.createElement("th");

			document.getElementById("board").appendChild(htmlTr);
			htmlTr.appendChild(htmlTh);

			for (let x = 0; x < BOARD_SIZE + 1; ++x) {
				if (x !== 0) {
					let htmlTh = document.createElement("th");

					htmlTh.innerHTML = x;
					htmlTr.appendChild(htmlTh);
				}
			}
		}
		else {
			let htmlTr = document.createElement("tr");
			let htmlTh = document.createElement("th");

			htmlTh.innerHTML = y;
			document.getElementById("board").appendChild(htmlTr);
			htmlTr.appendChild(htmlTh);

			for (let x = 0; x < BOARD_SIZE + 1; ++x) {
				if (x !== 0) {
					let htmlTd = document.createElement("td");
					let htmlDiv = document.createElement("div");

					htmlDiv.addEventListener("click", clickedBoard, false);
					htmlDiv.id = y + "-" + x;
					htmlTr.appendChild(htmlTd);
					htmlTd.appendChild(htmlDiv);
				}
			}
		}
	}
}

function initBoardBugMode() {
	for (let y = 0; y < BOARD_SIZE + 1; ++y) {
		if (y === 0) {
			let htmlTr = document.createElement("tr");
			let htmlTh = document.createElement("th");

			document.getElementById("board").appendChild(htmlTr);
			htmlTr.appendChild(htmlTh);

			for (let x = 0; x < BOARD_SIZE + 1; ++x) {
				if (x !== 0) {
					let htmlTh = document.createElement("th");

					htmlTh.innerHTML = x;
					htmlTr.appendChild(htmlTh);
				}
			}
		}
		else {
			let htmlTr = document.createElement("tr");
			let htmlTh = document.createElement("th");

			htmlTh.innerHTML = y;
			document.getElementById("board").appendChild(htmlTr);
			htmlTr.appendChild(htmlTh);

			for (let x = 0; x < BOARD_SIZE + 1; ++x) {
				if (x !== 0) {
					let htmlTd = document.createElement("td");
					let htmlDiv = document.createElement("div");

					htmlDiv.addEventListener("click", clickedBoardBugMode, false);
					htmlDiv.id = y + "-" + x;
					htmlTr.appendChild(htmlTd);
					htmlTd.appendChild(htmlDiv);
				}
			}
		}
	}
}

function insertArrayDataToBoard() {
	for (let y = 0; y <= BOARD_SIZE; ++y) {
		for (let x = 0; x <= BOARD_SIZE; ++x) {
			if (nowBoardStatusArray[y][x] === "black") {
				document.getElementById(y + "-" + x).className = "black";
			} else if (nowBoardStatusArray[y][x] === "white") {
				document.getElementById(y + "-" + x).className = "white";
			}
		}
	}
}