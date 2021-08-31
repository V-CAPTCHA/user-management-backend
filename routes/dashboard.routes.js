const router = require('express').Router();

//Dashbaord
router.get('/', (req, res) => {
  res.status(200).send('Dashboard');
})

module.exports = router;