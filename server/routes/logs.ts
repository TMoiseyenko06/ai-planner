import { Router, Request, Response } from "express";
import { getLogs, clearLogs } from "../logger";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json(getLogs());
});

router.delete("/", (_req: Request, res: Response) => {
  clearLogs();
  res.status(204).end();
});

export default router;
