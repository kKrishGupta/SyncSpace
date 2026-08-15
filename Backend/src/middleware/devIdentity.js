const mongoose = require("mongoose");

const devIdentity = (req, res, next) => {
  
  req.user = {
    id: process.env.DEV_USER_ID,
    name: "Krish Gupta"
  };
  console.log("Dev Identity Middleware: User set to", req.user);

  next();
};

module.exports = devIdentity;