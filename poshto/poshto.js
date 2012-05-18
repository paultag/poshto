/* poshto.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application.
 */

var        util = require('util'),
         events = require('events'),
 ImapConnection = require('imap').ImapConnection,
         Poshto;

/**
 * Base Poshto Constructor.
 */
Poshto = function( settings ) {
  if ( ! ( this instanceof Poshto ) ) {
    return new Poshto( settings );
  }
  this.mailbox = {}
  /* Alright. Let's rock. */
  this.imap = new ImapConnection({
    'host': settings.host,
    'password': settings.password,
    'port': settings.port,
    'secure': settings.secure,
    'username': settings.username
  });
  /* IMAP Callbacks */
  this.imap.on("mail", this._handle_imap_mail);
}

/* We'll set up the inherit from events */
util.inherits( Poshto, events.EventEmitter );

/**
 * This will set up and connect to a remote server.
 */
Poshto.prototype.establish = function(callback) {
  this.imap.connect(function(err) {
    if ( err && callback ) {
      return callback(err);
    }

    this.emit("connection");
    if ( callback ) {
      callback();
    }
  }.bind(this));
}

/**
 * This will connect to a MailBox.
 */
Poshto.prototype.open_folder = function( folder, callback ) {
  this.imap.openBox(folder, false, function(err, box) {
    if ( err && callback ) {
      return callback(err);
    }
    this._folder = folder;
    this.mailbox[folder] = {
      "name": folder,
      "box":  box,
      "validity": this.imap._state.box.validity
    }
    this.imap.search(["ALL"], function(err, messages) {
      if ( err && callback ) {
        return callback(err);
      }
      this.mailbox[folder].mails = messages;
      this.emit("folder-opened", folder, box);
      if ( callback ) {
        callback();
      }
    }.bind(this));
  }.bind(this))
}

/**
 * This will fetch a mail's header
 */
Poshto.prototype.get_headers = function(messages, callback) {
  var fetch = this.imap.fetch(
        messages,
        {
          request: {
            headers: true
          }
        }
      ),
      msgs = {};
  fetch.on('message', function(msg) {
    msg.on('end', function() {
      msgs[msg.id] = msg;
      this.emit("downloaded-headers", msg.id, msg);
      if ( callback ) {
        callback(undefined, msgs);
      }
    });
  });
  fetch.on('end', function() {
    this.emit("downloaded-all-headers", messages);
  });
}

/**
 * Close out the everything
 */
Poshto.prototype.close = function(callback) {
  this.imap.logout(function(err) {
    if ( err && callback ) {
      return callback(err);
    }
    // this.imap.close();
    console.log("Closed out. Nice.");
    this.emit("logout");
    if ( callback ) {
      callback(undefined);
    }
  });
}

/**
 *
 */
Poshto.prototype.get_folders = function(callback) {
  this.imap.getBoxes(function(err, boxen) {
    var boxes = []
    for ( i in boxen ) {
      boxes.push(i);
    }
    callback(err, boxes);
  }.bind(this));
}

/*   Callbacks, etc.   */

/**
 * IMAP New mail notification
 */
Poshto.prototype._handle_imap_mail = function(numnew) {
  /* numnew is the number of *new* mails in the current box. */
  // this.emit("mail", newmails); /* Basically, pass through */
}

exports.Poshto = Poshto;

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
