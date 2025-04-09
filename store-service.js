const Sequelize = require('sequelize');//holds data types
var sequelize = new Sequelize('web322', 'web322_owner', 'npg_JirI4jb0HNzs', {//connection
    host: 'ep-restless-glade-a5ob7g02-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

const fs = require("fs");

const Item = sequelize.define('Item', {//connect sequelize
    body: Sequelize.TEXT, //Sequelize data types
    title : Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE,
});

const Category = sequelize.define('Category', {
    category: { 
        type: Sequelize.STRING,
        allowNull: false
    }
});

Item.belongsTo(Category, {foreignKey: 'category'});

function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve();
            })
            .catch((err) => {
                //console.error("error:", err);
                reject("unable to sync the database");
            });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        Item.findAll()
        .then(data => {
            resolve(data);//what the find all function returns
        })
        .catch(() => {
            reject("no results returned");
        })
        
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        Item.findAll({//Post.
            where: { published: true }
        })
        .then((data) => {
            resolve(data);
        })
        .catch(() => {
            reject("no results returned");
        });
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
}


function addItem(itemData) {
    return new Promise((resolve, reject) => {

        itemData.published = (itemData.published) ? true : false;

        for (let prop in itemData) {
            if (itemData[prop] === "") {
                itemData[prop] = null;
            }
        }

        itemData.postDate = new Date();

        //new
        Item.create(itemData)
            .then(() => {
                resolve();
            })
            .catch(() => {
                reject("unable to create post");
            });
    });
}

function getItemsByCategory(category) {//category = category ID from item.category
    return new Promise((resolve, reject) => {
        
        //converting category to number
        const categoryId = parseInt(category);
        
        Item.findAll({
            where: { 
                category: categoryId 
            },
        })
        .then(data => {
            resolve(data);
        })
        .catch(err => {
            reject()
        });
        
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then(data => {
            resolve(data)
        })
        .catch(() => {
             reject("no results returned");
        });
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        Item.findOne({//Don't use findAll as it would return an array [] when it should be in '{}'.
            where: {
                id: id
            } 
        })
        .then(item => {
            resolve(item);
        })
        .catch(() => {
            reject("no results returned");
        });
    });
}

function getPublishedItemsByCategory(Cat) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true,
                category: Cat
            }
        })
        .then((data) => {
            resolve(data);
        })
        .catch(() => {
            reject("no results returned");
        });
    });
}

function addCategory(categoryData) {
    return new Promise((resolve, reject) => {

        Category.published = (Category.published) ? true : false;

        for (let e in categoryData) {
            if (Category[e] === "") {
                Category[e] = null;
            }
        }
        Category.create(categoryData)//database feature
            .then(() => {
                resolve();
            })
            .catch((err) => { reject("Unable to create a category")})
    });
}

function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        if(!id){
            reject("The Category ID doesn't exist")
            return;
        }

        Category.destroy({
            where: { id: id }
        })// deletion feature in db
            .then(() => { //.then((rowsDeleted) => {if (rowsDeleted === 1) {
                resolve();
            })
            .catch((err) => { reject("Unable to destroy a category")})
    });
}

function deletePostById(id) {
    return new Promise((resolve, reject) => {
        if(!id){
            reject("Invalid Item ID")
            return;
        }
        //Post
        Item.destroy({
            where: { id: id }
        })
            .then(() => { //.then((rowsDeleted) => {if (rowsDeleted === 1) {
                resolve();
            })
            .catch((err) => { reject("Unable to destroy an Item")})
    });
}

module.exports = {
    deletePostById,
    deleteCategoryById,
    addCategory,
    addItem,
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    getPublishedItemsByCategory
};
