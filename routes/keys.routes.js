const router = require('express').Router();

//Use sequelize model
const db = require('../config/database.config');
const CaptchaKey = db.captcha_key;

//Get all keys
router.get('/', async (req, res) => {
  const user_id = res.locals.user.user_id;

  //find all key of user in db
  const keys = await CaptchaKey.findAll({
    attributes: [
      'key_id',
      'key_name',
      'creation_date',
      'domain',
      'key_value'
    ],
    where: {
      user_id: user_id
    }
  })

  res.status(200).json({
    "message": "get all keys successfully",
    "data": keys
  })
})

module.exports = router;