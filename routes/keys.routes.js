const router = require('express').Router();
const { nanoid } = require('nanoid');
const moment = require('moment');
const { body, validationResult } = require('express-validator');

//Use sequelize model
const db = require('../config/database.config');
const CaptchaKey = db.captcha_key;
const AuthenAction = db.authen_action;

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
router.get('/:key_id', async (req, res) => {
  const key_id = req.params.key_id;
  const user_id = res.locals.user.user_id;
  
  //check null params
  if(!key_id) {
    return res.status(400).json({"message": "key id is requried"})
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
      key_id: key_id 
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
router.post('/', 
body('key_name').isLength({ min: 2, max: 50 }),
body('domain').isLength({ min: 2, max: 50 }),
async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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

  //if key has more than 3
  if(count >= 3) {
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


//Edit key
router.patch('/:key_id', 
body('key_name').isLength({ min: 2, max: 50 }),
body('domain').isLength({ min: 2, max: 50 }),
async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user_id = res.locals.user.user_id;
  const key_id = req.params.key_id;
  const new_key_name = req.body.key_name;
  const new_domain = req.body.domain;

  //check null key info
  if(!new_key_name || !new_domain) {
    return res.status(400).json({"message": "key info is required"});
  }

  //find user's key in db
  const key = await CaptchaKey.findOne({
    where: {
      user_id: user_id,
      key_id: key_id,
    }
  });

  if(!key) {
    return res.status(400).json({"message": "key does not exist"});
  }

  //edit key
  await CaptchaKey.update(
    {
      key_name: new_key_name,
      domain: new_domain,
    },
    { 
      where: { 
        user_id: user_id, 
        key_id: key_id, 
      }
    }
  );

  //response
  res.status(200).json({
    "message": "edit key successfully"
  });
});


//Delete key
router.delete('/:key_id', async (req, res) => {
  const key_id = req.params.key_id;
  const user_id = res.locals.user.user_id;

  //find user's key in db
  const key = await CaptchaKey.findOne({
    where: {
      user_id: user_id,
      key_id: key_id,
    }
  });

  if(!key) {
    return res.status(400).json({"message": "key does not exist"});
  }

  //delete auth action of key
  await AuthenAction.destroy({
    include: {
      model: CaptchaKey,
      where: { key_id: key_id }
    },
    where: {
      key_value: key.key_value
    }
  });

  //delete key
  await CaptchaKey.destroy({
    where: { 
      user_id: user_id, 
      key_id: key_id, 
    }
  });

  res.status(200).json({
    "message": "delete key successfully"
  });
});

module.exports = router;