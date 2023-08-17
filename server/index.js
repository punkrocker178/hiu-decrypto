const Pusher = require("pusher");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require("crypto");

const NUM_PLAYERS = 2;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let state = {
  round: 1,
  players: {},
  playersTurn: [],
  playerGuesses: 0,
  channel: '',
  generatedCode: '',
  numReady: 0
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
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


app.post('/api/start', (req, res) => {
  const players = req.body.members;
  state.round = 1;
  state.players = players;
  state.playersTurn = req.body.playersTurn;
  res.sendStatus(200);
});

app.post('/api/ready', (req, res) => {
  state.numReady++;

  if (state.numReady == NUM_PLAYERS) {
    const codes = generateCode().join('');
    pusher.trigger(state.channel, 'round-started', {
      round: state.round,
      generatedCode: codes
    });
  }
  res.sendStatus(200);
});

app.post('/api/guess', (req, res) => {
  const generatedCode = state.generatedCode
  const playerGuessCode = req.body.playerGuessCode;
  const isPlayerRound = state.playersTurn[state.round - 1] == req.body.playerId;

  if (isPlayerRound && generatedCode != playerGuessCode) {
    state.players[req.body.playerId]['failedToken']++;
  } else if (!isPlayerRound && generatedCode == playerGuessCode) {
    state.players[req.body.playerId]['successToken']++;
  }

  state.playerGuesses++;

  if (state.playerGuesses == 2) {
    state.round += 1;
    pusher.trigger(state.channel, 'round-ended', {
      result: state.players
    });
  }

  res.sendStatus(200);
});

// direct all other requests to the built app view
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/hiu-decrypto/index.html'));
});

// start server
var port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening at http://localhost:3000'));
