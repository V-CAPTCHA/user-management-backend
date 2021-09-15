const router = require('express').Router();
const { nanoid } = require('nanoid');
const moment = require('moment');

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


//Create new key
router.post('/', async (req, res) => {
  const key_name = req.body.key_name;
  const creation_date = moment().format('YYYY-MM-DD');
  const domain = req.body.domain;
  const user_id = res.locals.user.user_id;
  const key_value = nanoid();

  //check null key info
  if(!user_id || !key_name || !domain) {
    return res.status(400).json({"message": "key info is required"});
  }

  //check domain in db
  const {count , row } = await CaptchaKey.findAndCountAll({where: {
    user_id: user_id,
  }});

  //if key has more than 5
  if(count >= 5) {
    return res.status(400).json({"message": "Your keys has reached its activation limit"});
  }

  //create key
  await CaptchaKey.create({
    key_name: key_name,
    creation_date: creation_date,
    domain: domain,
    user_id: user_id,
    key_value: key_value,
  });

  //response
  res.status(200).json({
    "message": "create key successfully"
  });
});

module.exports = router;