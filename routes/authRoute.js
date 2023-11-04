import express from "express";
import { emailVerifier, getUser, signIn, singUp } from "../controllers/authController.js";

const router = express.Router();

router.post("/sign-up",singUp)
router.post("/email-verifier",emailVerifier)
router.post("/sign-in",signIn)
router.get("/get-user/:userId",getUser)

export default router;