import { Router } from "express";
import { prisma } from "@repo/db/client";
import { requireAuth } from "../auth_middleware";

const router = Router();
router.use(requireAuth);

async function isMember(userId: string, orgId: string) {
  const m = await prisma.membership.findUnique({ where: { userId_orgId: { userId: userId!, orgId } } });
  return m?.accepted ? true : false;
}

router.get("/boards", async (req, res) => {
  const { orgId } = req.query;
  
  if (!(await isMember(req.userId!, orgId as string))) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }
  
  const boards = await prisma.board.findMany({ where: { orgId: orgId as string } });
  
  res.json(boards);
});

router.get("/board", async (req, res) => {
  const { boardId } = req.query;
  const board = await prisma.board.findUnique({ where: { id: boardId as string } });
  if (!board) {
    res.status(404).json({ error: "Board not found" });
    return;
  }
  if (!(await isMember(req.userId!, board.orgId))) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }
  res.json(board);
});

router.post("/board", async (req, res) => {
  const { title, orgId } = req.body;
  
  if (!(await isMember(req.userId!, orgId))) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }
  
  const board = await prisma.board.create({ data: { title, orgId } });
  
  res.status(201).json(board);
});

router.put("/board", async (req, res) => {
  const { boardId, title } = req.body;
  
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  if (!(await isMember(req.userId!, board.orgId))) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }

  const update_board = await prisma.board.update({ where: { id: boardId }, data: { title } })

  res.json(update_board);
});

router.delete("/board", async (req, res) => {
  const { boardId } = req.body;

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  const caller = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: req.userId!, orgId: board.orgId } },
  });
  if (!caller || caller.role !== "ADMIN" || !caller.accepted) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  await prisma.board.delete({ where: { id: boardId } });

  res.json({
    message:"Board deleted: "+boardId
  });

});

export default router;
