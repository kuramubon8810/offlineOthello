let userAgent = window.navigator.userAgent.toLowerCase();

if(userAgent.indexOf("msie") != -1 || userAgent.indexOf("trident") != -1) {
    location.href = "https://www.google.com/intl/en_us/chrome/";
}

function clickedGameStartButton() {
    document.getElementById("start-game-button").style.display = "none";
    document.getElementById("game-mode-selecter").style.display = "block";
}

function clickedNormalModeButton() {
    document.getElementById("black-pass-button").addEventListener("click", passProcess, false);
    document.getElementById("white-pass-button").addEventListener("click", passProcess, false);
    document.getElementById("next-game-button").addEventListener("click", nextGameProcess, false);
    document.getElementById("display-can-put-position-button").addEventListener("click", changeDisplayCanPutPosition, false);
    document.getElementById("change-cpu-mode-button").addEventListener("click", changeCpuMode, false);

    initBoard();
    initBoardStatusArray();
    insertArrayDataToBoard();
    checkNextTurn("white", "black");

    document.getElementById("cpu-mode-selecter").style.display = "block";
    document.getElementById("game-mode-selecter").style.display = "none";
}

function clickedBugModeButton() {
    document.getElementById("black-pass-button").addEventListener("click", passProcess, false);
    document.getElementById("white-pass-button").addEventListener("click", passProcess, false);
    document.getElementById("next-game-button").addEventListener("click", nextGameProcess, false);
    document.getElementById("display-can-put-position-button").addEventListener("click", changeDisplayCanPutPosition, false);
    document.getElementById("change-cpu-mode-button").addEventListener("click", changeCpuMode, false);

    initBoardBugMode();
    initBoardStatusArray();
    insertArrayDataToBoard();
    checkNextTurn("white", "black");

    document.getElementById("cpu-mode-selecter").style.display = "block";
    document.getElementById("game-mode-selecter").style.display = "none";
}

function clickedCpuModeOnButton() {
    cpuMode = true;

	document.getElementById("change-cpu-mode-button").innerHTML = "CPU: ON";
    document.getElementById("player-turn-selecter").style.display = "block";
    document.getElementById("cpu-mode-selecter").style.display = "none";
}

function clickedCpuModeOffButton() {
    cpuMode = false;
    
	document.getElementById("change-cpu-mode-button").innerHTML = "CPU: OFF";
    document.getElementById("grid").style.display = "grid";
    document.getElementById("cpu-mode-selecter").style.display = "none";
}

function clickedPlayerTurnBlackButton() {
    playerTurnOfBlack = true;
    cpuTurnOfBlack = false;

    document.getElementById("grid").style.display = "grid";
    document.getElementById("player-turn-selecter").style.display = "none";
}

function clickedPlayerTurnWhiteButton() {
    playerTurnOfBlack = false;
    cpuTurnOfBlack = true;
    setTimeout(cpuTurnBugMode, cpuTimeOut);

    document.getElementById("grid").style.display = "grid";
    document.getElementById("player-turn-selecter").style.display = "none";
}

document.getElementById("start-game-button").addEventListener("click", clickedGameStartButton, false);
document.getElementById("normal-mode-button").addEventListener("click", clickedNormalModeButton, false);
document.getElementById("bug-mode-button").addEventListener("click", clickedBugModeButton, false);
document.getElementById("cpu-mode-on-button").addEventListener("click", clickedCpuModeOnButton, false);
document.getElementById("cpu-mode-off-button").addEventListener("click", clickedCpuModeOffButton, false);
document.getElementById("player-turn-black-button").addEventListener("click", clickedPlayerTurnBlackButton, false);
document.getElementById("player-turn-white-button").addEventListener("click", clickedPlayerTurnWhiteButton, false);