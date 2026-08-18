import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db/client";
import { signToken } from "../auth_middleware";

const router = Router();

router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    res.status(400).json({ error: "email, password and name are required" });
    return;
  }
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const encryptPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: { email, password: encryptPassword, name },
  });
  
  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name },
  });
  
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !(await bcrypt.compare(password ?? "", user.password))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  
  res.json({
    token: signToken(user.id),
    user: { id: user.id, email: user.email, name: user.name },
  });
  
});

export default router;
