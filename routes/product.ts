import express from "express";

const router = express.Router();

router.post("/add-product");

const productRouter = router;
export default productRouter;
