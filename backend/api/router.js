const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const validator = require("email-syntax-validator");
const md5 = require('md5');
require('dotenv').config();

const User = require('./models/user');
const Post = require('./models/post');

const router = express.Router();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Returns distance between (lat1, lon1) and (lat2, lon2) in kms
function distance(lat1, lon1, lat2, lon2)
{
    let p = Math.PI/180;
    let a = 0.5 - Math.cos((lat2-lat1)*p)/2 + Math.cos(lat1*p) * Math.cos(lat2*p) * (1-Math.cos((lon2-lon1)*p))/2;
    return 12742 * Math.asin(Math.sqrt(a));
}

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'api.html'));
});


router.post('/create-user', (req, res) => {
    if ('name' in req.body && 'email' in req.body && 'password' in req.body)
    {
        if (req.body.name.trim() === '')
        {
            console.log('/create-user', { error: "Please enter a valid username" });
            res.status(401).json({
                error: "Please enter a valid username"
            });
        }
        else if (req.body.email.trim() === '' || !validator.validate(req.body.email.trim()))
        {
            console.log('/create-user', { error: "Please enter a valid email" });
            res.status(401).json({
                error: "Please enter a valid email"
            });
        }
        else if (req.body.password === '')
        {
            console.log('/create-user', { error: "Please enter a password" });
            res.status(401).json({
                error: "Please enter a password"
            });
        }
        else
        {
            let user = new User({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name.trim(),
                email: req.body.email.trim(),
                password: req.body.password,
                avatar: `https://www.gravatar.com/avatar/${md5(req.body.email.trim())}`
            });

            user.save()
            .then(result => {
                console.log('/create-user', { message: "User added sucessfully" });
                res.status(200).json({
                    message: "User added sucessfully"
                });
            })
            .catch(err => {
                console.log('/create-user', { error: err });
                res.status(401).json({
                    error: err
                });
            });
        }
    }
    else
    {
        console.log('/create-user', {  error: "Body should contain name, email and password!" });
        res.status(401).json({
            error: "Body should contain name, email and password!"
        });
    }
});

router.post('/login-user', (req, res) => {
    if ('email' in req.body && 'password' in req.body)
    {
        if (req.body.email.trim() === '' || !validator.validate(req.body.email.trim()))
        {
            console.log('/login-user', {  error: "Please enter a valid email" });
            res.status(401).json({
                error: "Please enter a valid email"
            });
        }
        else if (req.body.password === '')
        {
            console.log('/login-user', {  error: "Please enter a password" });
            res.status(401).json({
                error: "Please enter a password"
            });
        }
        else
        {
            User.find().where({ email: req.body.email.trim() }).exec()
            .then(result => {
                if (result.length === 0)
                {
                    console.log('/login-user', {  error: "Account with this email doesn't exist. Please sign up first" });
                    res.status(401).json({
                        error: "Account with this email doesn't exist. Please sign up first"
                    });
                }
                else
                {
                    if (result[0].password === req.body.password)
                    {
                        res.status(200).json({
                            userID: result[0]._id,
                            name: result[0].name,
                            email: result[0].email,
                            password: result[0].password,
                            avatar: result[0].avatar
                        });
                    }
                    else
                    {
                        console.log('/login-user', { error: "Incorrect password" });
                        res.status(401).json({
                            error: "Incorrect password"
                        });
                    }
                }
            })
            .catch(err => {
                console.log('/login-user', { error: err });
                res.status(401).json({
                    error: err
                });
            });
        }
    }
    else
    {
        console.log('/login-user', { error: "Body should contain email and password!" });
        res.status(401).json({
            error: "Body should contain email and password!"
        });
    }
});
