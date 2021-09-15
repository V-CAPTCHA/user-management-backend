module.exports = (sequelize, Sequelize) => {
  const CaptchaKey = sequelize.define(
    //Table name
    'captcha_keys', 
    {
      //Fields
      key_id: {
        type: Sequelize.INTEGER,
        field: 'key_id',
        primaryKey: true,
        authoIncrement: true,
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
    //options
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return CaptchaKey;
};