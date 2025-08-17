import { Router } from "express";
import { logout, signin, signup,listUsers } from "../controllers/user.controller.js";


const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', logout);
router.get('/allusers', listUsers);

export default router;