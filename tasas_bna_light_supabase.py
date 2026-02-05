import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import re
import os
import sys
# Librería oficial de Supabase para Python
from supabase import create_client, Client

class BNALightScraper:
    def __init__(self):
        self.url = "https://www.bna.com.ar/home/informacionalusuariofinanciero"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    def fetch_datos(self):
        try:
            print(f"Iniciando scraping de {self.url}...")
            response = requests.get(self.url, headers=self.headers, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # --- 1. TASA ACTIVA (HTML) ---
            tasa_activa = {}
            # Buscamos el nodo del título
            header_node = soup.find(string=lambda t: "Tasa Activa Cartera General Diversas" in t if t else False)
            
            if header_node:
                # Subimos dos niveles para agarrar el bloque completo de texto
                block_text = header_node.find_parent().find_parent().get_text(separator=" ", strip=True)
                
                # Debug: Imprimimos un pedacito del texto para ver qué está leyendo realmente
                print(f"DEBUG - Texto encontrado (primeros 100 chars): {block_text[:100]}...")

                tem = re.search(r'T\.E\.M\..*?(\d+,\d+)\s*%', block_text)
                tna = re.search(r'T\.N\.A\..*?(\d+,\d+)\s*%', block_text)
                tea = re.search(r'T\.E\.A\..*?(\d+,\d+)\s*%', block_text)
                
                # --- FIX FECHA DE VIGENCIA ---
                # Regex mejorado: Busca "Vigen" seguido de cualquier cosa hasta encontrar una fecha DD/MM/AAAA
                # (?i) hace que sea case-insensitive (ignora mayúsculas/minúsculas)
                fecha_match = re.search(r'Vigen.*?(\d{1,2}/\d{1,2}/\d{2,4})', block_text, re.IGNORECASE)
                
                if fecha_match:
                    fecha_str = fecha_match.group(1)
                    print(f"DEBUG - Fecha detectada en web: {fecha_str}")
                else:
                    print("DEBUG - No se detectó fecha 'Vigencia', usando fecha actual como fallback.")
                    fecha_str = datetime.now().strftime("%d/%m/%Y")

                tasa_activa = {
                    "fecha_vigencia": fecha_str,
                    "TEM": f"{tem.group(1)}%" if tem else None,
                    "TNA": f"{tna.group(1)}%" if tna else None,
                    "TEA": f"{tea.group(1)}%" if tea else None
                }

            # --- 2. TASA PASIVA (HTML - Plazo Fijo) ---
            tasa_pasiva = {}
            row_node = soup.find(string=lambda t: "De 30 a 59" in t if t else False)
            if row_node:
                row_tr = row_node.find_parent().find_parent()
                if row_tr:
                    nums = re.findall(r'(\d+,\d+)\s*%', row_tr.get_text(separator=" "))
                    # Asumimos columna 2 y 3 para Canal Electrónico
                    if len(nums) > 2:
                        tasa_pasiva = {
                            "referencia": "Plazo Fijo 30 días - Canal Electrónico",
                            "TNA": f"{nums[2]}%",
                            "TEA": f"{nums[3]}%" if len(nums) > 3 else None
                        }

            result = {
                "metadata": {
                    "entidad": "Banco de la Nación Argentina",
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "source": "light_scraper"
                },
                "tasas": {
                    "activa_judicial": tasa_activa,
                    "pasiva_judicial": tasa_pasiva
                }
            }
            print("Scraping exitoso.")
            return result

        except Exception as e:
            print(f"Error en scraping: {e}")
            return None

def main():
    # 1. Ejecutar Scraper
    scraper = BNALightScraper()
    data = scraper.fetch_datos()

    if not data:
        sys.exit(1) # Fallar si no hay datos

    # 2. Conectar a Supabase
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        print("Error: Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
        # Imprimimos el JSON en consola por si estamos probando local sin DB
        print(json.dumps(data, indent=2))
        return

    try:
        supabase: Client = create_client(url, key)
        
        # 3. Insertar en la tabla 'historial_tasas'
        response = supabase.table("historial_tasas").insert({
            "datos": data,
            "fecha_scraping": datetime.now().strftime("%Y-%m-%d")
        }).execute()
        
        print("Datos guardados exitosamente en Supabase.")
        
    except Exception as e:
        print(f"Error guardando en Supabase: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
