const http = require('http');
const Imap = require('imap');
var parsedJSON = require('./config.json'); // fichier de conf contenant info de connexion à la boite mail
var whiteList = require('./whiteListe.json'); // fichier de conf contenant info de connexion à la boite mail

const imap = new Imap(parsedJSON);
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    let rep = JSON.stringify(messages);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.end(rep);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
}

let messages = [];

function getMessages() {
    messages = [];
    imap.once('ready', function() {
        openInbox(function(err, box) {
            if (err) throw err;
            var f = imap.seq.fetch(box.messages.total - 4 + ':*', {
                bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                struct: true
            });
            f.on('message', function(msg, seqno) {
                var prefix = '(#' + seqno + ') ';
                msg.on('body', function(stream, info) {
                    var buffer = '';
                    stream.on('data', function(chunk) {
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', function() {
                        messages.push(Imap.parseHeader(buffer));
                    });
                });
                msg.once('attributes', function(attrs) {
                });
                msg.once('end', function() {
                });
            });
            f.once('end', function() {
                imap.end();
            });
        });
    });
    imap.once('error', function(err) {
        console.log(err);
    });
    imap.once('end', function() {
    });
    imap.connect();

    addWhiteList();
}

function addWhiteList() {
    messages.push(whiteList)
}

getMessages();
setInterval(function(){ getMessages(); }, 5000 ); //1000 * 60 * 5