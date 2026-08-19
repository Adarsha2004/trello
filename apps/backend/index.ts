import "dotenv/config";
import express from "express";
import authRouter from "./src/routes/auth";
import orgRouter from "./src/routes/org";
import boardRouter from "./src/routes/board";
import sectionRouter from "./src/routes/section";
import issueRouter from "./src/routes/issue";
import commentRouter from "./src/routes/comment";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use(authRouter);
app.use(orgRouter);
app.use(boardRouter);
app.use(sectionRouter);
app.use(issueRouter);
app.use(commentRouter);

const port = Number(process.env.BACKEND_PORT ?? 3000);
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
