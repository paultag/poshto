/* poshto.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

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
    'host':     settings.host,
    'password': settings.password,
    'port':     settings.port,
    'secure':   settings.secure,
    'username': settings.username
  });
  /* IMAP Callbacks */
  this.imap.on("mail", function(numnew) {
    this._handle_imap_mail(numnew);
  }.bind(this));
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
 * This will return all the folders IMAP knows about.
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
  var msgbase = parseInt(this.imap._state.box._uidnext),
      total = [];
  numnew = parseInt(numnew);

  for ( i = msgbase; i < (msgbase + numnew); ++i ) {
    total.push(i);
  }

  /* Fetch headers, emit new mail for each message. */
}

exports.Poshto = Poshto;

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
