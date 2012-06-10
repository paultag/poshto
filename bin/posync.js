/* posync.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var Poshto = require("poshto").Poshto,
   maildir = process.env.HOME + "/poshto",
    appdir = process.env.HOME + "/.poshto",
        fs = require("fs"),
  settings,
    poshto;

function get_settings_file(account_name) {
  var file = appdir + "/conf/" + account_name + ".json";
  return file;
}

function get_mailbox_dir(account_name) {
  var file = maildir + "/" + account_name;
  return file;
}

settings = JSON.parse(fs.readFileSync(get_settings_file(process.argv[2])));
poshto = new Poshto(settings);

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
