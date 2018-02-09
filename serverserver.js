var express = require('express');
var cors = require('cors');
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
    
   res.send(doc[0]);
  });
});

app.put('/updateStatus', (req, res) => {

  var elementId = req.body.elementID;

  UserData.find({ PanelName: panelName }, function (err, doc) {

    if (doc.length === 0) {
      return res.status(404).send("Panel Name Not Found!");
    }

    var a = (doc[0].status);
    var b = (doc[0].PanelId);     

    if ((a + 1) == 1) {
      UserData.update({ PanelName: panelName }, { status: 1, submittedDate: calcTime() }, function (err, doc) {
        if (err) {
          return res.status(404).send("Update Fail!");
        }
        socket.broadcast.emit('status1', b);
        res.status(200).send("Update Succeeded!");
      });
    } else {
      if (a >= 1) {
        return res.status(404).send("Already Updated!");
      }
      return res.status(404).send("Update Fail!");
    }
  });

});

//#endregion

module.exports = { app };