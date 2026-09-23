from fastmcp import FastMCP
import sqlite3
from typing import List, Dict, Any

# MCP Server instance
mcp = FastMCP("Videogames Store")

DB_PATH = "C:\\Users\\Richa\\Documents\\curso-mcp\\12-mcp-home\\section_2\\videogames_store.db"

def conectar_db():
    """Connect to the SQLite database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None
    
mcp.tool()
def listar_tablas() -> List[str]:
    """
    List all tables in the SQLite database.
    útil para conocer la estructura de la base de datos antes de realizar consultas.
    """

    conn = conectar_db()
    if conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = cursor.fetchall()
        conn.close()
        return [table[0] for table in tables]
    else:
        return []

@mcp.tool()
def describir_tabla(nombre_tabla: str) -> Dict[str, Any]:
    """
    Obtiene información detallada sobre una tabla específica.
    Incluye columnas, tipos de datos y información del esquema.
    
    Args:
        nombre_tabla: Nombre de la tabla a describir
        
    Returns:
        Diccionario con el esquema de la tabla
    """
    conn = conectar_db()
    cursor = conn.cursor()
    
    # Obtener información de columnas
    cursor.execute(f"PRAGMA table_info({nombre_tabla})")
    columnas = cursor.fetchall()
    
    # Obtener conteo de registros
    cursor.execute(f"SELECT COUNT(*) FROM {nombre_tabla}")
    total_registros = cursor.fetchone()[0]
    
    conn.close()
    
    esquema = {
        "nombre": nombre_tabla,
        "total_registros": total_registros,
        "columnas": [
            {
                "nombre": col[1],
                "tipo": col[2],
                "no_nulo": bool(col[3]),
                "valor_por_defecto": col[4],
                "es_clave_primaria": bool(col[5])
            }
            for col in columnas
        ]
    }
    
    return esquema

@mcp.tool()
def ejecutar_consulta(sql: str) -> List[Dict[str, Any]]:
    """
    Ejecuta una consulta SQL SELECT de solo lectura en la base de datos.
    
    IMPORTANTE: Solo se permiten consultas SELECT (lectura).
    No se permiten INSERT, UPDATE, DELETE, DROP, etc.
    
    Args:
        sql: Consulta SQL SELECT a ejecutar
        
    Returns:
        Lista de diccionarios con los resultados
    """
    # Validación de seguridad: solo permitir SELECT
    sql_upper = sql.strip().upper()
    if not sql_upper.startswith('SELECT'):
        return [{
            "error": "Solo se permiten consultas SELECT",
            "tipo": "SecurityError"
        }]
    
    # Palabras prohibidas para mayor seguridad
    palabras_prohibidas = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE']
    if any(palabra in sql_upper for palabra in palabras_prohibidas):
        return [{
            "error": f"Consulta no permitida. Palabras prohibidas: {', '.join(palabras_prohibidas)}",
            "tipo": "SecurityError"
        }]
    
    try:
        conn = conectar_db()
        cursor = conn.cursor()
        cursor.execute(sql)
        
        # Obtener nombres de columnas
        columnas = [description[0] for description in cursor.description]
        
        # Convertir resultados a lista de diccionarios
        resultados = []
        for fila in cursor.fetchall():
            resultados.append(dict(zip(columnas, fila)))
        
        conn.close()
        
        return resultados
    
    except sqlite3.Error as e:
        return [{
            "error": str(e),
            "tipo": "SQLError"
        }]


# Start point
if __name__ == "__main__":
    mcp.run()