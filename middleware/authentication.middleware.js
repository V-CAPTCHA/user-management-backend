const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  //Get token
  const token = req.headers['x-access-token']
  
  //If has token in headers
  if(token) {
    //Verify token
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      //Invalid token
      if (err) {
        return res.status(403).json({'message': 'invalid token'})
      }

      //Set user info to res.locals
      res.locals.user = user;

      //Next function after token checked
      return next();
    });
  }

  //If has not token in headers
  else {
    return res.status(401).json({'message': 'token is required for authentication'})
  }
}

module.exports = verifyToken;