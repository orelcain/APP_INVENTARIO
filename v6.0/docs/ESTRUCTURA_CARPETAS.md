# 📂 ESTRUCTURA DE CARPETAS - APP_INVENTARIO

**Fecha:** 31 de octubre de 2025  
**Organización:** v5.4.0 (raíz) + v6.0 (carpeta separada)

---

## 🏗️ ESTRUCTURA COMPLETA

```
D:\APP_INVENTARIO\
│
├── 📁 v6.0/                                    ← 🆕 NUEVA VERSIÓN MODULAR
│   ├── 📄 inventario_v6.0.html                 (1,603 líneas) - App principal
│   ├── 📄 README.md                            Guía completa del proyecto
│   ├── 📄 INICIAR_v6.0.bat                     Script de inicio rápido
│   │
│   ├── 📁 modules/                             Módulos ES6 originales
│   │   ├── core.js                             (5,193 líneas) - Lógica principal
│   │   ├── storage.js                          (853 líneas) - FileSystem API
│   │   └── mapa.js                             (1,246 líneas) - Canvas mapas
│   │
│   ├── 📁 INVENTARIO_STORAGE/                  Datos y recursos v6.0
│   │   ├── inventario.json                     57 repuestos
│   │   ├── mapas.json                          Mapas de planta
│   │   ├── presupuestos.json                   Presupuestos
│   │   ├── repuestos.json                      Datos repuestos
│   │   ├── zonas.json                          Zonas del mapa
│   │   └── 📁 imagenes/                        Recursos visuales v6.0
│   │       ├── LEEME.txt                       Instrucciones
│   │       └── 📁 mapas/                       Imágenes de mapas
│   │
│   └── 📁 docs/                                Documentación técnica
│       ├── IMPLEMENTACION_v6.0_COMPLETA.md     Resumen técnico
│       ├── SESION_COMPLETA_v6.0.md             Overview desarrollo
│       ├── PRUEBAS_v6.0_PASO_A_PASO.md         22 pasos verificación
│       └── PROGRESO_v6.0.md                    Tracking tareas
│
├── 📄 inventario_v5.4.0.html                   (35,890 líneas) 🔒 VERSIÓN ORIGINAL
├── 📄 index.html                               Versión anterior (legacy)
├── 📄 proyecto-config.json                     Configuración del proyecto
├── 📄 optimize-images.ps1                      Script optimización imágenes
├── 📄 manifest.json                            Manifest PWA
│
├── 📁 modules/                                 Módulos compartidos (raíz)
│   ├── core.js                                 (5,193 líneas) - Usado por v5.4.0 y v6.0
│   ├── storage.js                              (853 líneas) - Compartido
│   └── mapa.js                                 (1,246 líneas) - Compartido
│
├── 📁 styles/                                  Estilos compartidos (raíz)
│   ├── inline-refactor.css                     CSS refactorizado
│   ├── main.css                                Estilos principales
│   └── components.css                          Componentes
│
└── 📁 INVENTARIO_STORAGE/                      Datos principales (compartidos)
    ├── inventario.json                         57 repuestos (principal)
    ├── mapas.json                              Mapas
    ├── presupuestos.json                       Presupuestos
    ├── repuestos.json                          Datos repuestos
    ├── zonas.json                              Zonas
    │
    ├── 📁 imagenes/                            Recursos visuales (raíz)
    │   ├── LEEME.txt
    │   └── 📁 mapas/                           Imágenes de mapas
    │
    ├── 📁 backups/                             Respaldos automáticos
    │   ├── 📁 app_portable/
    │   ├── 📁 automaticos/
    │   ├── 📁 mapas/
    │   ├── 📁 repuestos/
    │   ├── 📁 zip/
    │   └── 📁 zonas/
    │
    ├── 📁 backups_marcadores/                  Backups marcadores mapas
    │
    └── 📁 logs/                                Logs del sistema
```

---

## 🎯 EXPLICACIÓN DE LA ORGANIZACIÓN

