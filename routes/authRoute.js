import express from "express";
import {
  changePassword,
  VerifyOTP,
  signIn,
  singUp,
  reSendOTP,
  forgotPasswordEmailVerify,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/sign-up", singUp);
router.post("/resend-otp", reSendOTP);
router.post("/verify-otp", VerifyOTP);
router.post("/sign-in", signIn);
router.post("/forgotPassword-emailVerify", forgotPasswordEmailVerify);
router.post("/change-password", changePassword);

export default router;
