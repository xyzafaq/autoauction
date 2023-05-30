const mongoose = require("mongoose")
const DB = process.env.CLOUD_DATABASE
mongoose.set('strictQuery', true);
// mongoose.connect("mongodb://localhost:27017/autoauction").then(()=>{console.log("Connection Successful")}).catch((error)=>{console.log(error)});
mongoose.connect("mongodb+srv://autoauction:autoauction@autoauction.din3buj.mongodb.net/?retryWrites=true&w=majority").then(()=>{console.log("Connection Successful")}).catch((error)=>{console.log(error)});
// Afaq Connection
// mongoose.connect("mongodb+srv://xyzafaq:1Afaqali@cluster0.isd73m5.mongodb.net/?retryWrites=true&w=majority").then(()=>{console.log("Connection Successful")}).catch((error)=>{console.log(error)});
// Alan Connection
// mongoose.connect("mongodb+srv://alan_mayorga:Inicio.123@cluster0.voy2njp.mongodb.net/?retryWrites=true&w=majority").then(()=>{console.log("Connection Successful")}).catch((error)=>{console.log(error)});
// mongoose.connect("mongodb+srv://alan:Inicio.123@multiplataforma.gxl8rti.mongodb.net/?retryWrites=true&w=majority").then(()=>{console.log("Connection Successful")}).catch((error)=>{console.log(error)});