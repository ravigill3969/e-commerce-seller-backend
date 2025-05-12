import express from "express";
import { verifyAccessToken } from "../utils/verifyToken";
import {
  addProduct,
  editProduct,
  getCurrentUserProducts,
  getProductWithIdForSeller,
} from "../controllers/product";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

router.get(
  "/get-active-user-products",
  verifyAccessToken,
  getCurrentUserProducts
);
router.post(
  "/add-product",
  verifyAccessToken,
  upload.array("image", 10),
  addProduct
);
router.get(
  "/get-product-with-id/:id",
  verifyAccessToken,
  getProductWithIdForSeller
);
router.put(
  "/edit-product",
  verifyAccessToken,
  upload.array("image", 10),
  editProduct
);

const productRouter = router;
export default productRouter;
