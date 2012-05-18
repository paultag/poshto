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
  for ( i in e.INBOX.mails ) {
    var id = e.INBOX.mails[i];
    socket.emit("header-request", id);
  }
});

socket.on('mail', function(mail) {
  /* OK. Let's add it to the table */
  var subject, from, date, new_email, headers;
  headers = mail.headers;

  subject = $('<td>'); subject.text(headers.subject[0]);
     from = $('<td>');    from.text(headers.from[0]);
     date = $('<td>');    date.text(headers.date[0]);

  new_email = $("<tr>").append(subject).append(from).append(date);
  new_email.hide();
  $("#emails").prepend(new_email);
  new_email.fadeIn();
});

// vim: tabstop=2 expandtab shiftwidth=2 softtabstop=2
