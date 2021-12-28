# RPS
A project for displaying displaying ongoing games from `https://bad-api-assignment.reaktor.com`.

## How does it work?
The history API has hundreds pages of data with more of it being created. It takes minutes to go through all the pages, which isn't something that should be done every time a user wants to check the history. Therefore the server goes through the API when it starts and logs everything to a Mongo database. To make the starts faster, it will stop going through the API if it sees a page it has already been on. If you want the server to go through the whole API just replace contents of `lastpage.txt` with some nonsense. Because the API is getting new entries when the server is on, it's listening to the live games and logging them as they end. 

## Installation
1. Install MongoDB
2. Open the terminal in the folder you want the project to be located in and clone the project:
`git clone https://github.com/DanielRuotsi/RPS`
3. Install NodeJS
4. Open the project folder and install necessary Node dependencies:

```
npm install mongodb
npm install websocket
```

5. Make sure your Mongo database is running run the app with `node app.js`. The first start will take a long while. The app will work as soon as it's started but the full history information will be available only when the server has finished going through the API. 
