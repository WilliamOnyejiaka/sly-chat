import passport from "passport";
import Strategy from "passport-google-oauth2";
import {env} from ".";

const clientID = env('')!;
const clientSecret = env('')!;
const callbackURL = env('')!;

passport.serializeUser((user, done) => {
    done(null, user);
})
passport.deserializeUser(function (user: any, done) {
    done(null, user);
});

passport.use(new Strategy.Strategy({
    clientID: "YOUR ID", // Your Credentials here.
    clientSecret: "YOUR SECRET", // Your Credentials here.
    callbackURL: "http://localhost:4000/auth/callback",
    passReqToCallback: true
},
    function (request: any, accessToken: any, refreshToken: any, profile: any, done: any) {
        return done(null, profile);
    }
));

// const express = require('express');
// const app = express();
// const passport = require('passport');
// const cookieSession = require('cookie-session');
// require('./passport');

// app.use(cookieSession({
//     name: 'google-auth-session',
//     keys: ['key1', 'key2']
// }));
// app.use(passport.initialize());
// app.use(passport.session());


// app.get('/', (req, res) => {
//     res.send("<button><a href='/auth'>Login With Google</a></button>")
// });

// // Auth 
// app.get('/auth', passport.authenticate('google', {
//     scope:
//         ['email', 'profile']
// }));

// // Auth Callback
// app.get('/auth/callback',
//     passport.authenticate('google', {
//         successRedirect: '/auth/callback/success',
//         failureRedirect: '/auth/callback/failure'
//     }));

// // Success 
// app.get('/auth/callback/success', (req, res) => {
//     if (!req.user)
//         res.redirect('/auth/callback/failure');
//     res.send("Welcome " + req.user.email);
// });

// // failure
// app.get('/auth/callback/failure', (req, res) => {
//     res.send("Error");
// })

// app.listen(4000, () => {
//     console.log("Server Running on port 4000");
// });