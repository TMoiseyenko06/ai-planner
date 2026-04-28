import { startCapture } from "./logger";
startCapture(); // must be first — captures all subsequent console output

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import tasksRouter from "./routes/tasks";
import organizeRouter from "./routes/organize";
import logsRouter from "./routes/logs";
import suggestStepsRouter from "./routes/suggestSteps";

const app = express();
const PORT = Number(process.env.PORT) || 80;

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/api") && req.path !== "/api/logs") {
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      const prefix = res.statusCode >= 500 ? "ERROR" : res.statusCode >= 400 ? "WARN " : "INFO ";
      console.log(`[${prefix}] ${req.method} ${req.path} ${res.statusCode} (${ms}ms)`);
    });
  }
  next();
});

app.use(express.static(path.join(__dirname, "../dist")));

app.use("/api/tasks", tasksRouter);
app.use("/api", organizeRouter);
app.use("/api", suggestStepsRouter);
app.use("/api/logs", logsRouter);

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => console.log(`[INFO ] Focus running on port ${PORT}`));
