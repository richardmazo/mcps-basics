import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "servidor-mcp-el-tiempo",
    version: "1.0.0"
});

server.registerTool(
    "el_tiempo_de_una_ciudad",
    {
        title: "Conseguir el clima de una ciudad",
        description: "Devuelve todos los datos del clima para la ciudad que queremos",
        inputSchema: {
            city: z.string().min(2, "Indica una ciudad valida")
        }
    },
    async ({ city }) => {
        const geoUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Error al buscar la ciudad");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("Ciudad no encontrada");
        }

        const { latitude, longitude } = geoData.results[0];

        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation&current=temperature_2m,precipitation`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Error al obtener el clima");
        }

        const weatherData = await weatherResponse.json();

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(weatherData, null, 2)
                }
            ]
        };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);