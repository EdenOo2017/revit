var mongoose = require('mongoose');
var url = "mongodb://admin:Utno1985!@ds135757.mlab.com:35757/funding"

mongoose.connect(url, { useMongoClient: true });
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
    BLOCK: Array,
 
}, { collection: 'revit' });

var UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData;


