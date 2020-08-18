var sofiaConversation = require('./main.js');

var backendURL
var callback
var messages
var msg

if (backendURL && messages) {
	sofiaConversation.ensofiaDialog(backendURL, msg, callback);
	sofiaConversation.openMicWatson();
	sofiaConversation.stopRecording(backendURL);
}
else {
	console.log('Usage: ensofiaDialog {backendURL}');
}