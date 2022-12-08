import express from "express";
import cors from "cors";
import categoriesRoutes from "./routes/categoriesRoutes.js";

//configs
const app = express();
app.use(cors());
app.use(express.json());
app.use(categoriesRoutes);

app.listen(4000, () => console.log("Server running in port: 4000"));