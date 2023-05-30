const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const router = express.Router();
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const crypto = require("crypto");

//Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'xyzafaq@gmail.com',
      pass: 'zkhqrvteqqandxtj'
    }
});
// Configure Cloudinary
cloudinary.config({
  cloud_name: 'def8v05xk',
  api_key: '167459688646891',
  api_secret: 'cRkeckeyHg2FkwApFJt25zNp8B0',
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

router.use(express.json());
// app.use(express.static('public'));
const UserModel = require('../Database/UserSchema');
const ArticleModel = require('../Database/ArticleSchema');
const EventsModel = require('../Database/EventsSchema');
const ProductModel = require('../Database/ProductSchema');
// const ArticleModel = require('../Database/ArticleSchema');
const Authentication = require('../pages/Authentication');

// Runs every day at midnight
router.get('/home',(req,res)=>{
    try {
        console.log('HomePage started');
        res.send('success');
    } catch (error) {
        console.log(error);
    }
})
router.post('/booking',(req,res)=>{
    try {
        console.log(req.body);
        console.log('HomePage started');
        res.send('success');
    } catch (error) {
        console.log(error);
    }
})
router.post('/signup',async (req,res)=>{
    try {
        console.log(req.body);
        const {firstName,lastName,email,username,password} = req.body;
        console.log(password);

        if(!firstName || !email || !password){
            res.status(201).json({msg:"Please Fill all Fields"})
        }
        const checkUser = await UserModel.findOne({email:email});
        
        if(checkUser){
            return res.json({msg:'User Already Registered'})
        }else{
            const newUser = UserModel({firstName,lastName,email,username,password});
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
        console.log(password);
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
                res.send({msg:'success',user:result,authToken:token});
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
                if(rootUser.email == 'afaqprince104@gmail.com' || rootUser.email == 'admin@gmail.com'){
                    res.send({msg:'admin',data:rootUser})
                }else{
                    res.send({msg:"loggedin",data:rootUser});
                }
            }
        }else{
            res.send({msg:"notloggedin"});
        }
    } catch (error) {
        console.log(error);
    }
})
// Admin Seller Queries
router.get('/allSellerQueries', async (req,res)=>{
    try {
        const token = req.header("authToken");
        if(token.length>10){
            const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
            const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
            if(rootUser.email === 'admin@gmail.com' || 'afaqprince104@gmail.com'){
                const result = await UserModel.aggregate([
                    {
                        $project: {
                            Enquiries: 1,
                            _id: 0
                        }
                    },
                    {
                        $unwind: "$Enquiries"
                    },
                    {
                        $sort: {
                            "Enquiries.date": -1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            Enquiries: { $push: "$Enquiries" }
                        }
                    }
                ]);
                if(result){
                    res.send({msg:'success',data:result})
                }                
            }
        }else{
            res.send({msg:"failed"});
        }
    } catch (error) {
        console.log(error);
    }
})
// User Submit Seller Query
router.post('/sellInquiry/:id',upload.array('images'), async (req,res)=>{
    try {
        // console.log(req.body);
        // console.log(req.params.id);
        // console.log(req.files);
        const {firstName,lastName,email,phone,category,carMake,carModel,notes} = req.body;
        const { files } = req;
        const urls = [];
        if(req.files){
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const result = await cloudinary.uploader.upload(file.path,{
                    transformation: { 
                        width: 500,
                        height: 300,
                        crop: "fill",
                        quality: "auto",
                        fetch_format: "auto",
                        progressive: true,
                    }
                });
                urls.push(result.secure_url);
            }
            // console.log(urls);
            const result2 = await UserModel.updateOne({ _id: req.params.id }, { $push: { Enquiries: {firstName,lastName,email,phone,category,carMake,carModel,notes,images:urls} } });
            if(result2){
                res.send({msg:'success'});
            }else{
                res.send({msg:'failed'});
            }
        }else{
            const result3 = await UserModel.updateOne({ _id: req.params.id }, { $push: { Enquiries: {firstName,lastName,email,phone,category,carMake,carModel,notes,images:[]} } });
            if(result3){
                res.send({msg:'success'});
            }else{
                res.send({msg:'failed'});
            }
        }
    } catch (error) {
        console.log(error);
    }
})
router.get('/deleteInquiry/:id', async (req,res)=>{
    try {
        console.log(req.params.id);
        const token = req.header("authToken");
        if( token.length > 10 ){
            const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
            const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
            if(rootUser.email === 'admin@gmail.com'){
                const result = await UserModel.updateMany(
                    { "Enquiries._id": req.params.id },
                    { $pull: { Enquiries: { _id: req.params.id } } }
                );
                if(result){
                    res.send({msg:'success'});
                }else{
                    res.send({msg:'failed'});
                }
            }else{
               console.log("Not Accessed");
                // res.send({msg:'Unauthorized request'});
           }
        }
    } catch (error) {
        console.log(error);
    }
})
router.post('/mydetails/:id', async (req,res)=>{
    try {
        console.log(req.body);
        var usernameChanged = '';
        var emailChanged = '';
        const newUsername = req.body.username;        
        const newEmail = req.body.email;        
        const user = await UserModel.findOne({_id:req.params.id});
        if(user){
            if(newUsername !== user.username){
                console.log('Changing Username');
                const updateUsername = await UserModel.updateOne({_id:req.params.id},{$set:{username:req.body.username}})
                if(updateUsername){
                    // res.send({msg:'successUsername'});
                    usernameChanged = 'usernameChanged';
                }
            }
            if(newEmail !== user.email){
                console.log('Changing email');
                const updateEmail = await UserModel.updateOne({_id:req.params.id},{$set:{email:req.body.email}})
                if(updateEmail){
                    // res.send({msg:'successEmail'});
                    emailChanged = 'emailChanged';
                }
            }
            res.send({usernameChanged:usernameChanged,emailChanged:emailChanged});
        }else{
            res.send({msg:'noUser'})
        }
    } catch (error) {
        console.log(error);
    }
})
router.post('/checkUniqueName', async (req,res)=>{
    try {
        console.log(req.body);
        // res.send({msg:'success'});
    } catch (error) {
        console.log(error);
    }
})
// Send email with verif button
router.get('/email-verify/:email', async (req,res)=>{
    try {
        console.log("sending");
        console.log(req.params.email);
        const token = crypto.randomBytes(20).toString("hex");      
        let htmlString = `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333; background-color: #f7f7f7; padding: 20px;">
            <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 30px;">
                <div style="font-size: 26px; font-weight: bold; margin-top: 0; margin-bottom: 10px; color: #EF9523; text-align: center;">Autoauction.com</div>
                <h1 style="font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #333; text-align: center;">Verify your Email</h1>
                <p style="margin: 0 0 10px; font-size: 16px;">Thank you for joining our auction platform and showing interest in bidding on exciting items. To ensure a secure and trustworthy bidding experience for all our users, we require email verification to activate your bidding privileges. By completing this process, you will gain full access to our auction listings and be able to participate in bidding.</p>
                <p style="margin: 0 0 10px; font-size: 16px;">Click the following button to verify your email</p>
                <a href="http://localhost:3000/verify-email/${token}" style="text-decoration: none; background-color: #EF9523; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; margin-bottom: 6px;">Verify Email</a>
            </div>
        </div>
        `;
        const mailOptions = {
            from: 'xyzafaq@gmail.com',
            to: req.params.email,
            subject: 'Please verify your email',
            html: htmlString
        };
        transporter.sendMail(mailOptions,async function(error, info){
            if (error) {
            console.log(error);
                res.send({msg:'failed'});
            } else {
                res.send({msg:'success'});
                console.log('Email sent:');
                await UserModel.findOneAndUpdate({email:req.params.email},{$push:{emailTokens: token }});
            }
        });
    } catch (error) {
        console.log(error);
    }

})
// verify email with params token
router.get('/email-verify-on-visit/:token', async (req,res)=>{
    try {
        // console.log(req.params.token);
        const user = await UserModel.findOneAndUpdate(
            { emailTokens: { $in: [req.params.token]}},
            { emailVerified: true },
            { new: true }
        );
        console.log(user);
        if(user){
            res.send({msg:'success'});
            user.emailTokens.pull(req.params.token);
            await user.save();
        }else{
            res.send({msg:'invalid'});
        }
    } catch (error) {
        console.log(error);
    }
})
router.post('/forgot-password', async (req,res)=>{
    try {
        console.log(req.body);
        const email = req.body.email;
        const user = await UserModel.findOne({email});
        // console.log(user);
        const now = Date.now();
        const expiresAt = user.resetPassAppliedDate.getTime();
        const thirtyMinutes = 10 * 60 * 1000;    //10 minutes      
        if(user){
            if (now > (expiresAt + thirtyMinutes)){
                const token = crypto.randomBytes(20).toString("hex");
                console.log(token);
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.resetPassAppliedDate = Date.now();
                const result = await user.save();
                if(result){
                    let htmlString = `
                        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333; background-color: #f7f7f7; padding: 20px;">
                            <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 30px;">
                                <div style="font-size: 26px; font-weight: bold; margin-top: 0; margin-bottom: 10px; color: #EF9523; text-align: center;">Autoauction.com</div>
                                <h1 style="font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #333; text-align: center;">Link for Resetting Password</h1>
                                <p style="margin: 0 0 10px; font-size: 16px;">Dear <span style="font-weight: 600; font-size: 16px;">${result.username},</span></p>
                                <p style="font-size: 16px;" >We are writing to inform you that we have received your request to reset your password. As requested, we are sending you a link to reset your password so that you can regain access to your account.</p>
                                <p style="margin-bottom: -10px; font-size: 16px;">Please click on the following link to reset your password:</p>
                                <a style="font-size: 14px;" href="http://localhost:3000/reset-password-link/${token}">http://localhost:3000/reset-password-link/${token}</a>
                                <p style="font-size: 14px;" >Please note that the link will expire in 24 hours. If you do not reset your password within this timeframe, you will need to request another password reset.</p>
                                <p style="font-size: 14px;" >If you did not request a password reset or if you believe your account has been compromised, please contact our support team immediately at <span style={{color: "#0a960a",fontWeight: "600"}}>soporte@multiplataformacapital.com</span>.</p>
                                <p style="font-size: 14px;" >Thank you for using our services. We appreciate your business and are committed to providing you with the best possible user experience.</p>
                                <p style="margin-bottom:'0'; font-size: 14px;" >Sincerely,</p>
                                <p style="font-size: 14px; font-weight: 600;" >Auto Auction</p>
                            </div>
                        </div>
                    `;
                    const mailOptions = {
                        from: 'xyzafaq@gmail.com',
                        to: result.email,
                        subject: `Reset Password Link Autoauction Account`,
                        html: htmlString
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                        console.log(error);
                        } else {
                        res.send({msg:'success'});
                        console.log('Email sent: ' + info.response);
                        }
                    });
                }
            }else{
                console.log("TIMEOUT");
                res.send({msg:'timeout'});
            } 
        }else{
            res.send({msg:'no user'});
        }

    } catch (error) {
        console.log(error);
    }
})
router.post('/reset-password-link/:token', async (req,res)=>{
    try {
        const {newPassword} = req.body;
        // console.log(newPassword);
        const token = req.params.token;
        const cryptedPassword = await bcrypt.hash(newPassword,12);        
        const tokenMatch = await UserModel.findOne({resetPasswordToken:token});
        if(tokenMatch){
            const updatePass = await UserModel.findOneAndUpdate(
            { resetPasswordToken: token },
            { $set: { password: cryptedPassword,resetPasswordToken: null,resetPasswordExpires:null } },
            { new: true }
            );
            if(updatePass){
                res.send({ msg: "success" });
            }else{
                res.send({ msg: "failed" })
            }
        }else{
            res.send({ msg: "failed" })
        }         
    } catch (error) {
        console.log(error);
    }
})
// Consignment form email
router.post('/consignmentForm',async (req,res)=>{
    try {
        // console.log(req.body);
        const token = crypto.randomBytes(20).toString("hex");
        const {to,subject,body,firstName,lastName,carMake,carModel,images,notes} = req.body;        
        let htmlString = `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333; background-color: #f7f7f7; padding: 20px;">
            <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 30px;">
                <div style="font-size: 26px; font-weight: bold; margin-top: 0; margin-bottom: 10px; color: #EF9523; text-align: center;">Autoauction.com</div>
                <h1 style="font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #333; text-align: center;">Invitation for Consignment Form</h1>
                <p style="margin: 0 0 10px; font-size: 16px;">${body}</p>
                <p style="margin: 0 0 10px; font-size: 16px;">Click the following button to submit Consignment Form</p>
                <a href="http://localhost:3000/consignment-form/${token}" style="text-decoration: none; background-color: #EF9523; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; margin-bottom: 6px;">Submit Consignment Form</a>
                <div style="font-size: 18px; font-weight:bold; color: green; margin-top: 2rem;">Application Refference</div>
                <div style="font-size: 16px;"> <span style="font-weight: bold;" >Car Make: </span>${carMake}</div>
                <div style="font-size: 16px;"> <span style="font-weight: bold;" >Car Model: </span>${carModel}</div>
                <div style="font-size: 16px;"> <span style="font-weight: bold;" >Submitted by: </span>${firstName +" "+ lastName}</div>
            </div>
        </div>
        `;
        const mailOptions = {
            from: 'xyzafaq@gmail.com',
            to: to,
            subject: subject,
            html: htmlString
        };
        transporter.sendMail(mailOptions,async function(error, info){
            if (error) {
            console.log(error);
                res.send({msg:'failed'});
            } else {
                res.send({msg:'success'});
                console.log('Email sent:');
                await UserModel.findOneAndUpdate({email:to},{$push:{consignmentTokens:{token,firstName,lastName,carMake,carModel,images,notes}},$inc:{consignmentPoints:1}});
            }
        });
    } catch (error) {
        console.log(error);
    }
})
// Consignment Form Submission UploadConsignment
router.post('/UploadConsignment/:token',upload.array('images'), async (req,res)=>{
    try {
        console.log(req.params.token);
        // Converting ref images to an array
        const imageArray = req.body.ref_images.split(',');
        const user = await UserModel.findOne({ "consignmentTokens.token": req.params.token,consignmentPoints: { $gt: 0 } },{email:1,_id:0});
        console.log(user);
        if(!user){
            res.send({msg:'notoken'});
            return;
        }
        const { files } = req;
        const image_urls = [];
    
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const result = await cloudinary.uploader.upload(file.path,{
              transformation: { 
                  width: 500,
                  height: 300,
                  crop: "fill",
                  quality: "auto",
                  fetch_format: "auto",
                  progressive: true,
              }
          });
          image_urls.push(result.secure_url);
        }
        const newConsignment = await UserModel.findOneAndUpdate(
            { "consignmentTokens.token": req.params.token },
            {
            $push: {
                consignments: {
                  price: req.body.price,
                  year: req.body.year,
                  make: req.body.make,
                  model: req.body.model,
                  located: req.body.located,
                  mileage: req.body.mileage,
                  owners: req.body.owners,
                  license: req.body.license,
                  chassis: req.body.chassis,
                  engineSize: req.body.engineSize,
                  engineType: req.body.engineType,
                  transmission: req.body.transmission,
                  speeds: req.body.speeds,
                  exteriorColor: req.body.exteriorColor,
                  interiorColor: req.body.interiorColor,
                  bodyworkDamage: req.body.bodyworkDamage,
                  paintworkDamage: req.body.paintworkDamage,
                  discolouration: req.body.discolouration,
                  faults: req.body.faults,
                  cambelt: req.body.cambelt,
                  conditionOfTyres: req.body.conditionOfTyres,
                  notOriginalParts: req.body.notOriginalParts,
                  customised: req.body.customised,
                  knownFaults: req.body.knownFaults,
                  p3q1: req.body.p3q1,
                  p3q2: req.body.p3q2,
                  p3q3: req.body.p3q3,
                  p3q4: req.body.p3q4,
                  p3q5: req.body.p3q5,
                  p3q6: req.body.p3q6,
                  p3q7: req.body.p3q7,
                  p3q8: req.body.p3q8,
                  p3q9: req.body.p3q9,
                  p3q10: req.body.p3q10,
                  p3q11: req.body.p3q11,
                  p3q12: req.body.p3q12,
                  p3q13: req.body.p3q13,
                  image_urls: image_urls,
                  reference: {
                    carMake:req.body.carMake,
                    carModel:req.body.carModel,
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                    notes:req.body.notes,
                    date:req.body.date,
                    ref_token:req.body.ref_token,
                    ref_images: imageArray,
                  },
                },
            },
            $inc: {
                consignmentPoints: -1
            },
            $pull: {
                consignmentTokens: {
                  token: req.params.token
                }
            },
            },
            { new: true }
        );
        if(newConsignment){
            res.send({msg:'success'});
        }else{
            res.send({msg:'failed'});
        }
    } catch (error) {
        console.log(error);
    }
})
// Retrieve token reference for token generated to submit consignment
router.get('/RetrieveTokenReference/:token',async (req,res)=>{
    try {
        const {token} = req.params;
        const result = await UserModel.findOne({ "consignmentTokens.token": token },{ "consignmentTokens.$": 1 });
        // console.log(result.consignmentTokens[0]);
        if(result){
            res.send({msg:"success",data:result.consignmentTokens[0]});
        }else{
            res.send({msg:"failed"});
        }
    } catch (error) {
        console.log(error);
    }
})
router.post('/SendEmail',async (req,res)=>{
    try {
        // console.log(req.body);
        const {to,subject,body,firstName,lastName,carMake,carModel} = req.body;
        let htmlString = `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333; background-color: #f7f7f7; padding: 20px;">
            <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 30px;">
                <div style="font-size: 26px; font-weight: bold; margin-top: 0; margin-bottom: 10px; color: #EF9523; text-align: center;">Autoauction.com</div>
                <h1 style="font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #333; text-align: center;">More Information Required</h1>
                <p style="margin: 0 0 10px; font-size: 16px;">${body}</p>
                <div style="font-size: 18px; font-weight:bold; color: green;" >Application Refference</div>
                <div style="font-size: 16px;"> <span style="font-weight: bold;" >Car Make: </span>${carMake}</div>
                <div style="font-size: 16px;"> <span style="font-weight: bold;" >Car Model: </span>${carModel}</div>
                <div style="font-size: 16px;"> <span style="font-weight: bold;" >Submitted by: </span>${firstName +" "+ lastName}</div>
            </div>
        </div>
        `;
        const mailOptions = {
            from: 'xyzafaq@gmail.com',
            to: to,
            subject: subject,
            html: htmlString
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            res.send({msg:'failed'});
            } else {
            res.send({msg:'success'});
            console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log(error);
    }
})
// Article Api
router.post('/UploadArticle', upload.array('images'), async (req, res) => {
    try {
      const { by, title, category, para1, para2, para3, para4 } = req.body;
      const { files } = req;
      const urls = [];
  
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await cloudinary.uploader.upload(file.path,{
            transformation: { 
                width: 500,
                height: 300,
                crop: "fill",
                quality: "auto",
                fetch_format: "auto",
                progressive: true,
            }
        });
        urls.push(result.secure_url);
      }
      console.log(urls);
  
      const newArticle = await ArticleModel({ by, title, category, para1, para2, para3, para4, images: urls });
      const result = await newArticle.save();
  
      if (result) {
        res.send({ msg: 'success' });
      } else {
        res.send({ msg: 'failed' });
      }
    } catch (error) {
      console.log(error);
    }
});
// Product Page Api
router.post('/UpdateProduct/:id', upload.fields([{ name: 'image', maxCount: 1 },{ name: 'images1', maxCount: 50 },{ name: 'images2', maxCount: 50 },{ name: 'images3', maxCount: 50 },{ name: 'images4', maxCount: 50 }]), async (req, res) => {
    try {
        
        const { title,VIN,userEmail,category,duration,startPrice,price,side,country,OdometerReading,unit,TransmissionType,color,EngineDisplacement,VIP,ModelNumber,lotNumber,saleType,summary,youtubeLink,thumbnail } = req.body;        
        const keyFactors = req.body.keyFactors.split(',');
        const equipmenatAndFeatures = req.body.equipmenatAndFeatures.split(',');
        const condition = req.body.condition.split(',');
        const serviceHistory = req.body.serviceHistory.split(',');
        // Access the uploaded files
        //const imageFile = req.files['image'] ? req.files['image'][0] : null;  //Thumbnail
        //const images1 = req.files['images1']; // Array of files for images1 field
        //const images2 = req.files['images2']; // Array of files for images2 field
        //const images3 = req.files['images3']; // Array of files for images3 field
        //const images4 = req.files['images4']; // Array of files for images4 field        
        // upload and save secure_url in array
        var imageurl = '';
        // const file = imageFile;
        // const result = await cloudinary.uploader.upload(file.path,{
            // transformation: { 
            //     width: 500,
            //     height: 300,
            //     crop: "fill",
            //     quality: "auto",
            //     fetch_format: "auto",
            //     progressive: true,
            // }
        // });
        // imageurl = result.secure_url;
        
        // upload and save secure_url in array
        // const images1urls = [];
        // for (let i = 0; i < images1.length; i++) {
        // const file = images1[i];
        // const result = await cloudinary.uploader.upload(file.path,{
            // transformation: { 
            //     width: 500,
            //     height: 300,
            //     crop: "fill",
            //     quality: "auto",
            //     fetch_format: "auto",
            //     progressive: true,
            // }
        // });
        // images1urls.push(result.secure_url);
        // }
        
        // upload and save images2 secure_url in array
        // const images2urls = [];
        // for (let i = 0; i < images2.length; i++) {
        // const file = images2[i];
        // const result = await cloudinary.uploader.upload(file.path,{
            // transformation: { 
                // width: 500,
                // height: 300,
                // crop: "fill",
                // quality: "auto",
                // fetch_format: "auto",
                // progressive: true,
            // }
        // });
        // images2urls.push(result.secure_url);
        // }
        // upload and save images3 secure_url in array
        // const images3urls = [];
        // for (let i = 0; i < images3.length; i++) {
        // const file = images3[i];
        // const result = await cloudinary.uploader.upload(file.path,{
            // transformation: { 
            //     width: 500,
            //     height: 300,
            //     crop: "fill",
            //     quality: "auto",
            //     fetch_format: "auto",
            //     progressive: true,
            // }
        // });
        // images3urls.push(result.secure_url);
        // }
        // upload and save images3 secure_url in array
        // const images4urls = [];
        // for (let i = 0; i < images4.length; i++) {
        // const file = images4[i];
        // const result = await cloudinary.uploader.upload(file.path,{
            // transformation: { 
            //     width: 500,
            //     height: 300,
            //     crop: "fill",
            //     quality: "auto",
            //     fetch_format: "auto",
            //     progressive: true,
            // }
        // });
        // images4urls.push(result.secure_url);
        // }
        // const newProduct = ProductModel({title,VIN,userEmail,category,duration,startPrice,price,side,country,OdometerReading,unit,TransmissionType,color,
        //     EngineDisplacement,VIP,ModelNumber,lotNumber,saleType,summary,youtubeLink,keyFactors,equipmenatAndFeatures,condition,serviceHistory
        // });
        // const ProductUploaded = await newProduct.save();
        const updatedProduct = await ProductModel.findOneAndUpdate(
            { _id: req.params.id },
            {
              title,VIN,userEmail,category,duration,startPrice,price,side,country,OdometerReading,unit,TransmissionType,color,EngineDisplacement,
              VIP,ModelNumber,lotNumber,saleType,summary,youtubeLink,keyFactors,equipmenatAndFeatures,condition,serviceHistory
            },
            { new: true }
          );
        if(updatedProduct){
            res.send({msg:'success'});
        }else{
            res.send({msg:'failed'});
        }
    } catch (error) {
      console.log(error);
    }
});
// Product Page Api
router.post('/UploadProduct', upload.fields([{ name: 'image', maxCount: 1 },{ name: 'images1', maxCount: 50 },{ name: 'images2', maxCount: 50 },{ name: 'images3', maxCount: 50 },{ name: 'images4', maxCount: 50 }]), async (req, res) => {
    try {
        const { title,VIN,userEmail,category,duration,startPrice,price,side,country,OdometerReading,unit,TransmissionType,color,EngineDisplacement,VIP,ModelNumber,lotNumber,saleType,summary,youtubeLink,thumbnail } = req.body;        
        const keyFactors = req.body.keyFactors.split(',');
        const equipmenatAndFeatures = req.body.equipmenatAndFeatures.split(',');
        const condition = req.body.condition.split(',');
        const serviceHistory = req.body.serviceHistory.split(',');
        // Access the uploaded files
        const imageFile = req.files['image'] ? req.files['image'][0] : null;  //Thumbnail
        const images1 = req.files['images1']; // Array of files for images1 field
        const images2 = req.files['images2']; // Array of files for images2 field
        const images3 = req.files['images3']; // Array of files for images3 field
        const images4 = req.files['images4']; // Array of files for images4 field        
        // upload and save secure_url in array
        var imageurl = '';
        const file = imageFile;
        const result = await cloudinary.uploader.upload(file.path);
        imageurl = result.secure_url;
        // upload and save secure_url in array
        const images1urls = [];
        for (let i = 0; i < images1.length; i++) {
        const file = images1[i];
        const result = await cloudinary.uploader.upload(file.path,{
            transformation: { 
                width: 500,
                height: 300,
                crop: "fill",
                quality: "auto",
                fetch_format: "auto",
                progressive: true,
            }
        });
        images1urls.push(result.secure_url);
        }
        // upload and save images2 secure_url in array
        const images2urls = [];
        for (let i = 0; i < images2.length; i++) {
        const file = images2[i];
        const result = await cloudinary.uploader.upload(file.path,{
            transformation: { 
                width: 500,
                height: 300,
                crop: "fill",
                quality: "auto",
                fetch_format: "auto",
                progressive: true,
            }
        });
        images2urls.push(result.secure_url);
        }
        // upload and save images3 secure_url in array
        const images3urls = [];
        for (let i = 0; i < images3.length; i++) {
        const file = images3[i];
        const result = await cloudinary.uploader.upload(file.path,{
            transformation: { 
                width: 500,
                height: 300,
                crop: "fill",
                quality: "auto",
                fetch_format: "auto",
                progressive: true,
            }
        });
        images3urls.push(result.secure_url);
        }
        // upload and save images3 secure_url in array
        const images4urls = [];
        for (let i = 0; i < images4.length; i++) {
        const file = images4[i];
        const result = await cloudinary.uploader.upload(file.path,{
            transformation: { 
                width: 500,
                height: 300,
                crop: "fill",
                quality: "auto",
                fetch_format: "auto",
                progressive: true,
            }
        });
        images4urls.push(result.secure_url);
        }
        const endTime = new Date().getTime() + duration * 24 * 60 * 60 * 1000;
        const newProduct = ProductModel({title,VIN,userEmail,category,duration,startPrice,price,side,country,OdometerReading,unit,TransmissionType,color,EngineDisplacement,VIP,ModelNumber,lotNumber,saleType,summary,youtubeLink,thumbnail:imageurl,
            keyFactors,equipmenatAndFeatures,condition,serviceHistory,exteriorImages: images1urls, interiorImages: images2urls, mechanicalImages: images3urls, documentsImages: images4urls,
            bids: [
                {
                  email: "admin@gmail.com",
                  username: "admin",
                  country: "Dubai",
                  price: startPrice,
                  automatic: true
                }
            ], endTime
        });
        const ProductUploaded = await newProduct.save();
        if(ProductUploaded){
            res.send({msg:'success'});
        }else{
            res.send({msg:'failed'});
        }
    } catch (error) {
      console.log(error);
    }
});
router.get('/fetchAllProducts', async(req,res)=>{
    try {
        const result = await ProductModel.find({}).sort({ endTime: 'desc' });
        // console.log(result);
        if(result){
            res.send({msg:"success",data:result});
        }
    } catch (error) {
        console.log(error);
    }
})
router.get('/allHomeProducts', async (req,res)=>{
    try {
        const products = await ProductModel.find({}).sort({ endTime: 'asc' });
        const currentTime = new Date().getTime();        
        const productsWithRemainingTime = products.filter((product) => {
          const endTime = new Date(product.date).getTime() + product.duration * 24 * 60 * 60 * 1000;
          return endTime > currentTime;
        });
        res.send({ msg: 'success', data: productsWithRemainingTime });
    } catch (error) {
        console.log(error);
    }
})
router.get('/getProductByTitle/:title', async (req,res)=>{
    try {
        const {title} = req.params;
        const product = await ProductModel.findOne({title});
        res.send({msg:'success',data:product});
    } catch (error) {
        console.log(error);
    }
})
// router.get('/allArticles', async (req,res)=>{
//     try {
//         const token = req.header("authToken");
//         if(token.length>10){
//             const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
//             const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
//             if(rootUser.email === 'admin@gmail.com' ){
//                 const articles = await ArticleModel.find({}).sort({ date: 'desc' });               
//                 res.send({msg:'success',data:articles});
//             }
//         }else{
//             res.send({msg:"failed"});
//         }
//     } catch (error) {
//         console.log(error);
//     }
// })
router.get('/allArticles', async (req,res)=>{
    try {
        const articles = await ArticleModel.find({}).sort({ date: 'desc' });               
        res.send({msg:'success',data:articles});
    } catch (error) {
        console.log(error);
    }
})
router.get('/getArticleByTitle/:title', async (req,res)=>{
    try {
        const {title} = req.params;
        const article = await ArticleModel.findOne({title});
        res.send({msg:'success',data:article});
    } catch (error) {
        console.log(error);
    }
})
router.post('/UpdateArticle/:id', async (req,res)=>{
    try {
        const {by,title,category,para1,para2,para3,para4} = req.body; 
        const token = req.header("authToken");
        console.log(req.params.id);
        if(token.length>10){
            const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
            const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
            if(rootUser.email === 'admin@gmail.com' ){
                const updateArticle = await ArticleModel.findByIdAndUpdate({_id: req.params.id}, { by, title,category, para1,para2,para3,para4 }, { new: true });
                if(updateArticle){
                    res.send({msg:'success'});
                }else{
                    res.send({msg:'failed'});
                }
            }
        }else{
            res.send({msg:"failed"});
        }
    } catch (error) {
        console.log(error);
    }
})
router.get('/deleteArticles/:id', async (req,res)=>{
    try {
        const token = req.header("authToken");
        if(token.length>10){
            const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
            const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
            if(rootUser.email === 'admin@gmail.com' ){
                const deleteArticle = await ArticleModel.findByIdAndDelete(req.params.id);
                if(deleteArticle){
                    res.send({msg:'success'});
                }else{
                    res.send({msg:'failed'});
                }
            }
        }else{
            res.send({msg:"failed"});
        }
    } catch (error) {
        console.log(error);
    }
})
// Events Page
router.post('/UploadEvents', upload.array('images'), async (req, res) => {
    try {
      const { by, title, para1, para2, para3, para4 } = req.body;
      const { files } = req;
      const urls = [];
  
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await cloudinary.uploader.upload(file.path,{
            transformation: { 
                width: 500,
                height: 300,
                crop: "fill",
                quality: "auto",
                fetch_format: "auto",
                progressive: true,
            }
        });
        urls.push(result.secure_url);
      }
  
      const newEvent = await EventsModel({ by, title, para1, para2, para3, para4, images: urls });
      const result = await newEvent.save();
  
      if (result) {
        res.send({ msg: 'success' });
      } else {
        res.send({ msg: 'failed' });
      }
    } catch (error) {
      console.log(error);
    }
});
router.get('/allEvents', async (req,res)=>{
    try {
        const articles = await EventsModel.find({}).sort({ date: 'desc' });               
        res.send({msg:'success',data:articles});
    } catch (error) {
        console.log(error);
    }
})
router.get('/getEventsByTitle/:title', async (req,res)=>{
    try {
        const {title} = req.params;
        const event = await EventsModel.findOne({title});
        const otherEvents = await EventsModel.find().sort({ date: 'desc' }).limit(4);
        res.send({msg:'success',data:event,otherEvents:otherEvents});
    } catch (error) {
        console.log(error);
    }
})
router.post('/UpdateEvents/:id', async (req,res)=>{
    try {
        const {by,title,para1,para2,para3,para4} = req.body; 
        const token = req.header("authToken");
        console.log(req.params.id);
        if(token.length>10){
            const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
            const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
            if(rootUser.email === 'admin@gmail.com' ){
                const updateEvent = await EventsModel.findByIdAndUpdate({_id: req.params.id}, { by, title, para1,para2,para3,para4 }, { new: true });
                if(updateEvent){
                    res.send({msg:'success'});
                }else{
                    res.send({msg:'failed'});
                }
            }
        }else{
            res.send({msg:"failed"});
        }
    } catch (error) {
        console.log(error);
    }
})
router.get('/deleteEvents/:id', async (req,res)=>{
    try {
        const token = req.header("authToken");
        if(token.length>10){
            const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
            const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
            if(rootUser.email === 'admin@gmail.com' ){
                const deleteEvent = await EventsModel.findByIdAndDelete(req.params.id);
                if(deleteEvent){
                    res.send({msg:'success'});
                }else{
                    res.send({msg:'failed'});
                }
            }
        }else{
            res.send({msg:"failed"});
        }
    } catch (error) {
        console.log(error);
    }
})
// Admin Consignment Page
router.get('/getAllConsignments', async (req,res)=>{
    try {
        const token = req.header("authToken");
        if(token.length>10){
            const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
            const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
            if(rootUser.email === 'admin@gmail.com' || 'afaqprince104@gmail.com'){
                const result = await UserModel.aggregate([
                    {
                        $project: {
                            consignments: 1,
                            _id: 0
                        }
                    },
                    {
                        $unwind: "$consignments"
                    },
                    {
                        $sort: {
                            "consignments.date": -1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            consignments: { $push: "$consignments" }
                        }
                    }
                ]);
                // console.log(result);
                if(result){
                    res.send({msg:'success',data:result})
                }                
            }
        }else{
            res.send({msg:"failed"});
        }
    } catch (error) {
        console.log(error);
    }
})

