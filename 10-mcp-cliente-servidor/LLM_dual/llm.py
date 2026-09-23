import os
import json
import re
import unicodedata
from openai import OpenAI
from openai import OpenAIError

API_KEY = ""

client = OpenAI(api_key=API_KEY) if API_KEY else None

ZODIAC_SIGNS = {
  "aries": "Aries",
  "tauro": "Tauro",
  "geminis": "Geminis",
  "cancer": "Cancer",
  "leo": "Leo",
  "virgo": "Virgo",
  "libra": "Libra",
  "escorpio": "Escorpio",
  "sagitario": "Sagitario",
  "capricornio": "Capricornio",
  "acuario": "Acuario",
  "piscis": "Piscis",
}


def normalize_text(value: str) -> str:
  normalized = unicodedata.normalize("NFD", value.lower())
  return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


def interpret_locally(user_message: str):
  normalized = normalize_text(user_message)

  for sign_key, sign_label in ZODIAC_SIGNS.items():
    if re.search(rf"\b{re.escape(sign_key)}\b", normalized):
      return {
        "tool": "obtener_horoscopo",
        "arguments": {"sign": sign_label},
      }

  return {
    "response": "No tengo acceso al modelo en este momento, pero puedo ayudarte con horoscopos. Prueba: 'Dime el horoscopo de Libra'."
  }

def build_prompt(user_message: str) -> str:
    return f"""
Eres un asistente que puede:
1️⃣ Usar una herramienta para obtener horóscopos si el usuario lo pide.
2️⃣ Responder normalmente (texto libre) si la pregunta no es de horóscopo.

Herramienta disponible:
- obtener_horoscopo(sign: string) → Devuelve el horóscopo para un signo del zodiaco.

Ejemplos:

Usuario: "Dame el horóscopo de Aries"
Respuesta:
{{
  "tool": "obtener_horoscopo",
  "arguments": {{
    "sign": "Aries"
  }}
}}

Usuario: "Hola, ¿cómo estás?"
Respuesta:
{{
  "response": "¡Hola! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?"
}}

Usuario: "¿Quién fue Albert Einstein?"
Respuesta:
{{
  "response": "Albert Einstein fue un físico alemán conocido por la teoría de la relatividad."
}}

Usuario: {user_message}
"""

async def interpret_with_gpt(user_message: str):
  if not client:
    return interpret_locally(user_message)

  prompt = build_prompt(user_message)

  try:
    response = client.chat.completions.create(
      model="gpt-3.5-turbo",
      messages=[{"role": "user", "content": prompt}],
      temperature=0,
    )

    raw = response.choices[0].message.content

    try:
      return json.loads(raw)
    except Exception:
      return {"response": raw}
  except (OpenAIError, AttributeError, IndexError, TypeError, ValueError):
    return interpret_locally(user_message)
 
