//Constants for oingoing games and websocket
const ongoingGames = document.getElementById("ongoingGames");
const socket = new WebSocket("wss://bad-api-assignment.reaktor.com/rps/live");

socket.onopen = (e) => {
	console.log(e.data);
};

//Handle information about ongoing games
socket.onmessage = (e) => {
	//remove some unnecessary garbage from the string and parse its data
	let result = e.data.replaceAll("\\", "").split(",");
	let game = JSON.parse(JSON.parse(e.data));

	//Display an ongoing game
  if (game && game.type == "GAME_BEGIN") {
    let p = document.createElement("p");
    p.innerText = game.playerA.name + " vs. " + game.playerB.name;
		p.id = game.gameId;
		p.classList.add("game");
    ongoingGames.appendChild(p);

		//remove an ended game from ongoing games
  } else if (game && game.type == "GAME_RESULT") {
		let oldLi = document.getElementById(game.gameId);
		if (oldLi) oldLi.remove();
	}
};
