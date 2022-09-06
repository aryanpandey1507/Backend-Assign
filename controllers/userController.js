const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require('../middleware/catchAsyncErrors.js');
const User= require('../models/userModel');

const sendToken = require("../utils/JWTtoken");
const sendEmail= require('../utils/sendEmail.js');
const crypto = require('crypto'); 



//register a user
exports.registerUser=catchAsyncErrors(async(req,res,next)=>{

    
    const {name, email , password} = req.body;
    
    const user= await User.create({
        name, 
        email,  
        password,
       
        })

     sendToken(user,201,res);

    
});


//login user
exports.loginUser=catchAsyncErrors(async(req,res,next)=>{

    const {email , password} = req.body;
   

    if(!email || !password)
    {
        return next(new ErrorHandler("Please Enter email and password" , 400));
    }

    const user = await User.findOne({email}).select("+password");
    //console.log(user);

    if(!user)
    {
        return next(new ErrorHandler("Invalid Email or password",401));
    }

    const isPasswordMatched=  await user.comparePassword(password);

    if(!isPasswordMatched)
    {
        return next(new ErrorHandler("Invalid Email or password",401));
    }



    sendToken(user,200 , res);


})



//Logout user

exports.logout=catchAsyncErrors(async(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success:"true",
        message:"Logged out"
    })
})


//Forget Password 

exports.forgotPassword = catchAsyncErrors(async (req,res,next)=>{

    
    const user= await User.findOne({email:req.body.email});
    console.log(user)
    

    if(!user)
    {
        return next(new ErrorHandler("User not found",404));
    }


    //getting the token
   const resetToken= user.getResetPasswordToken();

   await user.save({validateBeforeSave: false});

   const resetPasswordUrl =`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

   const message= `Your Password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested the mail then , kindly ignore.`;

   try{

    await sendEmail({

        email:user.email,
        subject: 'Ecommerce Password Recovery',
        message,

    });

    res.status(200).json({
        success:true,
        message: `Email sent to ${user.email} successfully.`
    })

   }catch(err)
   {
       user.resetPasswordToken=undefined;
       user.resetPasswordExpire=undefined;

       await user.save({validateBeforeSave: false});

       return next(new ErrorHandler(err.message ,500));
   }


})


//Reset Password
exports.resetPassword = catchAsyncErrors(async (req,res,next)=>{

    
    const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");
    

    const user = await User.findOne({

        resetPasswordToken:resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    });

    

    
    if(!user)
    {
        return next(new ErrorHandler("Reset password Token is invalid or expired",400));
    }

    if(req.body.password !== req.body.confirmPassword)
    {
        return next(new ErrorHandler("Password does not match",400));
    }

    user.password= req.body.password;

    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    sendToken(user,200 , res);
});



