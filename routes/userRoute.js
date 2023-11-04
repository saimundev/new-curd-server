import express from "express";
import { createUser, deleteUser, getUser, getUserById, updateUser, } from "../controllers/userController.js";
import auth from "../middleware/auth.js";


const router = express.Router();

router.post("/create-user",auth ,createUser)
router.get("/get-user",auth,getUser)
router.get("/get-userById/:id",auth,getUserById)
router.put("/update-user/:id",auth,updateUser)
router.delete("/delete-user/:id",auth,deleteUser)

export default router;