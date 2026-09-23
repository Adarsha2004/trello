import { Router } from "express";
import { prisma } from "@repo/db/client";
import { requireAuth } from "../auth_middleware";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, email: true, name: true, image: true },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

export default router;
