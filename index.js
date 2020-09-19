// * EXPRESS APP
const express = require('express');
const app = express();
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
var fileUpload = require('express-fileupload');

// * VIEW ENGINE
app.set('view engine', 'ejs');

// * EXPRESS SESSIONS
const session = require('express-session')
app.use(session({
    secret: "very super secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge:1000*60*60*24*30,
        httpOnly: true
    }
}))

// * COOKIES
const cookieparser = require("cookie-parser")
app.use(cookieparser())

// * BODY PARSER - URL ENCODER
const bodyparser = require("body-parser")
const urlencoder = bodyparser.urlencoded({
    extended: false
})

// * MONGODB - MONGOOSE
const mongoose = require('mongoose');
const userModel = require('./models/user');
const recipeModel = require('./models/recipe');
const ingredientModel = require('./models/ingredient');

const name = 'Aryan Arora'
const recipes = [
    {
        rec_name: 'Chicken Tacos', 
        rec_tags: ['2HRS', 'PROTEIN'],
        rec_img: 'https://www.cook2eatwell.com/wp-content/uploads/2019/02/Shredded-Chicken-Tacos-Image-2.jpg'
    },
    {
        rec_name: 'Japanse Curry', 
        rec_tags: ['1HRS', 'CARBS'], 
        rec_img: 'https://www.justonecookbook.com/wp-content/uploads/2020/03/Japanese-Chicken-Curry-2417-I.jpg'
    },
    {
        rec_name: 'Shrimp Pasta',
        rec_tags: ['3HRS', 'SEAFOOD', 'PASTA'],
        rec_img: 'https://carlsbadcravings.com/wp-content/uploads/2020/01/Cajun-Shrimp-Pasta-v6.jpg'
    }
]

const ingredients = [
    {ing_name: 'Salt', ing_stock: false},
    {ing_name: 'Chicken', ing_stock: true},
    {ing_name: 'Tortilla', ing_stock: true}
]


app.listen(3000, () => {
    console.log("Listening to port 3000...");
})

app.get('/', (req, res) => {
    if(req.session.loggedIn == true){
        res.render('app', {name: req.session.userEmail, recipes, ingredients})
    } else {
        res.render('index')
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/login', urlencoder, function (req, res){
    var user_email = req.body.user_email;
    var user_password = req.body.user_password;
    
    if(user_email && user_password){
        req.session.username = user_email;
        req.session.loggedIn = true;
        res.redirect('/')
    }
})

app.post('/register', urlencoder, function (req, res){

    var newUser = new userModel({
        userEmail: req.body.email,
        userPassword: req.body.password,
    })

    // if(userEmail && userPassword){
    //     req.session.userEmail = userEmail;
    //     req.session.loggedIn = true;
    //     res.redirect('/')
    // } else {
    //     console.log("INCOMPLETE DETIALS")
    //     res.redirect('/register')
    // }

    userModel.findOne({userEmail: newUser.userEmail}, function (err1, userQuery){
        if (err1) {
			console.log(err1.errors);
	    	result = { success: false, message: "ERR: DB validation" }
	    	res.send(result);
		}
		if (userQuery){
			console.log('ERR: User found');
			result = { success: false, message: "User already exists! Please sign in!" }
	    	res.send(result);
		} else{
			newUser.save(function(err2, user) {
				if (err2) {
					console.log(err2.errors);
	    			result = { success: false, message: "User was not registered!" }
	    			res.send(result);
				} else {
                    console.log("Successfully registered user!");
	    			console.log(user);
	    			result = { success: true, message: "User has succesfully registered!" }
	    			res.send(result);
				}
			});
		}
    });
});

app.get('/app', (req, res) => {
    res.render('app', {name, recipes, ingredients})
})

app.use((req, res) => {
    res.status(404).render('404');
})