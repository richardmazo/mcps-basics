from mcp.server.fastmcp import FastMCP
import random

mcp = FastMCP("ServidorMCPHoroscopo")

@mcp.tool()
def obtener_horoscope(sign: str) -> str:
    """
    Devuelve un horóscopo simple para un signo.

    Args:
        sign (str): El signo del zodíaco para el cual se desea obtener el horóscopo.

    Returns:
        str: Predicción diarioa para el signo.
    """
    predictions = [
        "Hoy es un buen día para nuevas oportunidades.",
        "Mantén la calma, se acerca una buena noticia.",
        "Confía en tus instintos y sigue adelante.",
        "Podrías recibir ayuda inesperada de alguien cercano.",
    ]
    return f"El horóscopo para {sign.capitalize()} dice que {random.choice(predictions)}"

@mcp.tool()
def obtener_compatibilidad(sign: str) -> str:
    """
    Devuelve una breve descripción de la compatibilidad de un signo del zodíaco con otros signos.

    Args:
        sign (str): El signo del zodíaco para el cual se desea obtener la compatibilidad.
    """
    compatibilidades = {
        "aries": "alta compatibilidad con Leo y Sagitario",
        "tauro": "alta compatibilidad con Virgo y Capricornio",
        "géminis": "alta compatibilidad con Libra y Acuario",
        "cáncer": "alta compatibilidad con Escorpio y Piscis",
        "leo": "alta compatibilidad con Aries y Sagitario",
        "virgo": "alta compatibilidad con Tauro y Capricornio",
        "libra": "alta compatibilidad con Géminis y Acuario",
        "escorpio": "alta compatibilidad con Cáncer y Piscis",
        "sagitario": "alta compatibilidad con Aries y Leo",
        "capricornio": "alta compatibilidad con Tauro y Virgo",
        "acuario": "alta compatibilidad con Géminis y Libra",
        "piscis": "alta compatibilidad con Cáncer y Escorpio",
    }
    return f"La compatibilidad para {sign.capitalize()} tiene {compatibilidades.get(sign.lower(), 'compatibilidad variada con otros signos.')}"

if __name__ == "__main__":    
    mcp.run()