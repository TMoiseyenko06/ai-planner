import express, { Request, Response, NextFunction } from "express";
import path from "path";
import tasksRouter from "./routes/tasks";
import organizeRouter from "./routes/organize";
import logsRouter from "./routes/logs";
import { log } from "./logger";

const app = express();
const PORT = Number(process.env.PORT) || 80;

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/api")) {
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      log(level, `${req.method} ${req.path} → ${res.statusCode}`, { ms });
    });
  }
  next();
});

app.use(express.static(path.join(__dirname, "../dist")));

app.use("/api/tasks", tasksRouter);
app.use("/api", organizeRouter);
app.use("/api/logs", logsRouter);

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => log("info", `Focus running on port ${PORT}`));
