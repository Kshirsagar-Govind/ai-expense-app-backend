import { configDotenv } from "dotenv";
import sequelize from "./src/config/db";
import app from "./src";

configDotenv();

const PORT = 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync(); // optional
    console.log("📦 Models synced");

    app.listen(PORT, () => {
      console.log("✅ SERVER IS RUNNING ON PORT " + PORT);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
