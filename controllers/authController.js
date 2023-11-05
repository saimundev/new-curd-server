import AuthModel from "../models/auth.js";
import bcrypt from "bcrypt";
import joi from "joi";
import genAuthToken from "../utils/genAuthToken.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

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

    //create email token
    const createToken = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    const sendLink = `https://new-curd-client.vercel.app/email-verification-success?token=${createToken}`;

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
                .link{
                    color: blue;
                    padding: 15px 30px;
                    border: none;
                    border-radious:16px;
                }
                .title{
                  text-align:center;
                  font-size:40px;
                }
            </style>
        </head>
        <body>
            <h1 class="title">verified email address</h1>
            <a href=${sendLink} class="link">varefied Link here</a>
            <p>Note this link valid for 10 minutes</p>
        </body>
        </html>`,
    };

    //send user email
    transporter.sendMail(mailOption, async (error, data) => {
      if (error) {
        res.status(400).json({ message: "Something went wrong" });
      } else {
        //create new user
        const user = await AuthModel.create({
          name,
          email,
          password: hashPassword,
        });

        //create user token
        const token = await genAuthToken(user);
        res
          .status(200)
          .json({ token });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const emailVerifier = async (req, res) => {
  const { token } = req.query;
  try {
    if (!token) return res.status(400).json({ message: "Invalid URL" });
    const isValidToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!isValidToken) return res.status(400).json({ message: "Link Expaird" });
    const findEmail = await AuthModel.findOne({ email: isValidToken.email });

    await AuthModel.findOneAndUpdate(
      { _id: findEmail._id },
      { isVerifier: true }
    );

    res.status(200).json({ message: "Email Verification successful" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const signIn = async (req, res) => {
  console.log("find user sing",req.body)
  const { email, password } = req.body;
  try {
    const isUserExist = await AuthModel.findOne({ email: email });

    if (!isUserExist.isVerifier)
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

export const getUser = async (req, res) => {
  try {
    const user = await AuthModel.find({});
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
