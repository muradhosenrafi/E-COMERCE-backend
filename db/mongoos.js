const mongoose = require('mongoose');


const mongoos =()=>{

    mongoose.connect(`mongodb+srv://OnlineEcomecrs:K4fQByZbI3zzCZuB@cluster0.stnjdhm.mongodb.net/test?appName=Cluster0`)
  .then(() => console.log('Connected!'));

}

module.exports=mongoos 