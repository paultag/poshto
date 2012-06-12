/* poshto.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var        util = require("util"),
         events = require("events"),
 ImapConnection = require('imap').ImapConnection;

function do_callback(args, err, payload) {
  if ( args.failure && err ) {
    return args.failure(err);
  }
  if ( args.success ) {
    return args.success(payload);
  }
}

/**
 * Base constructor.
 */
function Poshto( settings ) {
  if ( !( this instanceof Poshto ) ) {
    return new Poshto( settings );
  }
  this.settings = settings;
  this.mailbox = {}
  this.imap = new ImapConnection({
    'host': settings.host,
    'password': settings.password,
    'port': settings.port,
    'secure': settings.secure,
    'username': settings.username
  });
}


// Inherit event api
util.inherits( Poshto, events.EventEmitter );

/**
 *
 */
Poshto.prototype.connect = function(args) {
  this.imap.connect(function(err) {
    do_callback(args, err, undefined);
  });
}

/**
 *
 */
Poshto.prototype.open = function(args) {
  var folder = args.folder;
  this.imap.openBox(folder, false, function(err, box) {
    if ( err ) {
      return do_callback(args, err, undefined);
    }
    this.mailbox[folder] = {
      "name": folder,
      "box": box,
      "validity": this.imap._state.box.validity
    }
    this.imap.search(["ALL"], function(err, messages) {
      if ( err ) {
        return do_callback(args, err, undefined);
      }
      this.mailbox[folder].mails = messages;
      do_callback(args, err, this.mailbox[folder]);
    }.bind(this));
  }.bind(this));
}

module.exports.Poshto = Poshto;

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
