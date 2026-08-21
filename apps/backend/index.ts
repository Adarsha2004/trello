import "dotenv/config";
import express from "express";
import authRouter from "./src/routes/auth";
import orgRouter from "./src/routes/org";
import boardRouter from "./src/routes/board";
import sectionRouter from "./src/routes/section";
import issueRouter from "./src/routes/issue";
import commentRouter from "./src/routes/comment";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", authRouter);
app.use("/api", orgRouter);
app.use("/api", boardRouter);
app.use("/api", sectionRouter);
app.use("/api", issueRouter);
app.use("/api", commentRouter);

const port = Number(process.env.BACKEND_PORT ?? 3000);
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
