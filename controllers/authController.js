import AuthModel from "../models/auth.js";
import bcrypt from "bcrypt";
import joi from "joi";
import genAuthToken from "../utils/genAuthToken.js";
import nodemailer from "nodemailer";
import OtpModel from "../models/otp.js";

//create user
export const singUp = async (req, res) => {
  const { name, email, password } = req.body;

  //validation schema
  const validationSchema = joi.object({
    name: joi.string().min(3).max(35).required().messages(),
    email: joi.string().min(5).max(35).required().email(),
    password: joi.string().min(5).max(35).required(),
  });

  //validation error message
  const { error } = validationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const isUserExist = await AuthModel.findOne({ email: email });

    //is user exist
    if (isUserExist)
      return res.status(400).json({ message: "User Already exist" });

    const user = await AuthModel.create({
      name,
      email,
      password: hashPassword,
    });

    sendOTP({ _id: user._id, email: user.email });

    //create user token
    const token = genAuthToken(user);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error });
    console.log(error);
  }
};

//send OTP to verify user
export const sendOTP = async ({ _id, email }, res) => {
  try {
    //create otp 4 digit
    const OTP = Math.floor(1000 + Math.random() * 9000);

    //send email user config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `
         <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <style>

              .center {
                text-align:center;
              }
              .text-2xl {
                font-size:16px;
              }

              .text-3xl {
                font-size:30px;
                font-weight:bold;
              }
              .text-2xx{
                font-size:20px;
                letter-spacing: 5px;
              }
          </style>
      </head>
      <body>
          <div class="text-3xl center">Your OTP Code</div>
         <div class="center text-2xl">Your OTP Code : <b class="text-2xx">${OTP}</b></div>
          <div class="center">Note this link valid for 10 minutes</p>
      </body>
      </html>`,
    };

    transporter.sendMail(mailOption, async (error, data) => {
      if (error) {
        res.status(400).json({ message: "Something went wrong" });
      } else {
        await OtpModel.findOneAndDelete({ userId: _id });
        await OtpModel.create({
          otp: OTP,
          userId: _id,
          expireIn: Date.now() + 300000,
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//resend OTP code to send user
export const reSendOTP = async (req, res) => {
  const { userId, email } = req.body;

  //create otp 4 digit
  const OTP = Math.floor(1000 + Math.random() * 9000);

  try {
    //send email user config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `
         <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <style>

              .center {
                text-align:center;
              }
              .text-2xl {
                font-size:16px;
              }

              .text-3xl {
                font-size:30px;
                font-weight:bold;
              }
              .text-2xx{
                font-size:20px;
                letter-spacing: 5px;
              }
          </style>
      </head>
      <body>
          <div class="text-3xl center">Your OTP Code</div>
         <div class="center text-2xl">Your OTP Code : <b class="text-2xx">${OTP}</b></div>
          <div class="center">Note this link valid for 10 minutes</p>
      </body>
      </html>`,
    };

    transporter.sendMail(mailOption, async (error, data) => {
      if (error) {
        res.status(400).json({ message: "Something went wrong" });
      } else {
        //delete exist otp
        await OtpModel.findOneAndDelete({ userId: userId });

        //create new otp
        await OtpModel.create({
          otp: OTP,
          userId: userId,
          expireIn: Date.now() + 300000,
        });

        res.status(201).json({ message: "Otp Send Successful" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

//verify user by OTP code
export const VerifyOTP = async (req, res) => {
  const { otp } = req.body;

  if (!otp) return res.status(400).json({ message: "OTP is required" });
  try {
    const verifyOTP = await OtpModel.findOne({ otp: otp });
    if (!verifyOTP)
      return res.status(400).json({ message: "OTP is not valid" });

    if (verifyOTP.expireIn < Date.now())
      return res.status(400).json({ message: "OTP time expire" });

    //verify user
    await AuthModel.findByIdAndUpdate(
      { _id: verifyOTP.userId },
      { isVerify: true },
      { new: true }
    );
    res.status(200).json({ message: "OTP login successful" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

//login user
export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const isUserExist = await AuthModel.findOne({ email: email });

    if (!isUserExist.isVerify)
      return res.status(400).json({ message: "you are not verify user" });

    if (!isUserExist)
      return res.status(400).json({ message: "User Not Found" });

    const isPasswordMatch = await bcrypt.compare(
      password,
      isUserExist.password
    );
    if (!isPasswordMatch)
      return res.status(400).json({ message: "Password not match" });

    const token = genAuthToken(isUserExist);

    res.status(200).json({ user: isUserExist, token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPasswordEmailVerify = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "email is required" });
  try {
    const isUserExist = await AuthModel.findOne({ email: email });
    if (!isUserExist)
      return res.status(400).json({ message: "User not found" });

    //send OTP code to verify user
    sendOTP({ _id: isUserExist._id, email: isUserExist.email });

    res.status(200).json(isUserExist);
  } catch (error) {
    res.status(500).json({ message: "error", error });
  }
};

export const changePassword = async (req, res) => {
  const { email, password, conPassword } = req.body;
  console.log("body", req.body);

  if (!email || !password || !conPassword)
    return res.status(400).json({ message: "All field are required" });
  if (password !== conPassword)
    return res
      .status(400)
      .json({ message: "password and confirm password are not valid" });

  try {
    const user = await AuthModel.findOne({ email: email });
    if (!user) res.status(400).json({ message: "User not found" });
    const isOTPExist = await OtpModel.findOne({ userId: user._id });

    console.log("otp", isOTPExist);
    if (!isOTPExist?.otp)
      return res.status(400).json({ message: "OTP not verify" });

    const hashNewPassword = await bcrypt.hash(password, 10);
    await AuthModel.findByIdAndUpdate(
      { _id: user._id },
      { password: hashNewPassword },
      { new: true }
    );
    res.status(200).json({ message: "successful login please" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