### 📦 RAÍZ (v5.4.0 - PRODUCCIÓN ESTABLE)
- **inventario_v5.4.0.html** - Versión monolítica completa y probada
- **modules/** - Módulos compartidos por ambas versiones
- **styles/** - Estilos compartidos
- **INVENTARIO_STORAGE/** - Datos principales del sistema

**Razón:** Mantener la versión funcional intacta como respaldo

---

### 🆕 CARPETA v6.0/ (DESARROLLO MODULAR)
- **inventario_v6.0.html** - Nueva versión con arquitectura modular
- **modules/** - Copia de los módulos (independiente)
- **INVENTARIO_STORAGE/** - Copia de datos para desarrollo aislado
- **docs/** - Documentación técnica específica de v6.0
- **INICIAR_v6.0.bat** - Script de inicio rápido

**Razón:** Desarrollo aislado sin afectar producción

---

## ✨ VENTAJAS DE ESTA ESTRUCTURA

### ✅ Separación Clara
- v5.4.0 en raíz (producción)
- v6.0 en carpeta separada (desarrollo)
- Fácil cambiar entre versiones

### ✅ Datos Independientes
- Cada versión tiene su INVENTARIO_STORAGE
- Imágenes separadas
- Sin conflictos al editar

### ✅ Backup Automático
- v5.4.0 siempre disponible
- Si v6.0 falla, volver a v5.4.0
- Historial de cambios preservado

### ✅ Desarrollo Seguro
- Experimentar en v6.0 sin riesgos
- Comparar fácilmente las versiones
- Migración gradual

---

## 🚀 CÓMO USAR CADA VERSIÓN

### v5.4.0 (ESTABLE)
```bash
# Abrir directamente
d:\APP_INVENTARIO\inventario_v5.4.0.html

# Características
✅ 35,890 líneas - Todo en un archivo
✅ Probado y funcional
✅ Todas las características implementadas
⚠️ Difícil de mantener
```

### v6.0 (MODULAR)
```bash
# Opción 1: Script automático
d:\APP_INVENTARIO\v6.0\INICIAR_v6.0.bat

# Opción 2: Abrir directamente
d:\APP_INVENTARIO\v6.0\inventario_v6.0.html

# Características
✅ 8,895 líneas - Modular (75% menos código)
✅ Fácil de mantener
✅ Carga rápida
⚠️ En desarrollo (80% completo)
```

---

## 📊 COMPARACIÓN DE ARCHIVOS

| Archivo | v5.4.0 (Raíz) | v6.0 (Carpeta) | Diferencia |
|---------|---------------|----------------|------------|
| **HTML Principal** | 35,890 líneas | 1,603 líneas | -95.5% |
| **Módulos JS** | Embebido | 7,292 líneas | Separados |
| **CSS** | Embebido | Embebido | Similar |
| **Total** | 35,890 líneas | 8,895 líneas | -75.2% |
| **Archivos** | 1 monolítico | 4 modulares | +300% |

---

## 🔄 FLUJO DE TRABAJO RECOMENDADO

### Desarrollo
1. Trabajar en **v6.0/**
2. Probar cambios
3. Verificar funcionamiento
4. Documentar en **docs/**

### Producción
1. Usar **inventario_v5.4.0.html** (raíz)
2. Cuando v6.0 esté completo al 100%
3. Mover v6.0 a producción
4. Archivar v5.4.0 como v5.4.0_backup/

---

## 📝 NOTAS IMPORTANTES

### ⚠️ NO Eliminar
- **inventario_v5.4.0.html** - Backup principal
- **modules/** (raíz) - Compartidos entre versiones
- **INVENTARIO_STORAGE/** (raíz) - Datos principales

### ✅ Editable Libremente
- **v6.0/** completo - Entorno aislado
- **docs/** en v6.0 - Documentación desarrollo

### 🔄 Compartido
- **modules/** (raíz) - Usado por ambas versiones
- Cambios en modules/ afectan a AMBAS versiones

---

## 🎓 LECCIONES APRENDIDAS

### Por qué esta estructura:
1. **Backup seguro** - v5.4.0 siempre funcional
2. **Desarrollo aislado** - v6.0 no afecta producción
3. **Comparación fácil** - Ambas versiones accesibles
4. **Migración gradual** - Mover funciones paso a paso
5. **Documentación separada** - Cada versión con sus docs

---

## 📚 DOCUMENTACIÓN RELACIONADA

- **v6.0/README.md** - Guía completa v6.0
- **v6.0/docs/IMPLEMENTACION_v6.0_COMPLETA.md** - Resumen técnico
- **v6.0/docs/PRUEBAS_v6.0_PASO_A_PASO.md** - Pasos de verificación

---

**Última actualización:** 31 de octubre de 2025  
**Estado:** ✅ Organización completa y lista para uso
