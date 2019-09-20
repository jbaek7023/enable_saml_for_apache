var express = require("express");
var session = require('express-session');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var saml = require('passport-saml');
var http = require('http');
var httpProxy = require('http-proxy');
var fs = require('fs');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
var proxy = require('http-proxy-middleware');
var app = express();
var apiProxy = httpProxy.createProxyServer();
// ServiceProvider will be the load balancer.
var serviceProvider = 'http://localhost:8080';

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

passport.serializeUser(function(user, done) {
    console.log('-----------------------------');
    console.log('serialize user');
    console.log(user);
    console.log('-----------------------------');
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    console.log('-----------------------------');
    console.log('deserialize user');
    console.log(user);
    console.log('-----------------------------');
    done(null, user);
});

//Extra Proxy Done?//
var samlStrategy = new saml.Strategy({
  // config options here
    callbackUrl: 'http://localhost:8446/login/callback',
    entryPoint: 'http://localhost:8380/simplesaml/saml2/idp/SSOService.php',
    issuer: 'urn:opengrok',
    identifierFormat: null,
    decryptionPvk: fs.readFileSync(__dirname + '/certs/key.pem', 'utf8'),
    privateCert: fs.readFileSync(__dirname + '/certs/key.pem', 'utf8'),
    validateInResponseTo: false,
    disableRequestedAuthnContext: true
}, function(profile, done) {
    return done(null, profile);
});

passport.use('samlStrategy', samlStrategy);
app.use(passport.initialize({}));
app.use(passport.session({}));

app.use(session({secret: 'secret',
                 resave: false,
                 saveUninitialized: true,}));

var samlStrategy = new saml.Strategy({
// config options here
    // callbackUrl: 'http://localhost:4300/login/callback', //we don't use this?
    entryPoint: 'http://localhost:8380/simplesaml/saml2/idp/SSOService.php',
    issuer: 'urn:opengrok',
    identifierFormat: null,
    decryptionPvk: fs.readFileSync(__dirname + '/certs/key.pem', 'utf8'),
    privateCert: fs.readFileSync(__dirname + '/certs/key.pem', 'utf8'),
    validateInResponseTo: true,
    disableRequestedAuthnContext: false,
}, function(profile, done) {
    return done(null, profile);
});

passport.use('samlStrategy', samlStrategy);
app.use(passport.initialize({}));
app.use(passport.session({}));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,}
));

app.get('/',
    function(req, res) {
        apiProxy.web(req, res, {target: serviceProvider});
    }
);

app.get('/source*',
    function(req, res, next) {
        req.query.RelayState = req.url;
        console.log('come back to source plz?')
        console.log(req.user)
        if(req.user) {
            console.log('proxy...');
            apiProxy.web(req, res, {target: serviceProvider});
            console.log('req.user');
        } else {
            console.log('authenticating...');
            passport.authenticate('samlStrategy')(req, res, next);
        }
    },
);

app.post('/login/callback',
// Doesn't know the previous UrL
// Update: Got the previous UrL via Session. Can't interrupt SAML session (security)
    function (req, res, next) {
        console.log('-----------------------------');
        console.log('/Start login callback ');
        next();
    },
    passport.authenticate('samlStrategy'),
    function(req, res, next) {
        // Therefore we set the URL here.
        console.log('after login/callback/authentication');
        req.headers['serviceDelivery'] = 'awesome';
        res.redirect(req.body.RelayState);
    }
);

app.get('/metadata',
    function(req, res) {
        res.type('application/xml');
        res.status(200).send(
            samlStrategy.generateServiceProviderMetadata(
                fs.readFileSync(__dirname + '/certs/cert.pem', 'utf8'),
                fs.readFileSync(__dirname + '/certs/cert.pem', 'utf8')
            )
        );
    }
);

var server = app.listen(8446, function () {
    console.log('Listening on port %d', server.address().port)
});
