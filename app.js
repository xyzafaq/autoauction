const cors=require('cors')
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser')
app.use(cors());
app.use(cookieParser());
app.use(express.json());
require('./Database/connec')    //Database connected file
app.use(require('./pages/Pages'));  //Accessing router exported from Pages

dotenv.config({path:'./config.env'});   //Giving path of config.env file
const PORT = process.env.PORT;   //Accessing PORT from env file

// if( process.env.NODE_ENV == "production"){
//     app.use(express.static("client/build"));
//     const path = require("path");
//     app.get("*",(req,res)=>{
//         res.sendFile(path.resolve(__dirname,'client','build','index.html'));
//     })
// }

app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`);
})