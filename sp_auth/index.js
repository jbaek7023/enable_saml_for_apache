var express = require("express");
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var saml = require('passport-saml');
var httpProxy = require('http-proxy');
var fs = require('fs');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
var proxy = require('http-proxy-middleware');
var app = express();
var apiProxy = httpProxy.createProxyServer();
// ServiceProvider will be the load balancer.
var serviceProvider = 'http://localhost:8080';

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
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
    validateInResponseTo: false,
    disableRequestedAuthnContext: true
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
    passport.authenticate('samlStrategy'),
    function(req, res) {
        apiProxy.web(req, res, {target: serviceProvider})
    }
);

// Ensure Authentication Here!
app.get('/source*', function(req, res, next) {
    // req.originalUrl = req.session.returnTo
    // var redirectUrl = req.headers.referer || req.originalUrl || req.url;
    passport.authenticate('samlStrategy', {
        additionalParams: { RelayState: req.url},
        failureRedirect: '/loginFailed'
    })(req, res, next);
});

app.post('/login/callback',
    function (req, res, next) {
        console.log('hit the callback');
        if(req.params.RelayState) {
            // apiProxy.web(req, res, {target: serviceProvider}) =>/login/callback.
        }
        // passport.authenticate('samlStrategy')(req, res, next);
    },
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
