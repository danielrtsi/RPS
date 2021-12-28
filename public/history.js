//Variable for storing player's name
var playerName = "";

//Function for showing player's games and their data
function showGames() {

    //Creating a http request for getting game data from the server
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        //Getting an array of game objects and
        //sorting the games list by date in decreasing order
        let games = JSON.parse(xhttp.responseText);
        games.sort((a, b) => {
          return b.t-a.t;
        });

        //Removing games of previous player
        let historyDiv = document.getElementById("gamehistory");
        while (historyDiv.firstChild) {
          historyDiv.removeChild(historyDiv.lastChild);
        }

        //Clear the previous player's data
        let infodiv = document.getElementById("playerinfo");
        while (infodiv.firstChild) {
          infodiv.removeChild(infodiv.lastChild);
        }

        //If player was not found, tell it to the user
        if (games.length == 0) {
          let p = document.createElement("p");
          p.classList.add("nonefound");
          p.innerText = "Player " + playerName + " was not found.";
          infodiv.appendChild(p);
          return;
        }

        //Initializing varibales for counting wins and amounts of every move and
        //handling the data of every game and displaying it.
        //Order of the moves array is rock, paper, scissors.
        let moves = [0, 0, 0];
        let wins = 0;
        for (let i = 0; i < games.length; i++) {
          //Getting player based on the name stored in playerName and incrementing the slot of player's move by one
          let player = playerName == games[i].playerA.name ? games[i].playerA : games[i].playerB;
          switch (player.played) {
            case "ROCK":
              moves[0] = moves[0]+1;
              break;
            case "PAPER":
              moves[1] = moves[1]+1;
              break;
            case "SCISSORS":
              moves[2] = moves[2]+1;
              break;
          }

          if (games[i].winner == playerName) wins++;

          //Creating the paragraph element for displaying the game.
          //Every other game is displayed with dark grey background and every other with light
          let p = document.createElement("p");
          let class_ = (i % 2 == 0) ? "history1" : "history2";
          p.classList.add(class_);
          //Adding the leading zero to minutes and constructing the string to be shown
          let date = new Date(games[i].t);
          let minutes = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
          p.innerText = date.getDate() + "." + String(date.getMonth()+1) + "." + date.getFullYear() + " "
           + date.getHours() + ":" + minutes + ": \n" + games[i].playerA.name + " [" + games[i].playerA.played + "] vs. \n"
            + games[i].playerB.name + " [" + games[i].playerB.played + "]\n\nWinner: ";

          //A span element for changing winner's colour
          let span = document.createElement("span");
          switch (games[i].winner) {
            case playerName:
              class_ = "green";
              break;
            case "DRAW":
              class_ = "blue";
              break;
            default:
              class_ = "red";
          }

          //Displaying the game
          span.classList.add(class_);
          span.innerText = games[i].winner;
          p.appendChild(span);
          historyDiv.appendChild(p);
        }

        //Index of player's favourite hand and hand based by the index
        let favhand = "NONE";
        switch (moves.indexOf(max(moves))) {
          case 0:
            favhand = "ROCK";
            break;
          case 1:
            favhand = "PAPER";
            break;
          case 2:
            favhand = "SCISSORS";
            break;
        }

        //Create variables for paragraphs and spans displaying the data...
        let namep = document.createElement("p");
        let totalp = document.createElement("p");
        let favhandp = document.createElement("p");
        let winratiop = document.createElement("p");
        let namespan = document.createElement("span");
        let totalspan = document.createElement("span");
        let favhandspan = document.createElement("span");
        let winratiospan = document.createElement("span");
        //...add their classes...
        namep.classList.add("info");
        totalp.classList.add("info");
        favhandp.classList.add("info");
        winratiop.classList.add("info");
        namespan.classList.add("info2");
        totalspan.classList.add("info2");
        favhandspan.classList.add("info2");
        winratiospan.classList.add("info2");
        //...and set their texts
        namep.innerText = "Name: ";
        totalp.innerText = "Games played: ";
        favhandp.innerText = "Most played hand: ";
        winratiop.innerText = "Win ratio: ";
        namespan.innerText = playerName;
        totalspan.innerText = games.length;
        favhandspan.innerText = favhand;
        winratiospan.innerText = String(Math.round((wins/games.length)*10000)/100) + "%";

        //Display the data
        namep.appendChild(namespan);
        totalp.appendChild(totalspan);
        favhandp.appendChild(favhandspan);
        winratiop.appendChild(winratiospan);
        infodiv.appendChild(namep);
        infodiv.appendChild(totalp);
        infodiv.appendChild(favhandp);
        infodiv.appendChild(winratiop);

      }
    };
    //Get name from text fields, make a request for getting player data and store it to playerName
    let firstname = document.getElementById("firstname").value;
    let lastname = document.getElementById("lastname").value;
    let name = "player=" + firstname + "_" + lastname;
    playerName = firstname + " " + lastname;
    document.getElementById("gametitle").innerText = String(playerName);
    firstname = "";
    lastname = "";
    xhttp.open("GET", name);
    xhttp.send();
}

//A function passed to the event listeners below for detecting enter being pressed
function keyPressed(event) {
  if (event.code == "Enter") {
    showGames();
  }
}

//A function for finding the biggest value of an array
function max(array) {
  if (array.length == 0) return -1;
  let max = array[0];
  for (let i = 0; i < array.length; i++) {
    if (array[i] > max) max = array[i];
  }
  return max;
}

//Assigning event listeners: hitting the enter for text fields and clicking for the button
document.getElementById("searchbutton").addEventListener("click", showGames);
document.getElementById("firstname").addEventListener("keypress", keyPressed);
document.getElementById("lastname").addEventListener("keypress", keyPressed);
