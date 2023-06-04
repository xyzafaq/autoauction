const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ProductModel = require('./ProductSchema');

const UserSchema = new mongoose.Schema({
    firstName:{
        type: String,
    },
    lastName:{
        type: String,
    },
    email:{
        type: String,
    },
    password:{
        type: String,
    },
    username:{
        type: String,
    },
    RegisteredDate:{
        type: Date,
        default: Date.now, 
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailTokens:[{type: String}],
    stripeVerified: {
        type: Boolean,
        default: false,
    },
    saved:[{ type: String }],
    consignmentPoints: {
        type: Number,
        default: 0,
    },
    consignmentTokens: [
        {
            token: String,
            firstName: String,
            lastName: String,
            carMake: String,
            carModel: String,
            notes: String,
            email: String,
            images: [{ type: String }],
            date:{
                type: Date,
                default: Date.now,
            }
        }
    ],
    consignments: [
        {
            price:String,
            year: String,
            make:String,
            model:String,
            located:String,
            mileage:String,
            owners:String,
            license:String,
            chassis:String,
            engineSize:String,
            engineType:String,
            transmission:String,
            speeds:String,
            exteriorColor:String,
            interiorColor:String,
            bodyworkDamage:String,
            paintworkDamage:String,
            discolouration :String,
            faults:String,
            cambelt:String,
            conditionOfTyres:String,
            notOriginalParts:String,
            customised:String,
            knownFaults:String,
            p3q1:String,
            p3q2:String,
            p3q3:String,
            p3q4:String,
            p3q5:String,
            p3q6:String,
            p3q7:String,
            p3q8:String,
            p3q9:String,
            p3q10:String,
            p3q11:String,
            p3q12:String,
            p3q13:String,
            image_urls:[{ type: String }],
            reference:{
                ref_token: String,
                firstName: String,
                lastName: String,
                carMake: String,
                carModel: String,
                notes: String,
                ref_images: [{ type: String }],
                date:{
                    type: Date,
                }
            },
            date:{
                type: Date,
                default: Date.now,
            }
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetPassAppliedDate: Date,
    Enquiries:[
        {
            firstName: String,
            lastName: String,
            email: String,
            phone: String,
            notification: Boolean,
            category: String,
            carMake: String,
            carModel: String,
            notes: String,
            images: [{ type: String }],
            date:{
                type: Date,
                default: Date.now,
            }
        }
    ],
    otp:[
        {
            code: Number,
            date: {
                type: Date,
                default: Date.now, 
            },
        }
    ],
    tokens: [
        {
            token: String,
        }
    ],
    cart: [
        {
            product: {},
        }
    ]
})

UserSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12);
    }
    next();
})
UserSchema.methods.generateAuthToken = async function(){
    const mytoken = jwt.sign({_id:this._id},"helloiamafaqstudentofuniversityofmanagementandtechonology")
    this.tokens = this.tokens.concat({token: mytoken});
    await this.save();
    return mytoken;
}
UserSchema.methods.addtocart = async function(product){
    this.cart = this.cart.concat({product});
    const resp = await this.save();
    if(resp){
        return resp;
    }
}

const UserModel = new mongoose.model('UserData',UserSchema);
module.exports = UserModel