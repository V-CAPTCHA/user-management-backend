module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    //Table name
    'user', 
    {
      //Fields
      user_id: {
        type: Sequelize.INTEGER,
        field: 'user_id',
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING,
        field: 'email',
      },
      password: {
        type: Sequelize.STRING,
        field: 'password',
      },
      first_name: {
        type: Sequelize.STRING,
        field: 'first_name',
      },
      last_name: {
        type: Sequelize.STRING,
        field: 'last_name',
      },
    },
    //Options
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  
  return User;
};