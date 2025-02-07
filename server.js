const express = require("express");
const app = express();
const path = require('path');
const sv = require("./store-service.js"); 
const PORT = process.env.PORT || 8080;
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use(express.static('public'));

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get("/shop", (req, res) => {
    sv.getPublishedItems()
        .then((data) => res.json(data)) 
        .catch((err) => res.status(404).json({ message: err })); 
});

app.get("/items", (req, res) => {
    sv.getAllItems()
        .then((data) => res.json(data)) 
        .catch((err) => res.status(404).json({ message: err })); 
});

app.get("/categories", (req, res) => {
    sv.getCategories()
        .then((data) => res.json(data)) 
        .catch((err) => res.status(404).json({ message: err })); 
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
