const router = require('express').Router();

//Use sequelize model
const db = require('../config/database.config');
const User = db.user;


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
  })
})

module.exports = router;