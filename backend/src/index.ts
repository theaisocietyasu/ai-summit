import express from "express";
import path from "path";
import { connectToDatabase } from "./services/database";
import routes from "./routes";
import { errorHandler } from "./middleware";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../../frontend/public")));

app.use("/api", routes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/public/index.html"));
});

app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
