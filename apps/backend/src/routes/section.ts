import { Router } from "express";
import { prisma } from "@repo/db/client";
import { requireAuth } from "../auth_middleware";

const router = Router();
router.use(requireAuth);

async function canAccessBoard(userId: string, boardId: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return null;

  const m = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: userId!, orgId: board.orgId } },
  });

  return m?.accepted ? board : null;
}

router.get("/sections", async (req, res) => {
  const { boardId } = req.query;
  if (!(await canAccessBoard(req.userId!, boardId as string))) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }

  const allSections = await prisma.section.findMany({
    where: { boardId: boardId as string },
    orderBy: { createdAt: "asc" },
  });

  res.json(allSections);
});

router.post("/section", async (req, res) => {
  const { title, boardId } = req.body;
  if (!(await canAccessBoard(req.userId!, boardId))) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }
  
  const section = await prisma.section.create({ data: { title, boardId } });

  res.json(section);
});

router.put("/section", async (req, res) => {
  const { sectionId, title } = req.body;
  const section = await prisma.section.findUnique({ where: { id: sectionId } });

  if (!section || !(await canAccessBoard(req.userId!, section.boardId))) {
    res.status(404).json({ error: "Section not found" });
    return;
  }
  
  res.json(await prisma.section.update({ where: { id: sectionId }, data: { title: title } }));
});

router.delete("/section", async (req, res) => {
  const { sectionId } = req.body;
  const section = await prisma.section.findUnique({ where: { id: sectionId } });

  if (!section || !(await canAccessBoard(req.userId!, section.boardId))) {
    res.status(404).json({ error: "Section not found" });
    return;
  }

  await prisma.section.delete({ where: { id: sectionId } });

  res.json({
    message:"Section deleted"
  });
  
});

export default router;
