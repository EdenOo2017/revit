var mongoose = require('mongoose');
var config = require('./config');

//var url = "mongodb://admin:Utno1985!@ds135757.mlab.com:35757/funding"

var url = config.database;

mongoose.connect(url, { useMongoClient: true });
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
    BLOCK: Array
}, { collection: 'Progress Claim', versionKey: false });

var UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData;


