import { Router } from "express";
import {getRentals, postRentals, postRentalsReturn, deleteRentals} from "../controllers/rentalsControllers.js";
//, postRentalsReturn, deleteRentals

const router = Router();

router.get("/rentals", getRentals);

router.post("/rentals", postRentals);

router.post("/rentals/:id/return", postRentalsReturn);

router.delete("/rentals/:id", deleteRentals);

export default router;