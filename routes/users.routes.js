/*
  We have 4 APIs for users route
  1. Get a user API
  2. Change first name and last name API
  3. Delete account API
  4. Change password API
*/

const router = require('express').Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');


//Use sequelize model
const db = require('../config/database.config');
const User = db.user;
const CaptchaKey = db.captcha_key;


//Get a user API
router.get('/', async (req, res) => {
  const user_id = res.locals.user.user_id;
  
  //Find user in database
  const user = await User.findOne({ 
    attributes: [
      'email',
      'first_name',
      'last_name',
    ],
    where: { user_id: user_id }
  });

  //Check exist user
  if (!user)
    return res.status(400).json({"message": "user does not exist "});

  res.status(200).json({
    "message": "get user successfully",
    "data": user
  });
})


//Change first name and last name API
router.post('/', 
  body('first_name').isLength({ min: 2, max: 50 }),
  body('last_name').isLength({ min: 2, max: 50 }),
async (req, res) => {
  //Validation
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user_id = res.locals.user.user_id;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;

  //Check null information
  if (!first_name || !last_name) {
    return res.status(400).json({"message": "information is required"});
  }

  //Find user in db
  const user = await User.findOne({ 
    where: { user_id: user_id }
  });

  //Check exist user
  if (!user)
    return res.status(400).json({"message": "user does not exist "});

  //Update user
  await User.update(
    {  
      first_name: first_name,
      last_name: last_name,
    },
    { where: { user_id: user_id }}
  );

  res.status(200).json({
    "message": "change first name and last name successfully"
  })
});


//Delete account API
router.delete('/', async (req, res) => {
  const user_id = res.locals.user.user_id;

  //Find user in db
  const user = await User.findOne({ 
    where: { user_id: user_id }
  });

  //Check exist user
  if (!user)
    return res.status(400).json({"message": "user does not exist "});

  //Delete captcha_key of user
  await CaptchaKey.destroy({
    where: {
      user_id: user_id
    }
  });

  //Delete user
  await User.destroy({
    where: {
      user_id: user_id
    }
  });

  res.status(200).json({
    "message": "delete account successfully"
  });
});


//Change password API
router.post('/password', 
  body('current_password').isLength({ min: 8, max: 50 }),
  body('_new_password').isLength({ min: 8, max: 50 }),
async (req, res) => {
  //Validation
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const current_password = req.body.current_password;
  const new_password = req.body.new_password;
  const user_id = res.locals.user.user_id;

  //Check null password 
  if(!current_password || !new_password) {
    return res.status(400).json({ "message": "password is required" })
  }

  //Find user in db
  const user = await User.findOne({ 
    where: { user_id: user_id }
  });

  //Check exist user
  if(!user)
    return res.status(400).json({"message": "user does not exist "});

  //Compare password
  const isMatch = await bcrypt.compare(current_password, user.password);

  //Correct password
  if(isMatch) {
    //New password hashing
    const hashNewPassword = await bcrypt.hash(new_password, 8);

    //Change password
    await User.update({ password: hashNewPassword },
      { where : { user_id: user_id }}
    );

    res.status(200).json({"message": "change password successfully"})
  }  

  //Incorrect password
  else {
    res.status(401).json({"message": "incorrect current password"});
  }
});

module.exports = router;