/* js/mail.js, part of the poŝto suite.
 *
 * Copyright (c) Paul Tagliamonte <tag@pault.ag>, 2012 under the terms and
 * conditions of the Expat license, a copy of which you should have recieved
 * with this application. */

var socket;

socket = io.connect('http://localhost');

socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
