const prerender = require('prerender');
// const server = prerender();
var server = prerender({
    chromeLocation: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
});
server.start();