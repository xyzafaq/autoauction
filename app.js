const express = require('express');
const cors=require('cors');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser')
const path = require('path'); // For working with file paths
app.use(cors());
app.use(cookieParser());
app.use(express.json());
require('./Database/connec')    //Database connected file
app.use(require('./pages/Pages'));  //Accessing router exported from Pages
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
const bodyParser = require('body-parser');
// set limit to 10MB
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

dotenv.config({path:'./config.env'});   //Giving path of config.env file
const PORT = 6605;   //Accessing PORT from env file

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
