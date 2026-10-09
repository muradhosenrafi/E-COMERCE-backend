const mongoose = require('mongoose');


const mongoos =()=>{

    mongoose.connect(`mongodb+srv://${process.env.DB_USERNAEM}:${process.env.DB_PASSWORD}@cluster0.stnjdhm.mongodb.net/test?appName=Cluster0`)
  .then(() => console.log('Connected!'));

}

module.exports=mongoos 