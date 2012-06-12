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

console.log(poshto);

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
