const router = require('express').Router();
const bcrypt = require('bcrypt');

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
router.post('/', async (req, res) => {
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