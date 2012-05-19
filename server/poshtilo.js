/* poshtilo.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var socketio = require('socket.io'),
     express = require("express"),
      Poshto = require("poshto").Poshto,
          fs = require("fs"),
      appdir = process.env.HOME + "/.poshto",
    settings,
      poshto,
        port,
         app,
          io;

function get_settings_file(account_name) {
  var file = appdir + "/conf/" + account_name + ".json";
  return file;
}

settings = JSON.parse(
    fs.readFileSync(get_settings_file(process.argv[2])));

port = settings.webserver_port
if ( ! port ) {
  port = 3000;
}

poshto = new Poshto(settings);
app    = express.createServer();
io     = socketio.listen(app);

app.use("/static", express.static(__dirname + '/static'));
app.get('/', function(req, res){
  res.redirect('/static/index.html');
});

/* OK. Webserver kruft is all set. Let's get to the logic. */

function update(socket) {
  socket.emit('update', poshto.mailbox);
}

io.sockets.on('connection', function(socket) {
  socket.on('open', function(folder) {
    poshto.open_folder(folder, function() {
      update(socket);
    }.bind(this));
  }.bind(this));

  socket.on('headers', function(msgids) {
    console.log("Issuing a request for " + msgids);
    poshto.get_headers(msgids, function(err, msg) {
      console.log("Got headers for " + msg);
      for ( i in msg ) {
        socket.emit('mail', msg[i]);
      }
    }.bind(this));
  }.bind(this));
});

/* Alright. Time to connect. */

console.log("Starting up...");
poshto.establish(function() {
  app.listen(port);
  console.log("Sitting on port " + port);
});

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
