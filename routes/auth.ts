import express from "express";
import { googleOAuth, logout, verifyUser } from "../controllers/auth";
import { verifyAccessToken, verifyRefreshToken } from "../utils/verifyToken";

const router = express.Router();

router.get("/verify-user", verifyAccessToken, verifyUser);
router.get("/refresh-token", verifyAccessToken, verifyRefreshToken);
router.post("/google-register", googleOAuth);
router.get("/logout", logout);

const authRouter = router;
export default authRouter;
