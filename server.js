const express = require('express');
const app = express();
const dotenv=require('dotenv');
const path = require('path');
dotenv.config({path:path.join(__dirname ,'config','config.env' )});
const connectDB = require('./config/database');
const user=require('./routes/routesUser');


console.log(path.join(__dirname ,'config','config.env' ));
connectDB();

app.use(express.json())

app.use('/api/v1',user);


app.listen(process.env.PORT,()=>{
    console.log(`listening on port no 8000`)
})