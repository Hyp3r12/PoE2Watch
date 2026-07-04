import "dotenv/config";
import "./storage/database";
import { startWatcher } from "./watcher";
import "./bot";

console.log("=================================");
console.log("        PoE2Watch v0.5");
console.log("=================================");

startWatcher().catch((error) => {
    console.error("Fatal watcher error:", error);
});
