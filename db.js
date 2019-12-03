const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
UserSchema.plugin(passportLocalMongoose);
mongoose.model('User', UserSchema);

// course in semester plan
// * must include name of course, rank, and semester
// * items can be filtered by rank and semester
const Course = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  name: {type: String, required: true},
  rank: {type: Number, min: 1, required: true},
  semester: {type: String, required: true}
});
mongoose.model("Courses", Course);

//add the code that connects to the database. We'll connect to the local
//instance of MongoDB, and we'll use a database called final-proj
mongoose.connect('mongodb://passAIT:AIT2018@ds051853.mlab.com:51853/final-proj');
