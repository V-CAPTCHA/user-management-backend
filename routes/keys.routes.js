const router = require('express').Router();

//Use sequelize model
const db = require('../config/database.config');
const CaptchaKey = db.captcha_key;

//Get all keys
router.get('/', async (req, res) => {
  const user_id = res.locals.user.user_id;

  //find and count all key of user in db
  const {count, rows} = await CaptchaKey.findAndCountAll({
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
  });

  //if key is null
  if(!count) {
    return res.status(200).json({"message": "key does not exist"});
  }
  
  //response
  res.status(200).json({
    "message": "get all keys successfully",
    "data": rows
  })
});


//Get key info
router.get('/:key_value', async (req, res) => {
  const key_value = req.params.key_value;
  const user_id = res.locals.user.user_id;
  
  //check null params
  if(!key_value) {
    return res.status(400).json({"message": "key values is requried"})
  }

  //find key in db
  const key = await CaptchaKey.findOne({
    attributes: [
      'key_id',
      'key_name',
      'creation_date',
      'domain',
      'key_value'
    ],
    where: { 
      user_id: user_id,
      key_value: key_value 
    }
  });

  //if key does not exist
  if(!key) {
    return res.status(400).json({"message": "key does not exist"});
  }

  //response
  res.status(200).json({
    "message": "get key successfully",
    "data": key
  });
});




module.exports = router;