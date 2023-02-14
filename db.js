//connecting db
var mongoose = require('mongoose');
var {Schema} = mongoose;
function db(){
  mongoose.set('strictQuery', false);
  mongoose.connect(process.env.DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true ,serverApi: ServerApiVersion.v1 })
  .then(() => console.log('Connected!'))
  .catch(err=> console.log(err));
}
module.exports = db;


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://iNote:<password>@cluster0.nz8yz9p.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });