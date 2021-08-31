module.exports = (sequelize, Sequelize) => {
  const CaptchaKey = Sequelize.define(
    //Table name
    'captcha_key', 
    {
      //Fields
    }
  )

  return CaptchaKey;
};