// Place Bids by user
// router.post('/placeBid', async (req,res)=>{
//     const { price,ProductId,email,username } = req.body;
//     const newBid = {
//         email: email,
//         username: username,
//         price: price,
//         automatic: false,
//     };
//     const result = await ProductModel.findByIdAndUpdate(
//         ProductId,
//         {
//           $push: { bids: { $each: [newBid], $position: 0 } },
//         },
//         { new: true }
//     );
//     if(result){
//         console.log('sucess');
//         res.send({msg:'success'});
//     }else{
//         console.log('failed');
//         res.send({msg:'failed'});
//     }
// })
router.post('/placeBid', async (req, res) => {
    try {
        const { price, ProductId, email, username } = req.body;
        const newBid = {
          email: email,
          username: username,
          price: price,
          automatic: false,
        };
        // Check if the new bid price is greater than all existing bids
        const product = await ProductModel.findById(ProductId);
        const highestBid = product.bids.length > 0 ? product.bids[0].price : 0;
    
        if (price > highestBid) {
             const result = await ProductModel.findByIdAndUpdate(
              ProductId,
              {
                $push: { bids: { $each: [newBid], $position: 0 } },
              },
              { new: true }
            );
            if (result) {
              console.log('success');
              res.send({ msg: 'success' });
            } else {
              console.log('failed');
              res.send({ msg: 'failed' });
            }
        } else {
          res.send({ msg:'invalid'});
          console.log('invalid');
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/save-product/:id', async (req, res)=>{
    try {
        const {userId} = req.body;
        const save = await UserModel.findOneAndUpdate({_id:userId},{$push:{saved:req.params.id}});
        // console.log(save);
        if(save){
            res.send({msg:'success'})
        }else{
            res.send({msg:'failed'})
        }
    } catch (error) {
        console.log(error);
    }
})
// params id is id of event
router.post('/eventRegistry/:id',upload.single('image'), async (req,res)=>{ 
    try {
        // console.log(req.body);
        // console.log(req.params.id);
        // console.log(req.file);
        const {name,email,phone,vehicle,registration,instagram,notes} = req.body;
        const dublicate = await EventsModel.findOne({_id: req.params.id, "participants.email": email });
        // console.log(dublicate);
        if(dublicate){
            res.send({msg:"dublicate"});
            return
        }
        if(req.file){
            // console.log("File Included");
            const result = await cloudinary.uploader.upload(req.file.path);
            if(result){
                const result2 = await EventsModel.updateOne(
                    { _id: req.params.id },
                    {
                      $push: {
                        participants: {
                          $each: [{ name, email, phone, vehicle, registration, instagram, notes, img_url: result.url }],
                          $position: 0
                        }
                      }
                    }
                  );                  
                if(result2){
                    res.send({msg:'success'});
                }else{
                    res.send({msg:'failed'});
                }
            }
        }else{
            // console.log("File not Included");
            const result3 = await EventsModel.updateOne(
                { _id: req.params.id },
                {
                  $push: {
                    participants: {
                      $each: [{ name, email, phone, vehicle, registration, instagram, notes, img_url: ''}],
                      $position: 0
                    }
                  }
                }
              );             
            if(result3){
                res.send({msg:'success'});
            }else{
                res.send({msg:'failed'});
            }
        }
        // res.send({msg:'success'});
    } catch (error) {
        console.log(error);
    }
})
router.get('/fetchAllUsers', async(req,res)=>{
    try {
        const result = await UserModel.find({ email: { $ne: 'admin@gmail.com' } });
        // console.log(result);
        if(result){
            res.send({msg:"success",data:result});
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
router.post('/updatePassword',async(req,res)=>{
    try { 
        let {oldPassword,newPassword,confirmNewPassword} = req.body;
        if(!oldPassword || !newPassword || !confirmNewPassword){
            res.send({msg:"unfill"});
        }else if(newPassword!=confirmNewPassword){
            res.send({msg:"NotMatching"});
        }else if(newPassword.length<8){
            res.send({msg:"Password must contain 8 characters"});
        }else{
            const token = req.header("authToken");
            if( token.length > 10 ){
                const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");
                const rootUser = await UserModel.findOne({_id:verifyToken._id,"tokens.token":token});
                const veriFyoldPassword = await bcrypt.compare(oldPassword,rootUser.password);
                if(veriFyoldPassword){
                    newPassword = await bcrypt.hash(newPassword,12);
                    const result = await UserModel.updateOne({_id:rootUser._id},{ $set:{ password:newPassword }})
                    if(result){
                        res.send({msg:"success"})
                    }
                }else{
                    res.send({msg:"incorrect Password"});
                }
            }   
        }                
    } catch (error) {
        console.log(error);
    }
})
router.post('/updatePasswordOTP/:id',async(req,res)=>{
    try { 
        let {otp,newPassword,confirmNewPassword} = req.body;
        console.log(req.body);
        if(!otp || !newPassword || !confirmNewPassword){
            res.send({msg:"unfill"});
        }else if(newPassword!=confirmNewPassword){
            res.send({msg:"NotMatching"});
        }else if(newPassword.length<8){
            res.send({msg:"Password must contain 8 characters"});
        }else{            
             console.log(req.params.id);
            const user = await UserModel.findOne({email:req.params.id});
            if(user){
                if(user.otp[0].code == otp ){
                    console.log("MATCHED")
                    newPassword = await bcrypt.hash(newPassword,12);
                    const result = await UserModel.updateOne({_id:user._id},{ $set:{ password:newPassword, otp:[] }});
                    console.log(result)
                    if(result){
                        res.send({msg:"success"})
                    }
                }else{
                    //console.log("Not MATCHED")
                    res.send({msg:"invalid"});
                }
            }
        }                
    } catch (error) {
        console.log(error);
    }
})
router.post('/checkUser',async(req,res)=>{
    try { 
        //console.log(req.body);
        const checkUser = await UserModel.findOne({email:req.body.email});
        if(checkUser){
            let OTP = Math.floor(Math.random() * 900000) + 100000;
            // OTP = OTP.toString();
            // const saveOTP = await UserModel.updateOne({_id:checkUser._id},{$push:{otp:{code:OTP}}});
            const saveOTP = await UserModel.findOneAndUpdate(
                { _id: checkUser._id },
                { $push: { otp: { $each: [{ code: OTP }], $position: 0 } } },
                { new: true }
              );                         
            let htmlString=`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>One-Time Password for Password Reset</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 16px;
                        line-height: 1.5;
                        color: #333333;
                        background-color: #f2f2f2;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        margin: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 5px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .btn {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #ef9523;
                        color: white;
                        text-decoration: none;
                        border-radius: 3px;
                        border: none;
                        cursor: pointer;
                        box-shadow: 0 2px 4px #ef9523;
                        transition: background-color 0.2s ease-in-out;
                    }                    
                </style>
            </head>
            <body>
                <div class="container">
                    <div style="font-size: 26px; font-weight: bold; margin-top: 0; color: #EF9523; text-align: center;">Multiplataforma-capital.com</div>
                    <h1 style="font-size: 22px;" >One-Time Password for Password Reset</h1>
                    <p style="font-size: 16px;" >Dear <span style="font-weight:600;" >${checkUser.name}</span> ,</p>
                    <p style="font-size: 16px;" >We have received a request to reset the password for your account associated with ${checkUser.email}. To proceed with the password reset, please use the following One-Time Password (OTP):</p>
                    <p style="font-size: 24px; font-weight: bold; color: #ef9523;">${OTP}</p>
                    <p style="font-size: 16px;" >Please note that this OTP is valid only for a limited period and should not be shared with anyone. To reset your password, please enter the OTP on the password reset page.</p>
                    <p style="font-size: 16px;" >If you did not request this password reset, please contact our support team immediately.</p>
                    <a style="color: white;" href="https://multiplataforma-capital.com/updatepassword" class="btn">Reset Password</a>
                    <p style="font-size: 16px;" >Thank you for using our service.</p>
                    <p style="font-size: 16px;" >Best regards,</p>
                    <p style="font-size: 16px;" >Multiplataforma-capital</p>
                </div>
            </body>
            </html>            
            `     
            const mailOptions = {
                from: 'xyzafaq@gmail.com',
                to: checkUser.email,
                subject: `Password Reset with One-Time-Password (OTP)`,
                html: htmlString
            };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                console.log(error);
                } else {
                console.log('Email sent: ' + info.response);
                }
            });
            res.send({msg:'valid'});
        }else{
            res.send({msg:'invalid'});
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
router.post('/searchUser', async(req,res)=>{
    try {
        const {email} = req.body;
        console.log(email);
        const user = await UserModel.find({email});
        if(user){
            res.send( { msg:"success", userdata: user } );
        }else{
            res.send({msg:'not found'});
        }
    } catch (error) {
        console.log(error)
    }
})
module.exports = router;