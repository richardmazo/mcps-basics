import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import fs from "fs";
import FormData from "form-data";

const server = new McpServer({
    name: "servidor-mcp-proyectos",
    version: "1.0.0"
});

const BASE_URL = "http://localhost:3977/api/project";

server.registerTool("guardar_proyecto", {
    title: "Guardar un proyecto",
    description: "Crea un nuevo proyecto",
    inputSchema: {
        name: z.string(),
        description: z.string(),
        state: z.string()
    }
}, async ({name, description, state}) => {
    const response = await fetch(`${BASE_URL}/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, description, state })
    });
    if (!response.ok) throw new Error(`Error al guardar el proyecto`);
    const data = await response.json();
    return { content: [{type: "text", text: JSON.stringify(data, null, 2)}] };
});

server.registerTool("listar_proyectos", {
    title: "Listar proyectos",
    description: "Devuelve la lista de proyectos"
}, async () => {
    const response = await fetch(`${BASE_URL}/list`);
    if (!response.ok) throw new Error(`Error al obtener la lista de proyectos`);
    const data = await response.json();
    return { content: [{type: "text", text: JSON.stringify(data, null, 2)}] };
});

server.registerTool("obtener_proyecto", {
    title: "Obtener proyecto por ID",
    description: "Devuelve los datos de un proyecto especifico",
    inputSchema: {
        id: z.string()
    }
}, async ({ id }) => {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) throw new Error(`Error al obtener el proyecto`);
    const data = await response.json();
    return { content: [{type: "text", text: JSON.stringify(data, null, 2)}] };
});

server.registerTool("eliminar_proyecto", {
    title: "Eliminar proyecto",
    description: "Elimina un proyecto por ID",
    inputSchema: {
        id: z.string()
    }
}, async ({ id }) => {
    const response = await fetch(`${BASE_URL}/delete/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) throw new Error(`Error al eliminar el proyecto`);
    const data = await response.json();
    return { content: [{type: "text", text: JSON.stringify(data, null, 2)}] };
});

server.registerTool("actualizar_proyecto", {
    title: "Actualizar proyecto",
    description: "Actualiza los datos de un proyecto",
    inputSchema: {
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional()
    }
}, async ({ id, name, description }) => {
    const response = await fetch(`${BASE_URL}/update`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, name, description })
    });
    if (!response.ok) throw new Error(`Error al actualizar el proyecto`);
    const data = await response.json();
    return { content: [{type: "text", text: JSON.stringify(data, null, 2)}] };
});

server.registerTool("obtener_imagen_proyecto", {
    title: "Obtener imagen de proyecto",
    description: "Devuelve la imagen de un proyecto",
    inputSchema: { file: z.string() }
}, async ({ file }) => {
    const response = await fetch(`${BASE_URL}/image/${file}`);
    if (!response.ok) throw new Error(`Error al obtener la imagen`);
    const blob = await response.arrayBuffer();
    const base64 = Buffer.from(blob).toString("base64");
    return { content: [{ type: "image", data: base64, mimeType: response.headers.get("content-type") }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);