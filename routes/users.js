const router = require('express').Router();

//Get all users
router.get('/', (req, res) => {
  res.status(200).send('Users');
})

module.exports = router;