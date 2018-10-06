const express = require('express');
const cors = require('cors');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const debug = require('debug')('signora:server');
const {ENV} = require('./config');
// var dotenv = require('dotenv');
// dotenv.load();
// console.log(process.env.DB_HOST);
//var port = normalizePort(process.env.PORT || '4101');
const port = normalizePort(ENV.PORT);
const app = express();
const https = require('https');
//const http = require('http');

const privateKey = fs.readFileSync('./certs/stagingsdei_com.key', 'utf8');
const certificate = fs.readFileSync('./certs/c86aaff33f318ca4.crt', 'utf8');
//var ca = fs.readFileSync('./certs/gd_bundle-g2-g1.crt');
const httpsOptions = {key: privateKey, cert: certificate};

//const server = http.createServer(app);
const server = https.createServer(httpsOptions, app);

const jwt = require('jsonwebtoken');
const encKey = 'shhhhh';
// sign with RSA SHA256
//var cert = fs.readFileSync('private.key');  // get private key
//var token = jwt.sign({ foo: 'bar' }, cert, { algorithm: 'RS256'});

// sign asynchronously
//jwt.sign({ foo: 'bar' }, cert, { algorithm: 'RS256' }, function(err, token) {
//console.log(token);
//});
const transcriptions = require('./routes/transcriptions');
const recommendations = require('./routes/recommendations');
const users = require('./routes/users');
//const patient = require('./routes/patient');
//var app = express();

// Bootstrap models
const models_path = __dirname + '/model';
const walk = function (path) {
    fs.readdirSync(path).forEach(function (file) {
        //console.log(file);
        const newPath = path + '/' + file;
        const stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

mongoose.connect('mongodb://beacon-user:abc123@ds121871.mlab.com:21871/beacon', {useMongoClient: true});
//mongoose.connect(`mongodb://${ENV.DB_USER}:${ENV.DB_PASS}@${ENV.DB_HOST}/${ENV.DB_NAME}`, {useMongoClient: true});

mongoose.Promise = global.Promise;
process.on('unhandledRejection', up = > {
    return up
}
)
;
const Schema = mongoose.Schema;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
//Serves all the request which includes /uploads in the url from Uploads folder
app.use('/uploads', express.static(__dirname + '/uploads'));
app.set('view engine', 'jade');

const corsOptions = {
    // 'origin': 'https://stagingsdei.com',
    'origin': '*',
    'methods': ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTION'],
    'credentials': true,
    'exposedHeaders': ['Cache-Control', 'Content-Encoding', 'Content-Range'],
    'allowedHeaders': ['Content-Type', 'Authorization', 'Range'],
    'preflightContinue': false,
};

app.use(cors(corsOptions));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const callSocket = function (req, res, next) {
    io.sockets.emit("test", "testing");
    next()
};


app.use('/user', users);
app.use('/recommendations', recommendations);
app.use('/transcriptions', callSocket, transcriptions);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});


app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({status: err.status || 500, error: 'Page not found!'});
});

app.set('port', port);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
const io = require('socket.io')(server);

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

const clients = [];
io.sockets.on("connection", function (data) {
    clients.push(data.id);
    const user = require("./controllers/users");
    jwt.verify(data.request._query.token, encKey, function (err, decoded) {
        if (!err) {
            user.update(decoded["_doc"], data.id);
        }
    });
    data.on('disconnect', function () {
        const i = clients.indexOf(data.id);
        clients.splice(i, 1);
    });
});

process.on('watson', function (obj) {
    emitSocket(obj.user, "transcript", obj);
});
process.on('tone', function (arr) {
    emitSocket(arr.user, "tone", arr);
});
process.on('recommendations', function (arr) {
    emitSocket(arr.user, "recommendations", arr);
});
process.on('danger', function (arr) {
    emitSocket(arr.user, "danger", arr);
});
process.on('sentiment', function (arr) {
    emitSocket(arr.user, "sentiment", arr);
});
process.on('transcriptionId', function (arr) {
    emitSocket(arr.user, "transcriptionId", arr);
});

function emitSocket(user, name, obj) {

    let newusr = [];
    for (let i = 0; i < user.length; i++) {
        for (let j = 0; j < clients.length; j++) {
            if (user[i] === clients[j]) {
                newusr.push(clients[j]);
            }
        }
    }
    for (let i = 0; i < newusr.length; i++) {
        io.sockets.connected[newusr[i]].emit(name, obj);
    }
}
