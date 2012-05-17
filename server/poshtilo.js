/* poshtilo.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var express = require("express"),
     Poshto = require("poshto").Poshto,
         fs = require("fs"),
     appdir = process.env.HOME + "/.poshto",
   settings,
     poshto,
       port,
        app;

function get_settings_file(account_name) {
  var file = appdir + "/conf/" + account_name + ".json";
  return file;
}

settings = JSON.parse(
    fs.readFileSync(get_settings_file(process.argv[2])));

port     = settings.webserver_port
if ( ! port ) {
  port = 3000;
}

poshto = new Poshto(settings);
app    = express.createServer();

app.use("/static", express.static(__dirname + '/static'));
app.get('/', function(req, res){
  res.redirect('/static/index.html');
});

/**
 * Fetch the headers for a given email
 */
app.get('/headers', function(req, res){
  var mid = req.query['id'];
  poshto.get_headers(mid, function(err, msgs) {
    console.log("Sending headers for " + mid);
    if ( err ) {
      res.send(JSON.stringify({
        "err": err,
        "data": {}
      }));
    } else {
      res.send(JSON.stringify({
        "err": undefined,
        "data": msgs
      }));
    }
  });
});

/**
 *
 */
app.get('/folders', function(req, res){
  poshto.get_folders(function(err, boxen) {
    if ( err ) {
      res.send(JSON.stringify({
        "err": err,
        "data": {}
      }));
    } else {
      res.send(JSON.stringify({
        "err": undefined,
        "data": boxen
      }));
    }
  });
});

/**
 * Mailbox Open Endpoint
 */
app.get('/open', function(req, res){
  var mailbox = req.query['mailbox'];
  /* Check to see if it's already open. */
  if ( poshto._folder == mailbox ) {
    return res.send(JSON.stringify({
      "err": undefined,
      "data": poshto.mailbox[mailbox].mails,
      // "cache": true
    }));
  }
  console.log("Opening: " + mailbox);
  poshto.open_folder(mailbox, function(err) {
    if ( err ) {
      res.send(JSON.stringify({
        "err": err,
        "data": {}
      }));
    } else {
      res.send(JSON.stringify({
        "err": undefined,
        "data": poshto.mailbox[mailbox].mails
      }));
    }
  });
});

/* Alright. Time to connect. */
console.log("Starting up...");
poshto.establish(function() {
  app.listen(port);
  console.log("Sitting on port " + port);
});

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
