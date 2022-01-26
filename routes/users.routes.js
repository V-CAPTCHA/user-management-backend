const router = require('express').Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

//Use sequelize model
const db = require('../config/database.config');
const User = db.user;
const CaptchaKey = db.captcha_key;


//Get a user
router.get('/', async (req, res) => {
  const user_id = res.locals.user.user_id;
  
  //find user in db
  const user = await User.findOne({ 
    attributes: [
      'email',
      'first_name',
      'last_name',
    ],
    where: { user_id: user_id }
  });

  if (!user)
    return res.status(400).json({"message": "user does not exist "});

  //response
  res.status(200).json({
    "message": "get user successfully",
    "data": user
  });
})

module.exports = router;


//Change first name and last name
router.post('/', 
body('first_name').isLength({ min: 2, max: 50 }),
body('last_name').isLength({ min: 2, max: 50 }),
async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user_id = res.locals.user.user_id;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;

  //check null information
  if (!first_name || !last_name) {
    return res.status(400).json({"message": "information is required"});
  }

  //find user in db
  const user = await User.findOne({ 
    where: { user_id: user_id }
  });

  if (!user)
    return res.status(400).json({"message": "user does not exist "});

  //update user
  await User.update(
    {  
      first_name: first_name,
      last_name: last_name,
    },
    { where: { user_id: user_id }}
  );

  //response
  res.status(200).json({
    "message": "change first name and last name successfully"
  })
});


//Delete account
router.delete('/', async (req, res) => {
  const user_id = res.locals.user.user_id;

  //find user in db
  const user = await User.findOne({ 
    where: { user_id: user_id }
  });

  if (!user)
    return res.status(400).json({"message": "user does not exist "});

  //delete captcha_key of user
  await CaptchaKey.destroy({
    where: {
      user_id: user_id
    }
  });

  //delete user
  await User.destroy({
    where: {
      user_id: user_id
    }
  });

  //response
  res.status(200).json({
    "message": "delete account successfully"
  });
});


//Change password
router.post('/password', 
body('current_password').isLength({ min: 8, max: 50 }),
body('_new_password').isLength({ min: 8, max: 50 }),
async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const current_password = req.body.current_password;
  const new_password = req.body.new_password;
  const user_id = res.locals.user.user_id;

  //check null password 
  if(!current_password || !new_password) {
    return res.status(400).json({ "message": "password is required" })
  }

  //find user in db
  const user = await User.findOne({ 
    where: { user_id: user_id }
  });

  if(!user)
    return res.status(400).json({"message": "user does not exist "});

  //compare password
  const isMatch = await bcrypt.compare(current_password, user.password);

  //correct password
  if(isMatch) {
    //hash new password
    const hashNewPassword = await bcrypt.hash(new_password, 8);

    //change password
    await User.update({ password: hashNewPassword },
      { where : { user_id: user_id }}
    );

    //response
    res.status(200).json({"message": "change password successfully"})
  }  
  //incorrect password
  else {
    res.status(401).json({"message": "incorrect current password"});
  }
});