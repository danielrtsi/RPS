# RPS
A project for displaying displaying ongoing games from `https://bad-api-assignment.reaktor.com`.

## How does it work?
The history API has hundreds pages of data with more of it being created. It takes minutes to go through all the pages, which isn't something that should be done every time a user wants to check the history. Therefore the server goes through the API when it starts and log everything to a Mongo database. To make the starts faster, it will stop going through the API if it sees a page it has already been on. If you want the server to go through the whole API just replace contents of `lastpage.txt` with some nonsense. As the API is getting new entries when the server is on, it's listening to the live games and logging them as they end. 
