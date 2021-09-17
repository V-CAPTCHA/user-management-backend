module.exports = (sequelize, Sequelize) => {
  const AuthenAction = sequelize.define(
    //Table name
    'authen_action', 
    {
      //Fields
      action_id: {
        type: Sequelize.INTEGER,
        field: 'action_id',
        primaryKey: true,
        autoIncrement: true,
      },
      dataset_id: {
        type: Sequelize.INTEGER,
        field: 'dataset_id',
      },
      action_reply: {
        type: Sequelize.STRING,
        field: 'action_reply',
      },
      action_create: {
        type: Sequelize.DATE,
        field: 'action_create',
      },
      action_end: {
        type: Sequelize.DATE,
        field: 'action_end',
      },
      action_checked: {
        type: Sequelize.BOOLEAN,
        field: 'action_checked',
      },
      action_valid: {
        type: Sequelize.STRING,
        field: 'action_valid',
      },
      action_ip: {
        type: Sequelize.STRING,
        field: 'action_ip',
      },
      key_value: {
        type: Sequelize.STRING,
        field: 'key_value',
        foreignKey: true,
      }
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return AuthenAction;
};