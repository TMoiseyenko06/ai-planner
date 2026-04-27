import express from "express";
import path from "path";
import tasksRouter from "./routes/tasks";
import organizeRouter from "./routes/organize";

const app = express();
const PORT = Number(process.env.PORT) || 80;

app.use(express.json());

app.use(express.static(path.join(__dirname, "../dist")));

app.use("/api/tasks", tasksRouter);
app.use("/api", organizeRouter);

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => console.log(`Focus running on port ${PORT}`));
