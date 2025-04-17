/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
* assignment has been copied manually or electronically from any other source (including web sites) or
* distributed to other students

Name: Matias Alejandro Jara Martell
Student ID: 151838232
Date: 2025 04 08
Replit Web App URL: https://replit.com/join/aabvhxzlom-majara-martell
GitHub Repository URL: https://github.com/majara-martell/web-app.git
********************************************************************************/
//auth-service
const authData = require("./auth-service");
//client-sessions
const clientSession = require("client-sessions");

const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true })); //for form data

const path = require("path");
const sv = require("./store-service.js"); 


//Cloudinary: more libraries
const multer = require("multer"); 
const cloudinary = require('cloudinary').v2; 
const streamifier = require('streamifier');
const { error } = require("console");

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

//client-sessions
app.use(
    clientSession({
        cookieName: "session",
        secret: "o6LjQ5EVNC28ZgK64hDELM18ScpFQr",
        duration: 2 * 60 * 1000, // 2 minutes
        activeDuration: 1000 * 60, // 1 minute
    })
);

//client-sessions : session middleware
app.use(function(req, res, next) {
    res.locals.session = req.session;//is an object that contains user session data
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      next();
    }
}

app.use(function(req,res,next){    
    //req.path: contains the url path of the current req: sample.com/items/add
    let route = req.path.substring(1);  //req.path: '/items/add' -> 'items/add'
    res.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    res.locals.viewingCategory = req.query.category;
    next();
});


app.locals.navLink = function(url, linkText, activeRoute) {
    return `
        <li class="nav-item">
            <a href="${url}" class="nav-link text-white ${url === activeRoute ? 'active' : ''}">
                ${linkText}
            </a>
        </li>
    `;
};

app.locals.formatDate = function(dateObj){
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
}


app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');


app.use(express.static('public'));//makes the public folder publicly accessible 
app.use(express.static(path.join(__dirname, 'public')));

app.get('/about', (req, res) => {
    //res.sendFile(path.join(__dirname, 'views', 'about.html'));
    res.render('about');//about.ejs
});

async function getShopData(req){
    let viewData = {};
  
    try {
      // declare empty array to hold "item" objects
      let items = [];
      
      // if there's a "category" query, filter the returned items by category
      if (req.query.category) {
        // Obtain the published "item" by category
        items = await sv.getPublishedItemsByCategory(req.query.category);
       
      } else {
        // Obtain the published "items"
        items = await sv.getPublishedItems();
        
      }
      
      // sort the published items by itemDate
      items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
  
      // get the latest item from the front of the list (element 0)
      let item = items[0];
  
      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;

    } catch (err) {
        //console.log('error',err )
      viewData.message = "No Results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await sv.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
    
    
    return viewData;
}

/*|------------------------- Main -------------------------  */
app.get('/', async (req, res) => { 
    //before: res.sendFile(path.join(__dirname, 'views', 'about.html')); 
    let viewData = await getShopData(req);
    res.render('shop', { data: viewData });//it will redirect from / to /shop by calling getShopData function
});

/*|------------------------- Shop -------------------------  */
app.get("/shop", async (req, res) => {
    let viewData = await getShopData(req);
    res.render("shop", { data: viewData });
});
  
app.get('/shop/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
  
    try{
  
        // declare empty array to hold "item" objects
        let items = [];
  
        // if there's a "category" query, filter the returned items by category
        if(req.query.category){
            // Obtain the published "items" by category
            items = await sv.getPublishedItemsByCategory(req.query.category);
        }else{
            // Obtain the published "items"
            items = await sv.getPublishedItems();
        }
  
        // sort the published items by itemDate
        items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));
  
        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.items = items;
  
    }catch(err){
        viewData.message = "no results";
    }
  
    try{
        // Obtain the item by "id"
        viewData.item = await sv.getItemById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
  
    try{
        // Obtain the full list of "categories"
        let categories = await sv.getCategories();
  
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
  
    // render the "shop" view with all of the data (viewData)
    console.log("Final viewData:", viewData);
    res.render("shop", {data: viewData})
});

