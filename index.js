import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./config/database.js";
import leadRoutes from "./routes/leadRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

connectDB();



app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/leads", leadRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
