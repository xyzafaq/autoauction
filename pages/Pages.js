const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const router = express.Router();
const multer = require('multer');
router.use(express.json());
const UserModel = require('../Database/UserSchema');
const ProductModel = require('../Database/ProductSchema');
const Authentication = require('../pages/Authentication');
router.get('/',(req,res)=>{
    try {
        console.log('homePage started');
    // res.send('Home Page');
    } catch (error) {
        console.log(error);
    }
})
router.post('/signup',async (req,res)=>{
    try {
        console.log(req.body);
        const {name,email,password,confirmpassword,birthday} = req.body;
        if(!name || !email || !password){
            res.status(201).json({msg:"Please Fill all Fields"})
        }
        if(password !== confirmpassword){
            res.json('Password does not Match');
        }
        const checkUser = await UserModel.findOne({email:email});
        
        if(checkUser){
            return res.json({msg:'User Already Registered'})
        }else{
            const newUser = UserModel({name,email,password,birthday,totalbalance:0,ppstart:0,ppadvance:0,pppro:0,initialcapital:0,grancias:0,bloqueado:0,disponible:0,miembrostotale:0,derivadostotale:0,rangostotale:0,ultimorango:0,saldo:0,cartera:"",mymembresia:"",estrategia:"",ganaciasretirades:0,totaldisponible:0,pic:0,tc:0,membreciabtc500:0,membreciabtc1000:0,fullname:"",bankname:"",iban:"",phone:"",country:""});
            const result = await newUser.save();
            if(result){
                const token = await result.generateAuthToken();
                // res.cookie('jwttoken',token);
                // UserModel({isLoggedIn:true}).save();
                res.status(201).json({msg:'User Registered Successfuly.',authToken:token});
            }else{
                res.status(201).json({msg:'Failed to Register'});
            }
        }
    } catch (error) {
        console.log(error);
    }
})
router.post('/login',async (req,res)=>{
    // console.log(req.body);
    try {
        const {email,password} = req.body;
        if(!email || !password){
            res.send({msg:'Invalid Credentials'});
        }
        const result = await UserModel.findOne({email:email});
        if(!result){
            res.send({msg:'Invalid Credentials'});
        }else{
            const checkPassword = await bcrypt.compare(password,result.password);
            if(checkPassword){
                const token = await result.generateAuthToken();
                // res.cookie('jwttoken',token);
                if(result.email == "alan@admin.com"){
                    res.send({msg:"admin",authToken:token});
                }else{
                    res.send({user:result,authToken:token});
                }
            }else{
                res.send({msg:'Invalid Credentials'});
            }
        }
    } catch (error) {
        console.log(error);
    }
})
router.get('/isloggedin', async (req,res)=>{
    try {
        const token = req.header("authToken");
        if(token.length>10){
            const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
            const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
            if(rootUser){
                if(rootUser.email == "alan@admin.com"){
                    res.send({msg:"admin"});
                }else{
                    res.send({msg:"loggedin",data:rootUser});
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
})
router.get('/allUser', async(req,res)=>{
    try {
        const result = await UserModel.find();
        if(result){
            res.json(result);
        }
    } catch (error) {
        console.log(error);
    }
})
router.post('/updateUser/:id', async (req,res)=>{
    try {
        console.log(req.body);
        console.log(req.params.id);
        var id = req.params.id;
        const {name,email,totalbalance,ppstart,ppadvance,pppro,initialcapital,grancias,bloqueado,disponible,miembrostotale,derivadostotale,rangostotale,ultimorango,saldo,cartera,mymembresia,estrategia,ganaciasretirades,totaldisponible,pic,tc,membreciabtc500,membreciabtc1000} = req.body;
        console.log(id);
        const result = await UserModel.updateOne({_id:id},{ $set:{name,email,totalbalance,ppstart,ppadvance,pppro,initialcapital,grancias,bloqueado,disponible,miembrostotale,derivadostotale,rangostotale,ultimorango,saldo,cartera,mymembresia,estrategia,ganaciasretirades,totaldisponible,pic,tc,membreciabtc500,membreciabtc1000}})
        console.log(result);
        if(result){
            res.send({msg:"success"});
        }
    } catch (error) {
     console.log(error);   
    }
})
router.post('/bankinfo', async (req,res)=>{
    // console.log(req.body);
    try {
        const { fullname, bankname, iban, phone, country } = req.body;
        //const token = req.cookies.jwttoken;
        const token = req.header("authToken");
        // console.log(token);
        const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
        const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
        // console.log(rootUser);
        const result = await UserModel.updateOne({_id:rootUser._id},{ $set:{fullname, bankname, iban, phone, country}});
        // console.log(result);
        if(result){
            res.send({msg:"success"});
        }
    } catch (error) {
     console.log(error);   
    }
})
router.post('/withdrawrequest', async (req,res)=>{
    try {
        console.log(req.body);
        const { withdraw } = req.body;
        const token = req.header("authToken");
        // const token = req.cookies.jwttoken;
        const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
        const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
        // console.log(rootUser);
        // const result = await UserModel.updateOne({ _id: rootUser._id }, { $set: { withdraws: [] } });
        const result = await UserModel.findOne({ _id: rootUser._id},{withdraws: 1})
        // console.log(result.withdraws.length);
        if(result.withdraws.length == 0){
            const result2 = await UserModel.updateOne({_id:rootUser._id},{$push:{withdraws:{withdraw}}});
            if(result2){
                res.send({msg:"success"});
            }
        }else{
            res.send({msg:"already requestd"});
        }
    } catch (error) {
     console.log(error);   
    }
})
router.get('/AllwithdrawalRequests',async (req,res)=>{
    try {
        const results = await UserModel.find({}, { withdraws:1});
        // console.log(results);
        let withdrawalsArray = [];
        results.forEach((result) => {
        withdrawalsArray = withdrawalsArray.concat(result.withdraws);
        });
        // console.log(withdrawalsArray);
        if(results){
            res.send({msg: withdrawalsArray })
        }
    } catch (error) {
            console.log(error);
        }
})
router.post('/getuserdata',async (req,res)=>{
    try {
        const { id } = req.body;
        const result = await UserModel.findOne({_id:id});
        if(result){
            // console.log(result);
            res.send(result);
        }
    } catch (error) {
            console.log(error);
        }
})
router.get('/getuserdata/:id',async (req,res)=>{
    try {
        const result = await UserModel.findOne({_id: req.params.id });
        if(result){
            // console.log(result);
            res.send(result);
        }
    } catch (error) {
            console.log(error);
        }
})
router.get('/logout',async(req,res)=>{
    try {
        // const token = req.cookies.jwttoken;
        const token = req.header("authToken");
        const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
        const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
        if(rootUser){
            //res.clearCookie('jwttoken');
            res.send({msg:"loggedOut"});
        }
    } catch (error) {
        console.log(error);
    }
})
router.post('/addmember', async (req,res)=>{
    try {
        // console.log(req.body);    
        // const token = req.cookies.jwttoken;
        const token = req.header("authToken");
        const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
        const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});  // current active user
        
        const {name,email,password,confirmpassword,birthday} = req.body;
        if(!name || !email || !password){
            res.status(201).json({msg:"Please Fill all Fields"})
        }
        if(password !== confirmpassword){
            res.json('Password does not Match');
        }
        const checkUser = await UserModel.findOne({email:email});
        
        if(checkUser){
            return res.json({msg:'User Already Registered'})
        }else{
            const newUser = UserModel({name,email,password,birthday,totalbalance:0,ppstart:0,ppadvance:0,pppro:0,initialcapital:0,grancias:0,bloqueado:0,disponible:0,miembrostotale:0,derivadostotale:0,rangostotale:0,ultimorango:0,saldo:0,cartera:"",mymembresia:"",estrategia:"",ganaciasretirades:0,totaldisponible:0,pic:0,tc:0,membreciabtc500:0,membreciabtc1000:0,fullname:"",bankname:"",iban:"",phone:"",country:""});
            const result = await newUser.save();
            if(result){
                const result2 = await UserModel.updateOne({_id:rootUser._id},{$push:{members:{memberid:rootUser._id}}});
                if(result2){
                    res.send({msg:"success"});
                    // res.status(201).json({msg:'User Registered Successfuly.'});
                }
            }else{
                res.status(201).json({msg:'Failed to Register'});
            }
        }
    } catch (error) {
        console.log(error);
    }
})
router.post('/updatePassword',async(req,res)=>{
    try { 
        console.log(req.body);
        let {oldPassword,newPassword,confirmNewPassword} = req.body;
        if(!oldPassword || !newPassword || !confirmNewPassword){
            res.send({msg:"unfill"})
        }
        if(newPassword!=confirmNewPassword){
            res.send({msg:"NotMatching"})
        }
        if(newPassword.length<8){
            res.send({msg:"Password must contain 8 characters"})
        }
        // const token = req.cookies.jwttoken;
        const token = req.header("authToken");
        if( token.length > 10 ){
            const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
            const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
            const veriFyoldPassword = await bcrypt.compare(oldPassword,rootUser.password);
            if(veriFyoldPassword){
                newPassword = await bcrypt.hash(newPassword,12);
                // console.log(newPassword);
                const result = await UserModel.updateOne({_id:rootUser._id},{ $set:{ password:newPassword }})
                if(result){
                    res.send({msg:"success"})
                }
            }else{
                res.send({msg:"incorrect Password"});
            }
        }
    } catch (error) {
        console.log(error);
    }
})
router.get('/userData',async (req,res)=>{
    try {
        // const token = req.cookies.jwttoken;
        const token = req.header("authToken");
        //console.log(token.length);
        if(token.length>10){
            //console.log("TOKEN RECEIVED");
            const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
            const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
            if(rootUser){
                res.send(rootUser);
            }  
        } else{
            //console.log("TOKEN NOT RECEIVED");
        }
    } catch (error) {
        console.log(error);
    }    
})
router.get('/userData/:id',async (req,res)=>{
    try {
        // console.log(req.params.id);
        const result = await UserModel.findOne( { withdraws: { $elemMatch: { _id: req.params.id } } });
        // console.log(result);
        if(result){
            res.send({msg: result })
        }
    } catch (error) {
        console.log(error);
    }    
})
router.get('/deleteWithdrawReq/:id',async (req,res)=>{
    try {
        // console.log(req.params.id);
        const result = await UserModel.updateOne({ _id: req.params.id }, { $set: { withdraws: [] } });
        console.log(result);
        if(result){
            res.send({msg: "success" })
        }
    } catch (error) {
        console.log(error);
    }    
})
// router.post('/searchUser', async(req,res)=>{
//     try {
//         const {email} = req.body;
//         console.log(email);
//         const user = await UserModel.find({email});
//         res.send( { msg:"success", userdata: user } );
//     } catch (error) {
//         console.log(error)
//     }
// })

module.exports = router;