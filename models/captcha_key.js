module.exports = (sequelize, Sequelize) => {
  const CaptchaKey = sequelize.define(
    //Table name
    'captcha_key', 
    {
      //Fields
    }
  )

  return CaptchaKey;
};