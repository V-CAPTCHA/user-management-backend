const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  //Get token
  const token = req.headers['x-access-token']
  
  if(token) {
    //verify token
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      //invalid token
      if (err) {
        return res.status(403).json({'message': 'invalid token'})
      }

      //set user info to res.locals
      res.locals.user = user;

      //next function after token checked
      return next();
    });
  }
  //if no token in headers
  else {
    return res.status(401).json({'message': 'token is required for authentication'})
  }
}

module.exports = verifyToken;