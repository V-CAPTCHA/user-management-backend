const router = require('express').Router();
const moment = require('moment');
const sequelize = require('sequelize');
const { Op } = require('sequelize')

//Use sequelize model
const db = require('../config/database.config');
const CaptchaKey = db.captcha_key;
const AuthenAction = db.authen_action;


//Total request
router.get('/total-request', async (req, res) => {
  const user_id = res.locals.user.user_id;

  //define return data
  var total_request = 0;
  var total_request_per_day = [];

  //define association CaptchaKey and AuthenAction
  CaptchaKey.hasMany(AuthenAction, { foreignKey: 'key_value' });
  AuthenAction.belongsTo(CaptchaKey, { foreignKey: 'key_value', targetKey: 'key_value' });
  
  //total request of user
  await AuthenAction.findAndCountAll({
    include: {
      model: CaptchaKey,
      where: { user_id: user_id }
    }
  }).then((result) => {
    total_request = result.count
  })

 
  //find 90 day before action in db 
  //atDate = 0 is current date
  for(var atDate=-89; atDate<1; atDate++) {
    var temp_date = moment().add(atDate, 'days').format('YYYY-MM-DD')

    await AuthenAction.findAndCountAll({
      where: sequelize.where(
          sequelize.fn('date', sequelize.col('action_create')), '=', temp_date
      ),
      include: {
        model: CaptchaKey,
        where: {
          user_id: user_id
        }
      }

    })
    .then((result) => {
      total_request_per_day.push(result.count);
    })
  }

  //response
  res.status(200).json({
    'message':'get dashboard info successfully',
    'total_request': total_request,
    'total_request_per_day': total_request_per_day,
  });
});


//Valid request
router.get('/valid-request', async (req, res) => {
  const user_id = res.locals.user.user_id;

  //define return data
  var total_request = 0;
  var valid_percent = 0;
  var valid_request_per_day = [];

  //define association CaptchaKey and AuthenAction
  CaptchaKey.hasMany(AuthenAction, { foreignKey: 'key_value' });
  AuthenAction.belongsTo(CaptchaKey, { foreignKey: 'key_value', targetKey: 'key_value' });
  
  //total request of user
  await AuthenAction.findAndCountAll({
    include: {
      model: CaptchaKey,
      where: { user_id: user_id }
    }
  }).then((result) => {
    total_request = result.count;
  })

  //valid request of user
  await AuthenAction.findAndCountAll({
    where: { action_checked: true },
    include: {
      model: CaptchaKey,
      where: { user_id: user_id }
    }
  }).then((result) => {
    //calculate percentage
    valid_percent = (result.count / total_request)*100;
    valid_percent = valid_percent.toFixed(2) + '%';
  })

  //find 90 day before action in db 
  //atDate = 0 is current date
  for(var atDate=-89; atDate<1; atDate++) {
    var temp_date = moment().add(atDate, 'days').format('YYYY-MM-DD')

    await AuthenAction.findAndCountAll({
      where: {
        [Op.and]: [
          { action_checked: true },
          sequelize.where(
            sequelize.fn('date', sequelize.col('action_create')), '=', temp_date
          ),
        ]
      },      
      include: {
        model: CaptchaKey,
        where: {
          user_id: user_id
        }
      }
    })
    .then((result) => {
      valid_request_per_day.push(result.count);
    })
  }

  //response
  res.status(200).json({
    'message':'get dashboard info successfully',
    'valid_percent': valid_percent,
    'valid_request_per_day': valid_request_per_day,
  });
});


//Invalid request
router.get('/invalid-request', async (req, res) => {
  var invalid_percent = 0;
  var invalid_request_per_day = [];

  
  /*find invalid action
  const invalid_action = await AuthenAction.findAndCountAll({

  });*/
});

module.exports = router;