import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../dist");

// 添加 shebang 到入口文件
const entryFile = path.join(distPath, "index.js");
let content = await fs.promises.readFile(entryFile, "utf-8");

if (!content.startsWith("#!/usr/bin/env node")) {
  content = "#!/usr/bin/env node\n" + content;
  await fs.promises.writeFile(entryFile, content);

  // 设置可执行权限 (Unix 系统)
  if (process.platform !== "win32") {
    await fs.promises.chmod(entryFile, 0o755);
  }
}

// 创建 Windows 批处理文件
if (process.platform === "win32" || process.env.CREATE_WIN_BAT === "true") {
  const batContent = `@ECHO OFF
node "${path.join(distPath, "index.js")}" %*
`;
  await fs.promises.writeFile(
    path.join(distPath, "arco-mcp-server.cmd"),
    batContent
  );
}
