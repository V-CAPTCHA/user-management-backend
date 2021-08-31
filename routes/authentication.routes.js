const router = require('express').Router();

//Login
router.get('/login', (req, res) => {
  res.status(200).send('Login');
})


//Register
router.get('/register', (req, res) => {
  res.status(200).send('Register');
})

module.exports = router;