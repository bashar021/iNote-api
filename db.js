//connecting db
const mongoose = require('mongoose');
const {Schema} = mongoose;
function db(){
  mongoose.connect(process.env.DB_URL)
  .then(() => console.log('Connected!'))
  .catch(err=> console.log(err));
}
module.exports = db;