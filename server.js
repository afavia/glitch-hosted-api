// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const crypto = require('crypto');
const { execSync } = require('child_process');

app.post('/git', (req, res) => {
  const hmac = crypto.createHmac('sha1', process.env.SECRET);
  const sig = 'sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  if (req.headers['x-github-event'] === 'push' &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(req.headers['x-hub-signature']))) {
    res.sendStatus(200);
    const commands = ['git fetch origin master',
                      'git reset --hard origin/master',
                      'git pull origin master --force',
                      'npm install',
                      // your build commands here
                      'refresh']; // fixes glitch ui
    for (const cmd of commands) {
      console.log(execSync(cmd).toString());
    }
    console.log('updated with origin/master!');
    return;
  } else {
    console.log('webhook signature incorrect!');
    return res.sendStatus(403);
  }
});
// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
