const router = require('express').Router();
const moment = require('moment');
const sequelize = require('sequelize');

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

  //All request
  total_request = await AuthenAction.findAndCountAll({
    where: { key_value: '1150123vcaptcha' }
  })
  
  if(!total_request) {
    return res.status(200).json({"message": "request does not exist"})
  }


  //find 90 day before action in db 
  //atDate = 0 is current date
  for(var atDate=-89; atDate<1; atDate++) {
    var temp_date = moment().add(atDate, 'days').format('YYYY-MM-DD')

    const total_action = await AuthenAction.findAndCountAll({
      where: sequelize.and(
        { 
          key_value: '1150123vcaptcha'
        },
        sequelize.where(
          sequelize.fn('date', sequelize.col('action_create')), '=', temp_date
        ),
      )
    })
    .then((total_action) => {
      total_request_per_day[atDate+89] = total_action.count;
    })
  }

  //response
  res.status(200).json({
    'message':'get dashboard info successfully',
    'total_request': total_request.count,
    'total_request_per_day': total_request_per_day,
  });










});


//Valid request
router.get('/valid-request', async (req, res) => {
  var valid_percent = 0;
  var valid_request_per_day = [];

  
  /*find valid action
  const valid_action = await AuthenAction.findAndCountAll({

  });*/
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