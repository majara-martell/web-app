/*********************************************************************************
WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: Matias Alejandro Jara Martell
Student ID: 151838232
Date: 2025 02 27
Cyclic Web App URL: web322-app-nine-chi.vercel.app
GitHub Repository URL: https://github.com/majara-martell_seneca/web322-app.git
********************************************************************************/
const express = require("express");
const app = express();
const path = require('path');
const sv = require("./store-service.js"); 

//Cloudinary: more libraries
const multer = require("multer"); 
const cloudinary = require('cloudinary').v2; 
const streamifier = require('streamifier');

//connect
const PORT = process.env.PORT || 8080;

//cloudinary
cloudinary.config({
    cloud_name: 'dsgvp1n1e',
    api_key: '686291281155398',
    api_secret: 'hSAgsfuFcxNI0C3dxiAlp0eFLnA',
    secure: true
});

const upload = multer(); 

app.post('/items/add', upload.single("featureImage"),(req,res) => {
    if(req.file){ 
        let streamUpload = (req) => { 
            return new Promise((resolve, reject) => { 
                let stream = cloudinary.uploader.upload_stream( 
                    (error, result) => { 
                        if (result) { 
                            resolve(result); 
                        } else { 
                            reject(error); 
                        } 
                    } 
                ); 
     
                streamifier.createReadStream(req.file.buffer).pipe(stream); 
            }); 
        }; 
     
        async function upload(req) { 
            let result = await streamUpload(req); 
            console.log(result); 
            return result; 
        } 
     
        upload(req).then((uploaded)=>{ 
            processItem(uploaded.url); 
        }); 
    }else{ 
        processItem(""); 
    } 

    function processItem(imageUrl){ 
        req.body.featureImage = imageUrl; 
    
        // TODO: Process the req.body and add it as a new Item before redirecting to /items 
        let newItem = {
            title: req.body.title,
            body: req.body.body,
            price: req.body.price,
            featureImage: req.body.featureImage, 
            category: req.body.category,
            published: req.body.published
        };
    
        sv.addItem(newItem)
            .then(() => res.redirect("/items"))
            .catch((err) => res.status(500).json({ message : err }));
        
    } 
});

app.use(express.static('public'));//makes the public folder publicly accessible 

app.get('/', (req, res) => { 
    res.sendFile(path.join(__dirname, 'views', 'about.html')); 
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get("/shop", (req, res) => {
    sv.getPublishedItems()  
        .then((data) => res.json(data)) 
        .catch((err) => res.status(404).json({ message: err })); 
});

app.get("/items", (req, res) => {
    if(req.query.category){// query = ? | if i see: /items?category=value | ? represents query 
        sv.getItemsByCategory(req.query.category)
            .then((data) => res.json(data)) 
            .catch((err) => res.status(404).json({ message: err })); 
    } else if(req.query.minDate) { 
        sv.getItemsByMinDate(req.query.minDate)
            .then((data) => res.json(data))
            .catch((err) => res.status(404).json({message : err}));
    } else {
        sv.getAllItems()
            .then((data) => res.json(data)) 
            .catch((err) => res.status(404).json({ message: err })); 
    }
});

app.get("/item/:value", (req, res) => { //this is route paramteter
    const itemId = req.params.value; 
    const item = sv.getItemById(itemId); 
    res.json(item);
});


app.get("/categories", (req, res) => {
    sv.getCategories()
        .then((data) => res.json(data)) 
        .catch((err) => res.status(404).json({ message: err })); 
});

app.get('/items/add', (req,res) => {
    res.sendFile(path.join(__dirname, 'views','addItem.html'));
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

sv.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);  
        });
    })
    .catch((err) => {
        console.error(`ERROR: Failed to start server: ${err}`);
});
