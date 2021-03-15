const inject = require('.')
const express = require('express')
const serveStatic = require('serve-static')
const ChromeLauncher = require('chrome-launcher')
const path = require('path')

console.log("Starting express server...")

// Setup Express
let app = express()
const expressWs = require('express-ws')(app)

let http_instance
let chrome

app.use(function(req, res, next) {
    res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval' 'unsafe-inline'");
    return next();
});

app.use(serveStatic(path.join(__dirname, 'web/build'), {
    'index': ['index.html']
}))

app.ws('/socket', function(ws, req) {
    ws.on('message', function(msg) {
        const data = JSON.parse(msg)
        switch(data.message) {
            case 'inject':
                inject(data.exe, ws)
                break;
            default:
                console.log(data)
        }
    })
})

// when shutdown signal is received, do graceful shutdown
process.on( 'SIGINT', function(){
    chrome && chrome.kill()
    http_instance && http_instance.close( function(){
        console.log( 'that soon, huh? you\'re a quick one.' );
        process.exit();
    });
});

http_instance = app.listen(3169);
const url = "http://localhost:3169/"

console.log("Sweet. Please visit " + url + " to sync your vibrator.");

ChromeLauncher.launch({
    startingUrl: url
})
    .then(inst => {
        chrome = inst
        console.log("I opened chrome for you.")
    })