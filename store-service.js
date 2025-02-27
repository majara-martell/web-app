const fs = require("fs");

let items = [];     
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {

        fs.readFile("./data/items.json", "utf8", (err, data) => {
            if (err) {
                reject("Unable to read items.json");
                return;
            }
            items = JSON.parse(data);

            fs.readFile("./data/categories.json", "utf8", (err, data) => {
                if (err) {
                    reject("Unable to read categories.json");
                    return;
                }
                categories = JSON.parse(data);

                resolve(); 
            });
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject("No results returned");
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("No results returned");
        }
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("No results returned");
        }
    });
}

function addItem(itemData) {
    return new Promise ((resolve, reject) => {
        try {
            itemData.published = itemData.published ? true : false;// avoid using if else here

            itemData.id = items.length + 1;
            
            items.push(itemData);
            
            resolve(itemData);

        } catch(err) {
            reject("Error adding item: " + err);
        }

    }); 

}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        // Filter the items array to match the category
        const filteredItems = items.filter(item => item.category === category);
        
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No results returned");
        }
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {

        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No results returned");
        }
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {

        const item = items.find(item => item.id == id);

        if (item) {
            resolve(item); 
        } else {
            reject("No result returned");
        }
    });
}

module.exports = { addItem, initialize, getAllItems, getPublishedItems, getCategories, 
    getItemsByCategory, getItemsByMinDate, getItemById};

