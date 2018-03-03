var express = require('express');
const request = require('request');
var morgan = require('morgan');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var test = require('assert');
var jwt = require('jsonwebtoken');
var config = require('./config');
var bodyParser = require('body-parser');
var UserData = require('./mongoose.model');
var UserAuthoData = require('./mongoose.users');
var UserUpdateStatus = require('./mongoose.updateStatus');
var app = express();
var apiRoutes = express.Router();
const server = require('http').createServer(app)
const port = process.env.PORT || 3000;
var updateStatus = require('./UpdateStatus')

app.use(require('request-param')());

var url = config.database;

app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({
  limit: '10mb',
  parameterLimit: 1000000,
  extended: false
}));
app.use(bodyParser.json({ limit: '10mb' }));

// app.use(morgan('dev'));

app.set('port', port);
app.use('/', express.static(__dirname + '/www'));

server.listen(port, () => {
  console.log('Server is up');
});

function calcTime() {
  var d = new Date();
  var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  var nd = new Date(utc + (3600000 * 8));
  var updateDate = nd.toLocaleDateString() + "T" + (nd.toLocaleTimeString());
  return updateDate;
}

// =================================================================
// routes ==========================================================
// =================================================================

app.get('/setup', function (req, res) {

  var eden = new UserAuthoData({
    name: 'eden',
    password: 'eden',
    admin: true
  });
  eden.save(function (err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

// basic route (http://localhost:8080)
app.get('/address', function (req, res) {

  var str = calcTime();
  res.send('Hello! wake up! ' + '' + str);
});

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------

app.post('/authenticate', function (req, res) {

  UserAuthoData.findOne({
    name: req.body.name
  }, function (err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        var payload = {
          admin: user.admin
        }
        var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: 86400 // expires in 24 hours
        });

        // res.json({
        //   success: true,
        //   message: 'Enjoy your token!',
        //   token: token
        // });

        res.send(token.toString());
      }
    }
  });
});

// // ---------------------------------------------------------
// // route middleware to authenticate and check token
// // ---------------------------------------------------------

apiRoutes.use(function (req, res, next) {

  var token = req.body.token || req.param('token') || req.headers['x-access-token'];

  if (token) {

    jwt.verify(token, app.get('superSecret'), function (err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        req.decoded = decoded;
        next();
      }
    });

  } else {

    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

//#region API......................................................

//#region Reference only...........................................

apiRoutes.get('/users', function (req, res) {
  UserAuthoData.find({}, { _id: 0 }).then(function (users) {
    res.json(users);
  });
});

apiRoutes.post('/saveData', (req, res) => {
  var data = req.body;

  var userData = new UserData({ BLOCK: data });

  userData.save(function (err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
})

//endregion.........................................................

apiRoutes.post('/insertData', (req, res) => {

  UserData.insertMany({ BLOCK: req.body }, function (err, doc) {
    if (err) {
      return res.status(404).send("Update Fail!");
    };
    res.status(200).send("Ok");
  });
});

apiRoutes.get('/getDataUpload', function (req, res) {

  MongoClient.connect(url, function (err, db) {
    if (err) {
      return res.send("Cannot connect to DB");
    }

    db.listCollections({ name: 'Progress Claim' })
      .next(function (err, collinfo) {
        if (collinfo) {

          UserData.count({}, function (err, count) {
            if (err) {
              return res.send("Document count error!");
            }

            if (count == 0) {
              res.send("Empty Document");
            } else {
              UserData.find({}, { _id: 0 }).sort({ _id: -1 }).limit(1).then(function (doc) {
                res.json(doc[0].BLOCK[0]);
              });
            }

            if (count == 10) {
              res.send("Delete One Document");
            }

          });

        } else {
          res.send("Empty Document");
        }
      });

    db.close();
  });
});

apiRoutes.get('/getDataDownload', function (req, res) {

  MongoClient.connect(url, function (err, db) {
    if (err) {
      return res.send("Cannot connect to DB");
    }

    db.listCollections({ name: 'Progress Claim' })
      .next(function (err, collinfo) {
        if (collinfo) {

          UserData.count({}, function (err, count) {
            if (err) {
              return res.send("Document count error!");
            }
            if (count == 0) {
              res.send("Empty Document");
            } else {
              UserData.find({}, { _id: 0 }).sort({ _id: -1 }).limit(1).then(function (doc) {
                res.json(doc[0].BLOCK[0]);
              });
            }
          });

        } else {
          res.send("Empty Document");
        }
      });

    db.close();
  });
});

apiRoutes.get('/getData', function (req, res) {

  MongoClient.connect(url, function (err, db) {
    if (err) {
      return res.send("Cannot connect to DB");
    }

    db.listCollections({ name: 'Progress Claim' })
      .next(function (err, collinfo) {
        if (collinfo) {

          UserData.count({}, function (err, count) {
            if (err) {
              return res.send("Document count error!");
            }
            if (count == 0) {
              res.send("Empty Document");
            } else {
              UserData.find({}, { _id: 0 }).sort({ _id: -1 }).limit(1).then(function (doc) {
                res.json(doc[0]);
              });
            }
          });

        } else {
          res.send("Empty Document");
        }
      });

    db.close();
  });
});


apiRoutes.delete('/deleteOneDocument', function (req, res) {

  UserData.findOneAndRemove({}, function (err, doc) {
    if (err)
      res.send(err);
    else
      res.status(200).send("OK");
  });
});

apiRoutes.post('/updateData', (req, res) => {

  updateStatus(url, req, res);

});

//#endregion API......................................................
app.use('/api', apiRoutes);

module.exports = { app };

//#region Wakeup.........................................................
setInterval(function () {

  var options = {
    method: 'GET',
    url: 'https://nameless-woodland-39537.herokuapp.com/address',
    headers:
      {
        'Postman-Token': '10efcda8-0468-3af7-60d4-faa4496a9195',
        'Cache-Control': 'no-cache'
      }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });

}, 900000); // every 15 minutes 

//#endregion..............



