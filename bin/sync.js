#!/usr/bin/env nodejs

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

/* poshto.imap.debug = function(args) {
  console.log(args);
}; */

function get_folder_folder(folder) {
  return cache + "folders/" + folder.name + "/" + folder.validity;
}

function get_folder_class(idno) {
  var id = parseInt(idno),
    sort = 1000,
     ret = Math.floor(id / sort);
  return ret;
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

console.log("Attempting to log in...");
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
      "folder": "[Gmail]/All Mail"
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
          idn = root + "/" +
                get_folder_class(payload.msg.id) + "/" +
                payload.msg.id,
      headers = get_mid_path(message['message-id']);

  mkdirp.sync(headers);
  mkdirp.sync(root + "/" + get_folder_class(payload.msg.id));

  headers += message['message-id'].replace(/\//g, "-");

  try {
    fs.writeFileSync(headers, JSON.stringify(message));
  } catch ( err ) {
    if ( err ) {
      console.log("Error (headers): " + err);
    }
  }

  fs.symlink(headers, idn, function(err) {
    if ( err ) {
      console.log("Error (link): " + err);
      return;
    }
    console.log("Wrote out " + headers);
  });
});

function cleanup(args) {
  var to_delete,
      to_create,
      folder_path = args.folder_path,
      mails = args.mails,
      exists,
      fldrs;

  exists = new sets.Set([]);
  fldrs = fs.readdirSync(folder_path);

  console.log("Update check running.");

  for ( i in fldrs ) {
    var tmp = fs.readdirSync(folder_path + "/" + fldrs[i]);
    for ( x in tmp ) {
      exists.add(tmp[x]);
    }
  }

  to_delete = (exists.difference(mails).array());
  to_create = (mails.difference(exists).array());

  for ( i in to_delete ) {
    var file_id = to_delete[i],
           file = folder_path + "/" + get_folder_class(parseInt(file_id)) +
                  "/" + file_id;
    console.log("Removed: " + file);
    fs.unlink(file);
  }

  console.log("Update check complete.");

  return {
    "to_create": to_create,
    "to_delete": to_delete
  };
}

poshto.on("open", function(folder) {
  var folder_path = get_folder_folder(folder),
            mails = new sets.Set(folder.mails),
           curptr = folder_path + "/../current",
        to_delete,
        to_create,
           exists,
              cle;

  mkdirp.sync(folder_path);  /* Ensure we have a directory to link in. */
  cur_stat = fs.stat(curptr, function(err, stat) {
    if ( err == undefined ) {
      fs.unlinkSync(curptr);
    }
    fs.symlinkSync(folder_path, curptr);
  });

  cle = cleanup({
    "folder_path": folder_path,
    "mails": mails
  });
  to_create = cle.to_create;
  to_delete = cle.to_delete;

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

poshto.on("delete", function(folder) {
  console.log("Something's gone. ");

  var folder_path = get_folder_folder(folder),
            mails = new sets.Set(folder.mails);

  cleanup({
    "folder_path": folder_path,
    "mails": mails
  });
});

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
