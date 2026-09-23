import json
import os
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
  normalized_message = normalize_text(user_message)

  for sign_key, sign_label in ZODIAC_SIGNS.items():
    if re.search(rf"\b{re.escape(sign_key)}\b", normalized_message):
      return {
        "tool": "obtener_horoscopo",
        "arguments": {"sign": sign_label},
      }

  raise ValueError("No se pudo interpretar el signo del zodiaco.")

def build_prompt(user_message: str) -> str:
    return f"""
Eres un asistente que recibe instrucciones en lenguaje natural y decide qué herramienta MCP invocar.

Herramientas disponibles:

1. obtener_horoscopo(sign: string) - Devuelve el horoscopo para un signo del zodiaco.

Responde solo con JSON como este:

{{
  "tool": "obtener_horoscopo",
  "arguments": {{
    "sign": "Libra"
  }}
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
    return json.loads(raw)
  except (OpenAIError, json.JSONDecodeError, AttributeError, IndexError, TypeError, ValueError):
    return interpret_locally(user_message)
