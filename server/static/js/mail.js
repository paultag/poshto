/* js/mail.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var socket,
    email;

socket = io.connect('http://localhost');
// socket.on('event', function(payload){});

socket.on('connect', function() {
  /* We should set up and start playing */
  console.log("Connected");
  socket.emit('open', 'INBOX');
});

socket.on('update', function(e) {
  /* OK. Let's get the initial state. */
  email = e;
  console.log("update mailbox " + e);
});

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
