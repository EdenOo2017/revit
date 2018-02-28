var mongoose = require('mongoose');
var config = require('./config');

//var url = "mongodb://admin:Utno1985!@ds135757.mlab.com:35757/funding"

var url = config.database;

mongoose.connect(url, { useMongoClient: true });
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
    BLOCK: [{
        ProjectName: String,
        uploadDateTime: String,
        Level: [{
            levelName: String,
            Category: [{
                Column:[{
                    LevelName: String,
                    mark: String,
                    ObjectId: String,
                    size: String,
                    volume: String,
                    status: String,
                    DateTime: String
                }],
                Beam:[{
                    LevelName: String,
                    mark: String,
                    ObjectId: String,
                    size: String,
                    volume: String,
                    status: String,
                    DateTime: String
                }],
                StructuralFoundation:[{
                    LevelName: String,
                    mark: String,
                    ObjectId: String,
                    size: String,                   
                    status: String,
                    DateTime: String
                }]
            }]
        }]
    }]   
}, { collection: 'Progress Claim', versionKey: false });

var UserUpdateStatus = mongoose.model('UserUpdateStatus', userDataSchema);

module.exports = UserUpdateStatus;

