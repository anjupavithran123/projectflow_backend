// 1️⃣ Load dotenv first
import dotenv from "dotenv";
dotenv.config();

// 2️⃣ Check environment variables
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log(
  "SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "loaded" : "missing"
);

// 3️⃣ Import everything else AFTER dotenv
import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js"
import userRoutes from "./src/routes/userroute.js"
import ticketRoutes from "./src/routes/ticketRoutes.js"
import commentRoutes from "./src/routes/comment.routes.js"
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bug Tracker API running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users",userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use("/api/comments", commentRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
