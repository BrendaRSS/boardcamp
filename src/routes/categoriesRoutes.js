import { Router } from "express";
import { getAllCategories, postCategories } from "../controllers/categoriesControllers.js";

const router = Router();

router.get('/categories', getAllCategories);

router.post('/categories', postCategories);

export default router;