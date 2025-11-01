import json

# Leer el archivo
with open('INVENTARIO_STORAGE/inventario.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

# Limpiar multimedia de los repuestos especificados
for item in data:
    if item.get('nombre') in ['Sprocket Cinta Curva Filete', 'Motor Cinta Curva Filete']:
        item['multimedia'] = []
        print(f"Limpiado: {item['nombre']}")

# Guardar el archivo
with open('INVENTARIO_STORAGE/inventario.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n✅ Archivo guardado correctamente")
