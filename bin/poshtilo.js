/* poshtilo.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var Poshto = require("poshto").Poshto,
    fs = require("fs"),
    settings = JSON.parse(fs.readFileSync(process.argv[2])),
    folder = "INBOX",
    poshto;

poshto = new Poshto(settings);

poshto.on("connection", function(){
  console.log("Connected.");
  this.open_folder(folder);
});

poshto.on("folder-opened", function(name, box) {
  var mails = (poshto.mailbox[folder].mails),
      tmail = mails[0];

  console.log("Opened: " + name);
  console.log("Testing " + tmail);

  this.get_headers(tmail, function(headers){
    console.log(headers[tmail].headers);
    this.close();
  }.bind(this));
});

/* Alright. Time to connect. */
poshto.establish();

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