/*|------------------------- items -------------------------  */
app.get("/items", ensureLogin, (req, res) => {
    const isFiltered = req.query.category || req.query.minDate;

    if(req.query.category){// query = ? | if i see: /items?category=value | ? represents query 
        sv.getItemsByCategory(req.query.category)
            .then((data) => {
                if(data.length > 0){
                    res.render("items", {items: data, message:"", isFiltered: true})
                } else{
                    res.render("items", {message: "No Results", items: [], isFiltered: true});
                }
            })
            .catch((err) => {
                res.render("404", {message: "no results", isFiltered:true})
            })
    } else if(req.query.minDate) { 
        sv.getItemsByMinDate(req.query.minDate)
            .then((data) => {
                if(data.length > 0){
                    res.render("items", {items: data, message:"", isFiltered: true})
                } else{
                    res.render("items", {message: "no results", isFiltered: true});
                }
            })
            .catch((err) => {
                res.render("404", {message: "no results",isFiltered:true})
            })
    } else {
        sv.getAllItems()
            .then((data) => {
                if(data.length > 0){
                    res.render("items", {items: data, message:"", isFiltered: false})
                } else{
                    res.render("items", {message: "no results", isFiltered: false});
                }
            })
            .catch((err) => {
                res.render("404", {message: "no results", isFiltered:true})
                
            })
    }
});
//this is item , cannot be changed to items
app.get("/item/:value", ensureLogin, (req, res) => { //this is route parameter
    const itemId = req.params.value; //:value is a route parameter from /item/123 , req.pa.value = "123"
    const item = sv.getItemById(itemId); 
    res.json(item);
});

app.get('/items/add', ensureLogin,(req,res) => {
    sv.getCategories()
        .then((categories) => {
            res.render('addItem', { categories: categories });
        })
        .catch((err) => {
            res.render('addItem', { categories: [] });
        });
});

app.post('/items/add', upload.single("featureImage"), ensureLogin, (req,res) => {
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
            featureImage: req.body.featureImage, //chck this in storsrvic
            category: req.body.category,
            published: req.body.published
        };
    
        sv.addItem(newItem)
            .then(() => res.redirect("/items"))
            .catch((err) => res.status(500).json({ message : err }));
        
    } 
});

app.get('/items/delete/:id', ensureLogin, (req, res) => {
    sv.deletePostById(parseInt(req.params.id))//str to num
        .then(() => res.redirect('/items'))
        .catch(err => res.status(500).send("Unable to Remove Item / Item not found"));
});

/*|------------------------- Categories -------------------------  */
app.get("/categories", ensureLogin, (req, res) => {
    sv.getCategories()
        .then((category) => {
            if(category.length > 0) {
                res.render('categories',{ categories : category })
            } else{
                res.render('categories',{ categories: []})
            }
        })
        .catch((err) => res.render('404',{ message : "no results" }))
});

//get to show the add category form
app.get('/categories/add', ensureLogin, (req, res) => {
    res.render('addCategory');
});

//post for category creation
app.post('/categories/add', ensureLogin, (req, res) => {  
    sv.addCategory(req.body)
        .then(() => {
            res.redirect('/categories')
        })
        .catch(err => res.status(500).send(err));
});

//delete route for categories
app.get('/categories/delete/:id', (req, res) => {
    sv.deleteCategoryById(parseInt(req.params.id))
        .then(() => res.redirect('/categories'))
        .catch(err => res.status(500).send("Unable to Remove Category / Category not found"));
});



app.get('/oops', (req,res) =>{
    res.render('404');
})

app.get('/login', (req, res) => {   
    res.render('login', { errorMessage: ""});
});

app.get('/register', (req, res) => {
    res.render('register', { errorMessage: "", successMessage: "" });
});

app.post('/register', (req, res) => {
    authData.registerUser(req.body)
        .then(()=> {
            res.render('register', { successMessage: "User created successfully!", errorMessage: "" });
        })
        .catch((err) => {
            res.render('register', {errorMessage: err, userName: req.body.userName, successMessage: ""});
        });
    }
);

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory,
            };
            res.redirect('/items');
        })
        .catch((err) => {
            res.render('login', { errorMessage: err, userName: req.body.userName });
        });
}
);

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
}
);

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory', { user: req.session.user });
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

/**|------------------------- Auth -------------------------  */

sv.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(PORT, function(){
        console.log("app listening on: " + PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
    process.exit(1);
});

module.exports = app;
