const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Use sequelize model
const db = require('../config/database.config');
const User = db.user;


//Mailer
const transporter = require('../config/mailer.config');


//Login
router.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check null input
  if (!(email && password))
    return res.status(400).json({ "message": "information is required" })

  //check user in db
  const user = await User.findOne({ where: { email: email }});

  if (!user)
    return res.status(400).json({"message": "user does not exist "})

  //compare password
  const isMatch = await bcrypt.compare(password, user.password);

  //correct password
  if(isMatch) {
    //create auth token
    const token = jwt.sign(
      { user_id: user.user_id }, //payload
      process.env.SECRET_KEY, //secret key
      { expiresIn: "7d" } //exp
    );

    //response token
    res.status(200).json({
      "message": "authorization successfully",
      "token": token,
    });
  }
  //incorrect password
  else {
    res.status(401).json({"message": "incorrect password"});
  }
})


//Register
router.post('/register', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;

  //check null information
  if (!(email && password && first_name && last_name)) 
    return res.status(400).json({ "message": "information is required" })

  //check user in db
  const user = await User.findOne({ where: { email: email }});

  if (user) return res.status(400).json({
    "message": "user already exists"
  });

  //hash password
  const hashPassword = await bcrypt.hash(password, 8);

  //create new user
  await User.create({
    email: email,
    password: hashPassword,
    first_name: first_name,
    last_name: last_name,
  });

  //response
  res.status(200).json({
    "message": "register successfully",
  });
});


//Request to reset password
router.post('/resetpassword', async (req, res) => {
  const email = req.body.email;

  //check null email
  if (!email) return res.status(400).json({ "message": "email is required" });

  //check user in db
  const user = await User.findOne({ where: { email: email }});

  if (!user)
    return res.status(400).json({"message": "user does not exist "})

  //create token for reset password
  const token = jwt.sign(
    { 
      user_id: user.user_id,
      purpose: 'reset_password',
    },
    process.env.SECRET_KEY,
    { expiresIn: '7d' }
  );

  //Send link to reset password to email
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


//Reset password
router.put('/resetpassword', async (req, res) => {
  const token = req.body.token;
  const new_password = await bcrypt.hash(req.body.new_password, 10);
  var user_id = '';

  //verify reset password token
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    //if token error
    if (err) return res.status(400).json({"message": "token expired"});

    if (decoded.purpose === 'reset_password') 
      user_id = decoded.user_id;
  });

  //check user in db
  const user = await User.findOne({ where: { user_id: user_id } });

  if (!user) 
    return res.status(400).json({"message": "user does not exist"});

  //update password
  user.password = new_password;
  await user.save();

  //response
  res.status(200).json({
    'message': 'reset password sucessfully'
  });

});

module.exports = router;