/* cache.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var util = require('util'),
  events = require('events'),
  mkdirp = require('mkdirp'),
cachedir = process.env.HOME + "/.poshto/cache";

/**
 * Cache Layout (etc):
 *
 *  cache/
 *    boxen/
 *      INBOX/    (folder)
 *        193848/ (validity)
 *          23    (ID)
 *           +--> Symbolic Link to real header
 *
 *    headers/
 *      a/
 *        b/
 *          c/
 *            abc123@foo.domain.tld.json
 *
 *    content/
 *      a/
 *        b/
 *          c/
 *            abc123@foo.domain.tld/
 *              part1
 *              part2
 *              part2.1
 */

/**
 * Base Constructor.
 */
PoshtoCache = function( settings ) {
  if ( ! ( this instanceof PoshtoCache ) ) {
    return new PoshtoCache( settings );
  }
  this.username = settings.username;
  this.mailbox  = settings.mailbox;
  this.cachedir = cachedir + "/" + this.username;
  mkdirp.sync(this.cachedir);
}

/* We'll set up the inherit from events */
util.inherits( PoshtoCache, events.EventEmitter );

PoshtoCache.prototype.get_header = function(message_id) {
}

exports.PoshtoCache = PoshtoCache;

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
