"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth2_1 = __importDefault(require("passport-google-oauth2"));
const _1 = require(".");
const clientID = (0, _1.env)('');
const clientSecret = (0, _1.env)('');
const callbackURL = (0, _1.env)('');
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser(function (user, done) {
    done(null, user);
});
passport_1.default.use(new passport_google_oauth2_1.default.Strategy({
    clientID: "YOUR ID", // Your Credentials here.
    clientSecret: "YOUR SECRET", // Your Credentials here.
    callbackURL: "http://localhost:4000/auth/callback",
    passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));
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
