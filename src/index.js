import express from "express";
import cors from "cors";

//configs
const app = express();
app.use(cors());
app.use(express.json());

app.listen(400, () => console.log("Server running in port: 4000"));