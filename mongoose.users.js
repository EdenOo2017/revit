var mongoose = require('mongoose');
var config = require('./config');

//var url = "mongodb://admin:Utno1985!@ds135757.mlab.com:35757/funding"

var url = config.database;

mongoose.connect(url, { useMongoClient: true });
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
    name: String, 
	password: String, 
	admin: Boolean  
}, { collection: 'ProgressClaimUser' , versionKey: false});

var UserAuthoData = mongoose.model('UserAuthoData', userDataSchema);

module.exports = UserAuthoData;


