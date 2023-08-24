const Pusher = require("pusher");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require("crypto");

const NUM_PLAYERS = 2;
const MAX_ROUNDS = 20;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let state = {
  round: 1,
  players: {},
  playersTurn: [],
  channel: '',
  generatedCode: '',
};

let codesMap = new Map();
const generateCode = () => {
  const codes = Array(3);
  codesMap.clear();
  for (let i = 0; i < 3; i++) {
    let random = getRandomInt(1, 5);
    while (codesMap.has(random)) {
      random = getRandomInt(1, 5);
    }
    codesMap.set(random, i);
    codes[i] = random;
  }
  return codes;
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}


const checkReady = (playerIds) => playerIds.every(playerId => !!state.players[playerId].isReady);

const resetPLayersReadyState = (playerIds) => {
  playerIds.forEach(playerId => {
    state.players[playerId].isReady = false;
  });
};

// initialise Pusher.
// Replace with your credentials from the Pusher Dashboard
const pusher = new Pusher({
  appId: "1652163",
  key: "761c85d3ce543ed44588",
  secret: "b7e40bd07d2bcfd6b706",
  cluster: "ap1",
  useTLS: true
});

// to serve our JavaScript, CSS and index.html
app.use(express.static('./dist/hiu-decrypto'));

// CORS
app.all('/*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// endpoint for authenticating client
app.post('/pusher/auth', function (req, res) {
  let socketId = req.body.socket_id;
  let channel = req.body.channel_name;
  let presenceData = {
    user_id: crypto.randomBytes(16).toString("hex")
  };
  let auth = pusher.authenticate(socketId, channel, presenceData);
  state.channel = channel;
  res.send(auth);
});

app.post('/api/member/add', (req, res) => {
  const playerId = req.body.playerId;
  state.players[playerId] = {
    successToken: 0,
    failedToken: 0,
    isReady: false,
    guess: ''
  };
  console.log('Member added', state.players[playerId]);
  res.sendStatus(200);
});

app.delete('/api/member/remove/:playerId', (req, res) => {
  const playerId = req.params.playerId;
  delete state.players[playerId];
  console.log('Member removed', playerId);
  res.sendStatus(200);
});

app.post('/api/ready', (req, res) => {
  const playerId = req.body.playerId;
  state.players[playerId].isReady = true;

  const playerIds = Object.keys(state.players);
  const isAllPlayersReady = checkReady(playerIds);
  console.log(`Player: ${playerId} ready`);
  console.log(state.players);
  if (isAllPlayersReady) {
    const codes = generateCode().join('');
    state.generatedCode = codes;
    for (let i = 1; i <= MAX_ROUNDS; i++) {
      if (i % 2 === 0) {
        state.playersTurn.push(playerIds[1]);
      } else {
        state.playersTurn.push(playerIds[0]);
      }
    }
    pusher.trigger(state.channel, 'round-started', {
      round: state.round,
      generatedCode: codes,
      playerTurn: state.playersTurn[state.round - 1]
    });

    resetPLayersReadyState(playerIds);
  }
  res.sendStatus(200);
});

app.post('/api/startRound', (req, res) => {
  const playerId = req.body.playerId;
  state.players[playerId].isReady = true;

  const playerIds = Object.keys(state.players);
  const isAllPlayersReady = checkReady(playerIds);

  console.log(`Player: ${playerId} ready`);

  if (isAllPlayersReady) {
    state.round++;
    const codes = generateCode().join('');
    state.generatedCode = codes;

    pusher.trigger(state.channel, 'round-started', {
      round: state.round,
      generatedCode: codes,
      playerTurn: state.playersTurn[state.round - 1]
    });

    resetPLayersReadyState(playerIds);
  };

  res.sendStatus(200);
});

app.post('/api/guess', (req, res) => {
  const generatedCode = state.generatedCode
  const playerGuessCode = req.body.playerGuessCode;
  const isPlayerRound = state.playersTurn[state.round - 1] == req.body.playerId;

  state.players[req.body.playerId].guess = playerGuessCode;

  if (isPlayerRound && (generatedCode != playerGuessCode)) {
    state.players[req.body.playerId]['failedToken']++;
  }
  if (!isPlayerRound && (generatedCode == playerGuessCode)) {
    state.players[req.body.playerId]['successToken']++;
  }

  const playerIds = Object.keys(state.players);
  const allPlayerGuessed = playerIds.every(playerId => state.players[playerId].guess !== '');

  if (allPlayerGuessed) {
    pusher.trigger(state.channel, 'round-ended', {
      result: state.players
    });

    const playerIds = Object.keys(state.players);
    playerIds.forEach(playerId => {
      state.players[playerId].isReady = false;
      state.players[playerId].guess = '';
    });
  }

  res.sendStatus(200);
});

app.post('/api/reset', (req, res) => {
  state.round = 1;
  state.generatedCode = '';
  state.players = {};
  state.playersTurn = [];
  // for (let player in state.players) {
  //   state.players[player] = {
  //     successToken: 0,
  //     failedToken: 0,
  //     guess: '',
  //     isReady: false
  //   }
  // }
  pusher.trigger(state.channel, 'game-reset', {});
  res.sendStatus(200);
});

// direct all other requests to the built app view

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/hiu-decrypto/index.html'));
});

// start server
var port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening at http://localhost:3000'));
