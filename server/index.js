const Pusher = require("pusher");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require("crypto");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
  res.send(auth);
});

// direct all other requests to the built app view
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/hiu-decrypto/index.html'));
});

// start server
var port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening at http://localhost:3000'));
