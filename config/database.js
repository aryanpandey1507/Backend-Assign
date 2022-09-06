const mongoose = require('mongoose');
console.log(process.env.DB_URI)


const connectDB=()=>{

    mongoose.connect(process.env.DB_URI,{useNewUrlParser:true,useUnifiedTopology:true}).then((data)=>{
        console.log(`connected with server: ${data.connection.host}`);
   })
}

module.exports = connectDB;                                                                                 