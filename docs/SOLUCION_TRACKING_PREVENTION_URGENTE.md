# ⚠️ SOLUCIÓN URGENTE: Edge bloqueando Firebase

## Problema actual
```
Tracking Prevention blocked access to storage for <URL>
```

Edge está bloqueando Firebase Firestore por prevención de rastreo.

## ✅ SOLUCIÓN INMEDIATA (2 minutos)

### Opción 1: Configurar Edge (RECOMENDADO)

1. **Copia esta URL:** `edge://settings/privacy`
2. **Pégala** en la barra de direcciones de Edge
3. Presiona **Enter**
4. Busca **"Prevención de seguimiento"**
5. Cambia de **"Equilibrado"** → **"Básico"**
6. **Recarga la aplicación (F5)**

### Opción 2: Usar Chrome (alternativa)

1. Abre Google Chrome
2. Navega a `http://127.0.0.1:5500/v6.0/` (o tu puerto)
3. La migración funcionará sin configuración

---

## Por qué pasa esto

Edge bloquea cookies de terceros de `firebaseapp.com` y `googleapis.com` cuando está en modo "Equilibrado" o "Estricto". Esto impide que Firestore lea/escriba datos.

Firebase **SÍ está recibiendo** las solicitudes (ves "✅ Migración completada") pero Edge bloquea las respuestas.

## Después de configurar

Verás en consola:
```
✅ 57 repuestos guardados
✅ 2 mapas guardados      ← En lugar de 0
✅ 12 zonas guardadas     ← En lugar de 0
✅ 3 áreas en jerarquía   ← En lugar de 0
```
