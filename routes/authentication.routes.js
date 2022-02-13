/*
  We have 4 APIs for authenaction route
  1. Login API
  2. Register API
  3. Request to reset password API
  4. Reset password API
*/

const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');


//Use sequelize model
const db = require('../config/database.config');
const User = db.user;


//Mailer
const transporter = require('../config/mailer.config');


//Login API
router.post('/login', 
  body('email').isEmail(),
  body('password').isLength({ min: 8, max: 50 }),
async (req, res) => {

  //Validation
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  //Check null value
  const email = req.body.email;
  const password = req.body.password;
  if (!(email && password))
    return res.status(400).json({ "message": "information is required" })


  //Check exist user
  const user = await User.findOne({ where: { email: email }});
  if (!user)
    return res.status(400).json({"message": "user does not exist "})

  //Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  //Correct password
  if(isMatch) {
    const token = jwt.sign(
      { user_id: user.user_id },  //payload
      process.env.SECRET_KEY,     //secret key
      { expiresIn: "7d" }         //expired
    );

    res.status(200).json({
      "message": "authorization successfully",
      "token": token,
    });
  }

  //Incorrect password
  else {
    res.status(401).json({"message": "incorrect password"});
  }
})


//Register API
router.post('/register', 
  body('email').isEmail(),
  body('password').isLength({ min: 8, max: 50 }),
  body('first_name').isLength({ min: 2, max: 50 }),
  body('last_name').isLength({ min: 2, max: 50 }),
async (req, res) => {
  //Validation
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const email = req.body.email;
  const password = req.body.password;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;

  //Check null information
  if (!(email && password && first_name && last_name)) 
    return res.status(400).json({ "message": "information is required" })

  //Check exist user
  const user = await User.findOne({ where: { email: email }});
  if (user) return res.status(400).json({
    "message": "user already exists"
  });

  //Password hashing
  const hashPassword = await bcrypt.hash(password, 8);

  //Create new user
  await User.create({
    email: email,
    password: hashPassword,
    first_name: first_name,
    last_name: last_name,
  });

  res.status(200).json({
    "message": "register successfully",
  });
});


//Request to reset password API
router.post('/resetpassword', 
  body('email').isEmail(),
async (req, res) => {
  //Validation
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const email = req.body.email;

  //Check null email
  if (!email) return res.status(400).json({ "message": "email is required" });

  //Check exist user
  const user = await User.findOne({ where: { email: email }});
  if (!user)
    return res.status(400).json({"message": "user does not exist "});

  //Create token for reset password
  const token = jwt.sign(
    { 
      user_id: user.user_id,
      purpose: 'reset_password',
    },
    process.env.SECRET_KEY,
    { expiresIn: '7d' }
  );

  //Send link for reset password to email
  const mail = await transporter.sendMail({
    from: '"VCaptcha" <vcaptcha@gmail.com>',
    to: email,
    subject: 'รีเซ็ตรหัสผ่าน VCaptcha',
    text: "ดูเหมือนว่าคุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี VCaptcha ของคุณ",
    html: `
      <h3>สวัสดี, ${user.first_name} ${user.last_name}!</h3>
      <p>ดูเหมือนว่าคุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี VCaptcha ของคุณ</p>
      <p>หากคุณไม่ได้เป็นคนขอรีเซ็ตรหัสผ่านนี้ คุณสามารถเพิกเฉยอีเมล์นี้ได้อย่างปลอดภัย</p>
      <p>หรือคลิกที่ลิงก์ด้านล่างนี้เพื่อรีเซ็ตรหัสผ่าน</p>
      <a href="${process.env.APP_URL}/resetpassword/${token}">รีเซ็ตรหัสผ่าน</a>
    `
  }).catch((error) => {
    console.log(error);
  })

  res.status(200).json({
    'message': 'send link to reset password successfully',
  });
});


//Reset password API
router.put('/resetpassword',
  body('token').isJWT(),
  body('new_password').isLength({ min: 8, max: 50 }),
async (req, res) => {
  //Validation
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const token = req.body.token;
  var new_password = req.body.new_password;
  var user_id = '';

  //Check null new password
  if (!new_password) {
    return res.status(400).json({ "message": "new password is required"})
  }

  //New password hashing
  new_password =  await bcrypt.hash(new_password, 10);

  //Verify reset password token
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    //if token error
    if (err) {
      return res.status(400).json({"message": "token expired"});
    }

    if (decoded.purpose === 'reset_password') {
      user_id = decoded.user_id;
    }
  });

  //Check exist user
  const user = await User.findOne({ where: { user_id: user_id } });

  if (!user) 
    return res.status(400).json({"message": "user does not exist"});

  //Update password
  user.password = new_password;
  await user.save();

  res.status(200).json({
    'message': 'reset password sucessfully'
  });
});

module.exports = router;