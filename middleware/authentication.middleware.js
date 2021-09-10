const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  //Get token
  const token = req.body.token || req.headers['x-access-token'] || req.headers['x-token'];

  //If no token
  if (!token) {
    return res.status(403).json({
      'message': 'token is required for authentication'
    });
  }

  try {
    //add info to res.locals
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.locals.user = decoded;
  }
  catch(error) {
    return res.status(401).json({
      'message': 'Invalid token'
    });
  }

  //next function after token checked
  return next();
}

module.exports = verifyToken;