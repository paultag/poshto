/* poshto.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var        util = require("util"),
         events = require("events"),
 ImapConnection = require('imap').ImapConnection;


/**
 * Base constructor.
 */
function Poshto( settings ) {
  if ( !( this instanceof Poshto ) ) {
    return new Poshto( settings );
  }
  this.settings = settings
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

Poshto.prototype.connect = function() {

}

module.exports.Poshto = Poshto;

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
