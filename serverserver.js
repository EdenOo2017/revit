var express = require('express');
var cors = require('cors')
var bodyParser = require('body-parser');
var UserData = require('./mongoose.model');
var app = express();
const server = require('http').createServer(app)
const io = require('socket.io').listen(server);
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

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

//#region API......................................................

app.get('/getBlock', (req, res) => {
  UserData.find({},{ _id: 0}).then(function (doc) {
   // res.send(doc.map(document => document.BLOCK)); 
      
    var keys = Object.keys(doc[0].BLOCK);

   res.send(keys);
  });
});

//#endregion

module.exports = { app };