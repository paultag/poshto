/* sync.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var Poshto = require("poshto").Poshto,
  dotcache = process.env.HOME + "/.poshto",
   account = process.argv[2],
    config = dotcache + "/conf/" + account + ".json",
        fs = require("fs"),
  settings = JSON.parse(fs.readFileSync(config)),
      port = ( settings.webserver_port ) ? settings.webserver_port : 3000,
    poshto = Poshto(settings);

poshto.connect({
  "success": function() {
    console.log("Connected. Opening inbox");
    poshto.open({
      "success": function(folder) {
        console.log("Folder opened: " + folder.name);
      },
      "failure": function(err) {
        console.log("Error opening folder: " + err)
      },
      "folder": "INBOX"
    });
  },
  "failure": function(err) {
    console.log("Error connecting: " + err);
  }
})

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
