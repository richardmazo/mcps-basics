import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "servidor-mcp-monedas",
    version: "1.0.0"
});

server.registerTool(
    "valor_monedas",
    {
        title: "Conseguir el valor de una moneda",
        description: "Devuelve el valor actual de la moneda que necesites (USD, EUR, JPY, etc.)",
        inputSchema: {
            currency: z.string().min(1, "Debes indicar la moneda, por ejemplo: USD, EUR, JPY, etc.")
        }
    },
    async ({ currency }) => {
        const url = `https://cdn.moneyconvert.net/api/latest.json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error al acceder a la info del api`);
        }

        const data = await response.json();
        const base = data.base;
        const value = data.rates[currency.toUpperCase()];

        if (!value) {
            throw new Error(`No se ha encontrado el valor de la moneda ${currency}`);
        }

        return {
            content: [
                {
                    type: "text",
                    text: `El valor actual de ${currency.toUpperCase()} frente al ${base} es ${value}`
                }
            ]
        };
    }
);

server.registerTool(
    "conversion_tipo_cambio",
    {
        title: "Convertir una cifra de una moneda a otra",
        description: "Devuelve el valor de una moneda frente a otra",
        inputSchema: {
            origin: z.string().length(3, "Debe ser un codigo ISO de 3 letras que represente a una moneda"),
            destination: z.string().length(3, "Debe ser un codigo ISO de 3 letras que represente a una moneda"),
            amount: z.number().min(0, "La cantidad debe ser un número positivo")
        }
    },
    async ({ origin, destination, amount }) => {
        const url = `https://cdn.moneyconvert.net/api/latest.json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error al acceder a la info del api`);
        }

        const data = await response.json();
        const { base, rates } = data;

        if (!base || !rates) {
            throw new Error(`No se ha encontrado la información de tasas de cambio`);
        }

        let rate;

        if (origin === base) {
            rate = rates[destination];
        } else {
            const inverse = rates[origin];
            rate = rates[destination] / inverse;
        }

        const value_converted = amount * rate;

        return {
            content: [
                {
                    type: "text",
                    text: `${amount} ${origin} = ${value_converted.toFixed(2)} ${destination} (Tasa: ${rate.toFixed(6)}, Moneda Base: ${base})`
                }
            ]
        };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);