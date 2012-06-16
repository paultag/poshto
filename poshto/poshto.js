/* poshto.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var        util = require("util"),
         events = require("events"),
 ImapConnection = require('imap').ImapConnection;

/**
 * handle issuing the callback given args, the success payload
 * and the error payload. This will let us transparently call
 * the failure payload if failure is set, so we don't have to
 * catch anything.
 */
function do_callback(args, err, payload) {
  if ( args.failure && err ) {
    return args.failure(err);
  }
  if ( args.success && payload ) {
    return args.success(payload);
  }
}

/**
 * Clean up the message id, given a single ID. We'll strip out the
 * leading ">" or trailing ">", as well as anything else we might need
 * to do to it.
 */
function clean_message_id(message_id) {
  if ( message_id.charAt(0) == "<" &&
       message_id.charAt(message_id.length - 1) == ">"
 ) {
    message_id = message_id.substr(1, message_id.length - 2);
 }
  return message_id;
}

/**
 * Clean all the message IDs in the headers -- for now we just take
 * the first header and set it to the message-id of the whole mail.
 * This behavior may change later.
 */
function clean_message_ids(headers) {
  headers.headers['message-id'] = clean_message_id(
      headers.headers['message-id'][0]);
  return headers;
}

/**
 * "constructor"
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
  this.imap.poshto = this;
  this.imap.on("mail", this._imap_mail);
}


// Inherit event api
util.inherits( Poshto, events.EventEmitter );

/**
 * Connect to the server.
 */
Poshto.prototype.connect = function(args) {
  this.imap.connect(function(err) {
    do_callback(args, err, undefined);
  });
}

/**
 * Scan the current folder for any new messages, and emit what
 * we find.
 */
Poshto.prototype._refresh = function(args) {
  var folder = args.folder;
  this.imap.search(["ALL"], function(err, messages) {
    if ( err ) {
      return do_callback(args, err, undefined);
    }
    this.mailbox[folder].mails = messages;
    this.emit("open", this.mailbox[folder]);
    return do_callback(args, err, this.mailbox[folder]);
  }.bind(this));
}

/**
 * Open a new folder & search for all mails.
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
    this.cur_folder = folder;
    this._refresh(args);
  }.bind(this));
}

/**
 * Gobble up the headers and dump to the drive.
 */
Poshto.prototype.headers = function(args) {
  var folder = args.folder,
         ids = args.ids,
       fetch = this.imap.fetch(ids, { "request": { "headers": true }}),
    response = {
      "folder": folder,
      "msgs": []
    };

  fetch.on("message", function(msg) {
    msg.on('end', function() {
      msg = clean_message_ids(msg);
      response.msgs.push(msg);
      this.emit("message", {
        "msg": msg,
        "folder": folder
      });
    }.bind(this));
  }.bind(this));

  fetch.on("end", function() {
    do_callback(args, undefined, response);
  }.bind(this));
}

/**
 * IMAP New mail callback
 */
Poshto.prototype._imap_mail = function(mails) {
  this.poshto._refresh({
    "folder": this.poshto.cur_folder
  });
}

module.exports.Poshto = Poshto;

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
