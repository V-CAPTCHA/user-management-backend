module.exports = (sequelize, Sequelize) => {
  const CaptchaKey = sequelize.define(
    //Table name
    'captcha_key', 
    {
      //Fields
      key_id: {
        type: Sequelize.INTEGER,
        field: 'key_id',
        primaryKey: true,
        autoIncrement: true,
      },
      key_name: {
        type: Sequelize.STRING,
        field: 'key_name',
      },
      creation_date: {
        type: Sequelize.DATE,
        field: 'creation_date',
      },
      domain: {
        type: Sequelize.STRING,
        field: 'domain',
      },
      user_id: {
        type: Sequelize.INTEGER,
        field: 'user_id',
        foreignKey: true,
      },
      key_value: {
        type: Sequelize.STRING,
        field: 'key_value',
      },
    },
    //Options
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return CaptchaKey;
};