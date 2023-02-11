const jwt = require('jsonwebtoken');
const userModel = require('../Database/UserSchema');

const Authentication = async (req,res,next)=>{
    try {
            // console.log("authenticating");
        const token = req.cookies.jwttoken;  //Geting Cookie from google
        // console.log(token);
        const verifyToken = jwt.verify(token,"helloiamafaqstudentofuniversityofmanagementandtechonology");  //Giving ID of user with that token
        // console.log(verifyToken);
        const rootUser = await userModel.findOne({_id:verifyToken._id,"tokens.token":token});
        // console.log(rootUser);
        if(!rootUser){
            throw new Error('User Not Found');
        }
        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;
        next();
    } catch (error) {
        res.status(401).send({msg:'no token provided'});
    }
}

module.exports = Authentication;