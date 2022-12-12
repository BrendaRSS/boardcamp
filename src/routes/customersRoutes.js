import { Router } from "express";
import { getCustomers, getCustomerId, postCustomers, putCustomers } from "../controllers/customersControllers.js";

const router = Router();

router.get('/customers', getCustomers);

router.get('/customers/:id', getCustomerId);

router.post('/customers', postCustomers);

router.put('/customers/:id', putCustomers);

export default router;