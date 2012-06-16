/* sync.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var Poshto = require("poshto").Poshto,
  dotcache = process.env.HOME + "/.poshto",
   account = process.argv[2],
    mkdirp = require("mkdirp"),
    config = dotcache + "/conf/" + account + ".json",
     cache = dotcache + "/mail/" + account + "/",
      sets = require('simplesets'),
        fs = require("fs"),
  settings = JSON.parse(fs.readFileSync(config)),
      port = ( settings.webserver_port ) ? settings.webserver_port : 3000,
    poshto = Poshto(settings);

function get_folder_folder(folder) {
  return cache + "folders/" + folder.name + "/" + folder.validity;
}

function get_mid_hash(message_id) {
  var path = "",
     depth = 4;
  for ( var i = 0; i < depth; ++i ) {
    path += message_id.substr(i, 1) + "/";
  }
  return path;
}

function get_mid_path(message) {
  return cache + "headers/" + get_mid_hash(message);
}

poshto.connect({
  "success": function() {
    console.log("Connected. Opening inbox");
    poshto.open({
      "failure": function(err) {
        console.log("Error opening folder: " + err);
      },
      /* We don't declare a success callback, since we can just use the
       * emited event down below. Then we can just kick off open commands later
       * and not have to re-implement. */
      "folder": "INBOX"
    });
  },
  "failure": function(err) {
    console.log("Error connecting: " + err);
  }
})

poshto.on("message", function(payload) {
  var message = payload.msg.headers,
       folder = payload.folder,
         root = get_folder_folder(folder),
          idn = root + "/" + payload.msg.id;
      headers = get_mid_path(message['message-id']);

  mkdirp(headers);
  headers += message['message-id'];

  fs.writeFile(headers, JSON.stringify(message), function(err) {
    if ( err ) {
      console.log("Error: " + err);
    }
  });

  fs.symlink(headers, idn, function(err) {
    if ( err ) {
      console.log("Error: " + err);
      return;
    }
    console.log("Wrote out " + headers);
  })
});

poshto.on("open", function(folder) {
  var folder_path = get_folder_folder(folder),
            mails = new sets.Set(folder.mails),
           exists,
        to_delete,
           curptr = folder_path + "/../current";

  mkdirp.sync(folder_path);  /* Ensure we have a directory to link in. */
  cur_stat = fs.stat(curptr, function(err, stat) {
    if ( err == undefined ) {
      fs.unlinkSync(curptr);
    }
    fs.symlinkSync(folder_path, curptr);
  });

  exists = new sets.Set(fs.readdirSync(folder_path));

  to_delete = (exists.difference(mails).array());
  to_create = (mails.difference(exists).array());

/*
  console.log("To Delete: " + to_delete);
  console.log("To Create: " + to_create);
 */

  for ( i in to_delete ) {
    var file_id = to_delete[i],
           file = folder_path + "/" + file_id;
    fs.unlink(file);
  }

  if ( to_create.length > 0 ) {
    poshto.headers({
      "folder": folder,
      "ids": to_create,
      "failure": function(err) {
        console.log("Failure to fetch headers: " + err);
      }
    });
  }
});

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
