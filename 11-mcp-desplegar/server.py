import os
import random
from fastmcp import FastMCP

mcp = FastMCP("ServidorMCPHoroscopo")

@mcp.tool()
def obtener_horoscopo(sign: str) -> str:
    predictions = [
        "Hoy es un buen día para nuevas oportunidades.",
        "Mantén la calma, se acerca una buena noticia.",
        "Confía en tus instintos y sigue adelante.",
        "Podrías recibir ayuda inesperada de alguien cercano."
    ]
    return f"El horóscopo de hoy para {sign.capitalize()} dice que {random.choice(predictions)}"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    mcp.run(
        transport="sse",
        host="0.0.0.0",
        port=port
    )