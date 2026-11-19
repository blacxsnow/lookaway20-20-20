import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(".output/public");
const destination = path.resolve("dist");

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });

const shellPath = path.join(destination, "_shell.html");
const indexPath = path.join(destination, "index.html");
const shell = await readFile(shellPath, "utf8");
await writeFile(indexPath, shell);
await rm(shellPath, { force: true });

console.log("Prepared Capacitor assets in dist/");
