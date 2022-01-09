//import libraries and declare necessary constants and variables
//Change these values
const port = 8080; //Your port
const ip = "127.0.0.1"; //Your ip
const dburl = "mongodb://localhost:27017"; //Your Mongo address
const collection = "games"; //Name of the collection you'd like to use
const dbname = "rspgames"; //Name of the database you'd like to use

const http = require("http");
const https = require("https");
const fs = require("fs");
const url = require("url");
const mongo = require("mongodb").MongoClient;
const socketclient = require("websocket").client;
const client = new socketclient();


var lastpage = "";
var counter = 0;
var end = false;
var base;

//Listen to websocket for adding ended games in real time
client.connect("wss://bad-api-assignment.reaktor.com/rps/live");

client.on("connectFailed", error => {
  console.log("Connection failed: " + error);
});

client.on("connect", connection => {
  connection.on("error", error => {
    console.log(error);
  });
  connection.on("message", message => {
    //Log the game if the type is game result
    let gamedata = JSON.parse(JSON.parse(message.utf8Data));
    if (gamedata.type == "GAME_RESULT") {
      console.log("Received game: " + gamedata.gameId);
      //rename the id field to use it as id in the database and determine the winner
      gamedata._id = gamedata.gameId;
      delete gamedata.gameId;
      gamedata.winner = getWinner(gamedata.playerA, gamedata.playerB);

      //Log the game
        base.collection(collection).insertOne(gamedata, (error, response) => {
          if (!error) console.log("Logged a game: " + gamedata._id);
        });
    }
  });
});

/*
*A function for determinig the winner. Params:
*playerA: A player object
*playerB: A player object
*/
function getWinner(playerA, playerB) {
    let moveA = playerA.played;
    let moveB = playerB.played;
    if (moveA == moveB) return "DRAW";

    switch(moveA) {
      case "PAPER":
        if (moveB == "SCISSORS") return playerB.name;
        return playerA.name;
      case "ROCK":
        if (moveB == "PAPER") return playerB.name;
        return playerA.name;
      case "SCISSORS":
        if (moveB == "ROCK") return playerB.name;
        return playerA.name;
      default:
        return "NONE";
    }


}

/*A function for going through the API and logging every game into database.
*The logging will stop when the 4th page of previous logging is reached to reduce boot time. Params:
*url: the base url as a string.
*/
function updateHistory(url) {
  //Send a GET request and get the data from one page
  https.get(url, response => {
    let data = "";
    response.on("data", datapiece => {
      data += datapiece;
    });

    response.on("end", () => {
      let obj = JSON.parse(data);
      let array = obj.data;
      let rows = [];
      //Get winner and rename id to _id for every game and put the data into an array
      for (let i = 0; i < array.length; i++) {
        let str = array[i];
        str.winner = getWinner(str.playerA, str.playerB);
        str._id = str.gameId;
        delete str.gameId;
        rows[rows.length] = str;
       }
       //Increment the page counter and output the value and cursor for debugging
       counter++;
       console.log("Page " + counter);
       console.log("Cursor: " + obj.cursor);

          for (let i = 0; i < rows.length; i++) {
              base.collection(collection).insertOne(rows[i], (error, resposnse) => {
                //The program will try insert games that are already logged. In that case just do nothing.
                if (error) {
                }
              });
          }
          if (obj.cursor == null || obj.cursor == lastpage) {
            return;
          }
          
          if (counter == 3) {
           fs.writeFile("lastpage.txt", obj.cursor || "cursor was null", error => {
             if (error) console.log("Failed to write to lastpage: " + error);
           });
          }
          //If cursor is null and for some reason it hasn't interrupted the logging,
          //it'll be set to empty string to prevent error and crash
          if (obj.cursor == null) obj.cursor = "";

          updateHistory("https://bad-api-assignment.reaktor.com" + obj.cursor);

        return;
});

});
}

//A function for responding with game info,
//separated from request handling due to readability
function sendGameInfo(response, path) {
  //Parsing name
  let name = path.split("=")[1]
    .replace("_", " ")
    .replaceAll("%C3%A4", "ä")
    .replaceAll("%C3%84", "Ä")
    .replaceAll("%C3%96", "Ö")
    .replaceAll("%C3%B6", "ö")
    .replaceAll("%C3%85", "Å")
    .replaceAll("%C3%A5", "å")
    .replaceAll("%20", " ");

  //Getting list of games from the database based by the name
    let query = {
          $or: [
            {
              playerA: {
                name: name,
                played: "SCISSORS"
              }
            },
            {
              playerA: {
                name: name,
                played: "PAPER"
              }
            },
            {
              playerA: {
                name: name,
                played: "ROCK"
              }
            },
            {
              playerB: {
                name: name,
                played: "SCISSORS"
              }
            },
            {
              playerB: {
                name: name,
                played: "PAPER"
              }
            },
            {
              playerB: {
                name: name,
                played: "ROCK"
              }
            }
          ]
    }

    base.collection(collection).find(query).toArray((error, result) => {
      if (error) console.log("Failed to get game data: " + error);
      //Sending the response
      response.setHeader("X-Content-Type-Options", "nosniff");
      response.writeHead(200, {"Content-type" : "text/plain"});
      response.end(JSON.stringify(result));
      return;
    });
}

//Handling requests
const server = http.createServer((request, response) => {
  //Removing unnecessary characters from the url string
  let path = url.parse(request.url, true).path.replace(/^\/+|\/+$/g, "");
  if (path.includes("player") && path.includes("=") && path.includes("_")) {
    sendGameInfo(response, path);
  } else {
    //Read the file
    if (path == "") path = "index.html";
    let file = __dirname + "/public/" + path;
    fs.readFile(file, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end("File not found.")
      } else {

        //Determine header based on the file extension and send the file
        response.setHeader("X-Content-Type-Options", "nosniff");
        switch (path.split(".")[1]) {
          case "js":
            response.writeHead(200, {"Content-type" : "application/javascript"});
            break;
          case "html":
            response.writeHead(200, {"Content-type" : "text/html"});
            break;
          case "css":
            response.writeHead(200, {"Content-type" : "text/css"});
            console.log("test");
            break;
        }
        response.end(data);
      }
    });
  }


});

server.listen(port, ip);
console.log("Listening.");

//connect to the database
mongo.connect(dburl, (error, database) => {
  base = database.db(dbname);
  //Create collection if it doesn't exist
     base.createCollection(collection, (error, result) => {
        if (error) {
          console.log("Collection already exists (:");
          return;
        }
        console.log("Created.");
    });

    //Read the lastpage and start going through the API
    fs.readFile("lastpage.txt", (error, data) => {
      if (error) console.log("Failed to read lastpage: " + error);
      lastpage = data;
      console.log("Current lastpage: " + String(lastpage));
      updateHistory("https://bad-api-assignment.reaktor.com/rps/history/");
    });
});
