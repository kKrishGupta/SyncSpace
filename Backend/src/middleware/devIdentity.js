const  devIdentity = (req, res, next) => {
  // Check if the request is coming from a development environment
  req.user = {
    id:"dev-user-001",
    name:"Krish Gupta"
  };
  next();
}

module.exports = devIdentity;