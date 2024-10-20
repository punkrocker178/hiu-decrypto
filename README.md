# HiuDecrypto

This unfinished project is based on Decrypto boardgame.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.9.

## Develop FE
Run this if you only want to make changes on the Angular client app 

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Make the game running
First run to build Anuglar app into `dist/hiu-decrypto`
```
npm run build
```

Then start Node server to host the app 
```
node ./server/index.js`
```
Node server will initialize Pusher service to handle multipler interactions and also handle game logic.

## How to play
This is a 2 player game.  
The goal of the game is to crack the code of the opponent based on the clue they provided.


1st player go to `http://localhost:3000` and then grab the url the game has generated and provide to the 2nd player. 

Example
```
http://localhost:3000/?gameId=presence-ju81h5
```
