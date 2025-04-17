//mongoose
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
let userSchema = new Schema({
    userName: String,
    password: String,
    email: String,
    loginHistory: [{
      dateTime: Date,
      userAgent: String,
    }],
    country: String,
});
  
let User;

function initialize () {
  return new Promise((resolve, reject) => {
      let db = mongoose.createConnection("mongodb+srv://majara-martell:matias2015@webapp.tyjf2al.mongodb.net/?retryWrites=true&w=majority&appName=webApp");

      db.on('error', (err)=>{
          reject(err); // reject the promise with the provided error
      });
      db.once('open', ()=>{
         User = db.model("users", userSchema);
         resolve();
      });
  });
};

function registerUser(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
      return;
    }
    
    bcrypt.hash(userData.password, 10)
    .then((hash)=>{ // Hash the password using a Salt that was generated using 10 rounds
      userData.password = hash; // a
      let newUser = new User(userData);
      newUser.save()
        .then(() => resolve())
        .catch((err) => {
          if(err.code === 11000) {
            reject("User already taken");
          }
          else {
            reject("There was an error creating the user: " + err);
          }
        });
     })
    .catch((err)=>{
      reject("There was an error encrypting the password: " + err); // Show any errors that occurred during the process
    });
  });
}

function checkUser(userData) {
  return new Promise((resolve, reject) => {
    // Find the user in the database by userName
    User.findOne({ userName: userData.userName })
      .then((foundUser) => {
        if (!foundUser) {
          // User not found
          reject("Unable to find user: " + userData.userName);
          return;
        }

   
        bcrypt.compare(userData.password, foundUser.password)
          .then((match) => {
            if (match) {
             
              foundUser.loginHistory.push({
                dateTime: new Date().toString(),
                userAgent: userData.userAgent,
              });

              //Save the updated login history to the database
              User.updateOne(
                { userName: userData.userName },
                { $set: { loginHistory: foundUser.loginHistory } }
              )
                .then(() => resolve(foundUser))
                .catch((err) => reject("Unable to update user: " + err));
            } else {
              //Passwords do not match
              console.log("Comparing passwords:");
              console.log("Entered:", userData.password);
              console.log("Stored :", foundUser.password);

              reject("Incorrect Password for user: " + userData.userName);
            }
          })
          .catch((err) => {
            //Error during password comparison
            reject("Unable to validate password: " + err);
          });
      })
      .catch((err) => {
        //Error during user lookup
        reject("There was an error verifying the user: " + err);
      });
  });
}


module.exports = { initialize, registerUser, checkUser }; 