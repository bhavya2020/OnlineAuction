/*
    Import Modules
 */
const express = require("express");
const path = require("path");
const http=require("http");
const socketIo=require('socket.io');

/*
    Import User Files
 */
const CONFIG = require("./configs");
const Passport = require("./passport");
const session = require("express-session");
const Users = require("./models/sql/sequelize").Users;
const HELPERS = require("./helpers");
const models = require("./models/mongodb/mongo");

//Initialise Server
const app = express();
const Server=http.Server(app);
const io=socketIo(Server);
/*
    MiddleWares
 */

//Serve Static Files
app.use(express.static(path.join(__dirname,"/public_html")));

//Handle form-data (JSON & UrlEncoded)
app.use(express.json());
app.use(express.urlencoded({
    extended : true
}));


//Set View Engine
app.set("view engine","ejs");

//Handle sessions
app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: "Boli_Lagegi"
}));

//Initialise passport
app.use(Passport.initialize());

//Ensure persistent sessions
app.use(Passport.session());

/*
    Routes
 */

//Items route
app.use("/items", require("./routes/items"));
app.use("/bids", require("./routes/bids"));
app.use('/users', HELPERS.checkLoggedIn ,require("./routes/users"));


/*
    Other Routes
 */

//Render Landing Page
app.get("/",(req,res)=>{
    res.render("index");
});

//Render Login Page
app.get("/login",(req,res)=>{
    console.log("Login: ",req.user);
    res.render("login");
});

//Login Route
app.post("/login",Passport.authenticate('local',{
    successRedirect: "/users",
    failureRedirect: "/login"
}));

//Render SignUp page
app.get("/signup",(req,res)=>{
    res.render("signup");
});

//New User via SignUp route
app.post("/signup",(req,res)=>{
    Users.create({
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        email: req.body.email,
        phone1: req.body.phone1,
        phone2: req.body.phone2
    })
        .then(()=>{
            res.redirect("/login");
        })
        .catch((err)=>{
            console.log(err);
        })
});

//Logout route
app.get("/logout", (req,res)=>{
    console.log("LOGOUT !");
    req.logout();
    res.redirect("/");
});

//404 Handler
app.use(function (req,res) {
    res.send("404 Error !!!")
});

io.on('connection',(socket)=>{
    console.log("socket created "+socket.id);
    socket.on('bid',(data)=>{
        console.log("ProdId: "+data.prodId);
        models.Bids.find({ProdID :data.prodId})
            .then((bids)=>{console.log(bids); socket.emit('bid',{bids:bids})});});

});
//Listen on port
Server.listen(CONFIG.SERVER.PORT,function () {
   console.log(`Server running @ http://${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}`);
});
