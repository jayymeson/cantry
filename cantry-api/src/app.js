import express from "express";
import chatRoutes from "./routes/chatRoutes.js";
import "dotenv/config";
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
