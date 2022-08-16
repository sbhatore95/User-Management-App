const express = require('express');
const path = require('path');
const app = express();
const db = require('./models');
// const cookieParser = require('cookie-parser');
const sessions = require('express-session');    

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Routers
// const userManagementRouter = require('./routes/user_management')
// app.use('/user_management', (req, res) => {
//     res.send("Hello World!");
// });

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

// // cookie parser middleware
// app.use(cookieParser());

// For css
app.use(express.static("public"));

// app.use('/', require('./routes/index'));

app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data

var session;

db.sequelize.sync().then(async () => {
    var users = await db.User.findAll();
    
    app.get('/', function (req, res) {
        session = req.session;
        if(session.email)
            res.redirect('/user_management');
        else {
            // Rendering our web page i.e. user_management.ejs
            // and passing users variable through it
            res.render('login', {
                stat: 'getRequest'
            });
        }
    });

    app.post('/register', async (req, res) => {
        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.password;
        var duplEmail = false;
        var pageNumber = req.body.pageNumber;
        var success = false;
        for(var i=0;i<users.length;i++) {
            if(email == users[i].email) {
                duplEmail = true;
                break;
            }
        }
        if(!duplEmail) {
            const new_user = await db.User.create({username: username, email: email, password: password});
            users = await db.User.findAll();
            success = true;
        }
        if(pageNumber == '1') {
            res.json({
                status: success
            });
        }
        else {
            res.json({
                users: users,
                status: success
            });
        }
    });

    app.post('/login', async (req, res) => {
        var message = "Email or Password is incorrect. Please try again.";
        for(var i=0;i<users.length;i++) {
            if(req.body.email == users[i].email) {
                const currentTime = new Date().getTime();
                if(currentTime - users[i].lastLockOut < oneDay) {
                    message = "You have been locked out. Try again later!";
                }
                else if(req.body.password != users[i].password) {
                    var noConsFailed = users[i].noConsFailed + 1;
                    if(noConsFailed <= 5) {
                        await db.User.update({ noConsFailed: noConsFailed }, {
                            where: {
                                email: users[i].email
                            }
                        });
                    }
                    if(noConsFailed >= 5) {
                        await db.User.update({ lastLockOut: new Date().getTime() }, {
                            where: {
                                email: users[i].email
                            }
                        });
                    }
                    if(noConsFailed < 5)
                        message = "Passwords don't match. You have " + (5 - noConsFailed).toString() + " more attempts remaining";
                    else {
                        message = "Sorry, you have been locked out for 24 hours."
                    }
                    users = await db.User.findAll();
                }
                else{
                    await db.User.update({ noConsFailed: 0 }, {
                        where: {
                            email: users[i].email
                        }
                    });
                    users = await db.User.findAll();
                    session = req.session;
                    session.email = req.body.email;
                    message = null;
                }
                break;
            }
        }
        res.json({
            message: message
        });
    });

    app.get('/logout',async (req,res) => {
        users = await db.User.findAll();
        req.session.destroy();
        res.render('login');
    });

    app.get('/user_management', async function (req, res) {
        users = await db.User.findAll();
        if(session && session.email) {
            res.render('user_management', {
                users: users, 
                session: session
            });
        }
        else {
            res.redirect('/');
        }
    });

    app.put('/user_management', async (req, res) => {
        console.log(req);
        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.password;
        await db.User.update({ username: username, password: password }, {
            where: {
                email: email
            }
        });
        users = await db.User.findAll();    

        res.render('user_management', {
            users: users
        });
    });

    app.delete('/user_management', async (req, res) => {
        var email = req.body.email;
        await db.User.destroy({
            where: {
            email: email
            }
        });
        users = await db.User.findAll();

        res.render('user_management', {
            users: users
        });
    });

    app.listen(3001, () => {
        console.log("Server running on port 3001")
    });
});