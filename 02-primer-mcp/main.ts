import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

//Crear un servidor MCP
const servidor = new McpServer({
  name: "servidor-mcp-richard",
  description: "Un servidor MCP de ejemplo que responde a solicitudes de recursos.",
  version: "1.0.0",
});

//Crear una herramienta
// Usa un inputSchema para que los argumentos sean validados y recibidos directamente

servidor.registerTool(
  "multiplicar",
  {
    title: "Herramienta de multiplicar numeros",
    description: "Pasale los numeros y te los multiplica",
    inputSchema: { numero1: z.number(), numero2: z.number() },
  },
  async ({ numero1, numero2 }) => {
    if (typeof numero1 !== "number" || typeof numero2 !== "number") {
      throw new Error("Los parametros numero1 y numero2 deben ser numeros");
    }
    return {
      content: [
        {
          type: "text",
          text: `La multiplicacion es: ${numero1 * numero2}`
        }
      ]
    };
  }
);

servidor.registerResource(
  "saludar",
  new ResourceTemplate("saludar://{nombre}", { list: undefined }),
  { title: "Recurso para saludar", description: "Pidele un saludo a Richard"  },
  async (url, { nombre }) => {
    if (typeof nombre !== "string") {
      throw new Error("El parametro nombre debe ser una cadena de texto");
    }
    return {
      contents: [
        {
          uri: url.href,
          text: `Hola ${nombre}, bienvenido al servidor MCP de Richard!`,
        },
      ],
    };
  },
);


//Conexión del server con la ia
const transporte = new StdioServerTransport();
await servidor.connect(transporte);