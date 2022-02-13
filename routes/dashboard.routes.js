/*
  We have 3 APIs for dashboard route
  1. Total request API
  2. Valid request API
  3. Invalid request API
*/

const router = require('express').Router();
const moment = require('moment');
const sequelize = require('sequelize');
const { Op } = require('sequelize')


//Use sequelize model
const db = require('../config/database.config');
const CaptchaKey = db.captcha_key;
const AuthenAction = db.authen_action;


//Total request API
router.get('/total-request', async (req, res) => {
  const user_id = res.locals.user.user_id;

  //Define return data
  var total_request = 0;
  var total_request_per_day = [];
  
  //Total request of user
  await AuthenAction.findAndCountAll({
    include: {
      model: CaptchaKey,
      where: { user_id: user_id }
    }
  }).then((result) => {
    total_request = result.count
  })

 
  //Find 90 day before action in db 
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

    }).then((result) => {
      total_request_per_day.push(result.count);
    })
  }

  res.status(200).json({
    'message':'get total request info successfully',
    'total_request': total_request,
    'total_request_per_day': total_request_per_day,
  });
});


//Valid request API
router.get('/valid-request', async (req, res) => {
  const user_id = res.locals.user.user_id;

  //Define return data
  var total_request = 0;
  var valid_percent = 0;
  var valid_request_per_day = [];
  
  //Total request of user
  await AuthenAction.findAndCountAll({
    include: {
      model: CaptchaKey,
      where: { user_id: user_id }
    }
  }).then((result) => {
    total_request = result.count;
  })

  //Valid request of user
  await AuthenAction.findAndCountAll({
    where: { action_valid: 'PASSES' },
    include: {
      model: CaptchaKey,
      where: { user_id: user_id }
    }
  }).then((result) => {
    //Calculate percentage
    if(!result.count) {
      valid_percent = '-';
    }
    else {
      valid_percent = (result.count / total_request)*100;
      valid_percent = valid_percent.toFixed(2) + '%';
    }
  })

  //Find 90 day before action in db 
  //atDate = 0 is current date
  for(var atDate=-89; atDate<1; atDate++) {
    var temp_date = moment().add(atDate, 'days').format('YYYY-MM-DD')

    await AuthenAction.findAndCountAll({
      where: {
        [Op.and]: [
          { action_valid: 'PASSES' },
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
    }).then((result) => {
      valid_request_per_day.push(result.count);
    })
  }

  res.status(200).json({
    'message':'get valid request info successfully',
    'valid_percent': valid_percent,
    'valid_request_per_day': valid_request_per_day,
  });
});


//Invalid request API
router.get('/invalid-request', async (req, res) => {
  const user_id = res.locals.user.user_id;

  //Define return data
  var total_request = 0;
  var invalid_percent = 0;
  var invalid_request_per_day = [];
  
  //Total request of user
  await AuthenAction.findAndCountAll({
    include: {
      model: CaptchaKey,
      where: { user_id: user_id }
    }
  }).then((result) => {
    total_request = result.count;
  })

  //Invalid request of user
  await AuthenAction.findAndCountAll({
    where: { action_valid: 'WRONG' },
    include: {
      model: CaptchaKey,
      where: { user_id: user_id }
    }
  }).then((result) => {
    //Calculate percentage
    if(!result.count) {
      invalid_percent = '-'
    }
    else{
      invalid_percent = (result.count / total_request)*100;
      invalid_percent = invalid_percent.toFixed(2) + '%';
    }
  })

  //Find 90 day before action in db 
  //atDate = 0 is current date
  for(var atDate=-89; atDate<1; atDate++) {
    var temp_date = moment().add(atDate, 'days').format('YYYY-MM-DD')

    await AuthenAction.findAndCountAll({
      where: {
        [Op.and]: [
          { action_valid: 'WRONG' },
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
      invalid_request_per_day.push(result.count);
    })
  }

  res.status(200).json({
    'message':'get invalid request info successfully',
    'invalid_percent': invalid_percent,
    'invalid_request_per_day': invalid_request_per_day,
  });
});

module.exports = router;