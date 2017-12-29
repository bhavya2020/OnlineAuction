const route = require("express").Router();

//Import MongoDB models
const models = require("../models/mongodb/mongo");

//Import multer module
const multer = require('multer');

let Storage = multer.diskStorage({
    destination:  './public_html/Images',
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

//Items default page
route.get("/", (req,res) => {
    res.render("items");
});

//Show all the products
route.get('/all',function (req,res) {
    // console.log("showing products");
    models.Products.find({})
        .then((productlist)=>{
            res.send(productlist)
        })
        .catch((err)=>{
            console.error(err)
        })
});

let upload = multer({ storage: Storage });

//Render Add Item page
route.get("/add", (req,res) => {
    res.render("additem");
});

//Post route to add products to DB
route.post('/add' ,upload.single('imgUploader'),function (req,res) {
    console.log("ADD: ",req.user);
    models.Products.create({
        img: req.file.filename,
        userID: req.user.id,
        name: req.body.productname,
        desc: req.body.desc,
        category: req.body.category,
        basevalue: req.body.basevalue,
        duration: req.body.duration
    })
        .then((item)=>{
            models.Bids.create({
                ProdID: item._id,
                isOpen: true,
                allBids: []
            })
                .then(()=>{
                    res.redirect('/items/add');
                })
                .catch((err)=>{
                    console.log(err);
                })
        })
        .catch((err)=>{
            console.error(err)
        })
});

//Redirect to particular item page to create bid
route.get("/bid/:id",(req,res)=>{
    res.render('createbid',{
        userid:req.params.id
    })
});

//create a bid
route.post("/bid/:id",(req,res)=>{
   console.log(req.params.id);
   models.Bids.findOneAndUpdate(
       {
           ProdID:req.params.id
       },
       {
           $push: {
               allBids: {
                   userID: req.user.id,
                   price: req.body.bidprice,
                   time: new Date()
               }
           }
       }
   )
       .then( (item)=>{
           console.log("Item:",item);
           res.redirect('/bids');
       })
       .catch((err)=>{
           console.log(err);
           res.send({
               message: "error finding item"
           });
       })


});

//Get item details
route.get("/:id", (req,res)=>{
    models.Products.findById(req.params.id,{
        _id: 0
    })
        .then( (item)=>{
            console.log("Item:",item);
            res.send(item);
        })
        .catch((err)=>{
            console.log(err);
            res.send({
                message: "error finding item"
            });
        })
});

module.exports = route;