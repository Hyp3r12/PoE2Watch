import "dotenv/config";
import "./storage/database";
import { startWatcher } from "./watcher";
import { printStartupCheck } from "./services/startupcheck";
import "./bot";

console.log("=================================");
console.log("        PoE2Watch v0.5");
console.log("=================================");

printStartupCheck();

startWatcher().catch((error) => {
    console.error("Fatal watcher error:", error);
});
