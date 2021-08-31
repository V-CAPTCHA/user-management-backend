const router = require('express').Router();

//Get all keys
router.get('/', (req, res) => {
  res.status(200).send('Keys');
})

module.exports = router;