import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "arco-mcp-server",
  version: "1.0.0",
  capabilities: {
    tools: {
      listChanged: true,
    },
  },
});

server.registerTool(
  "getArcoComponentsData",
  {
    title: "Arco Design MCP Server Tool",
    description:
      "Get information about each arco-design component, including props and supported events",
    // 直接提供 Zod Raw Shape
    inputSchema: {
      query: z
        .string()
        .describe("The name of the arco-design component, for example: Button"),
    },
  },
  // 修正函数签名以匹配 SDK 的期望 (args, extra)，并让 SDK 自行推断 args 类型
  async ({ query }) => {
    try {
      const response = await fetch(
        `https://arco-mcp-server.vercel.app/search?q=${query}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();

      // 成功返回
      return {
        content: [
          {
            type: "text",
            text: data,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // 按照规范，在错误返回中加入 isError: true
      // 同时，content 部分使用合法的 "text" 类型来承载错误信息
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `获取数据时发生错误: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Arco MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
