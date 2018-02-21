var mongoose = require('mongoose');
var config = require('./config');

//var url = "mongodb://admin:Utno1985!@ds135757.mlab.com:35757/funding"

var url = config.database;

mongoose.connect(url, { useMongoClient: true });
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var userDataSchema = new Schema({ 
    DateTime: String,
    status: String,
    volume: String,
    size: String,
    ObjectId: String, 
    mark: String,
    LevelName: String    
	 
}, { collection: 'UpdateStatus' , versionKey: false});

var UserUpdateStatus = mongoose.model('UserUpdateStatus', userDataSchema);

module.exports = UserUpdateStatus;

