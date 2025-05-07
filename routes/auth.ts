import express from "express";
import { googleOAuth } from "../controllers/auth";

const router = express.Router();

router.post("/google-register", googleOAuth);

const authRouter = router;
export default authRouter;
