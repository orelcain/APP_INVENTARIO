# 📋 Cambios - 11 de Noviembre 2025

## Commit: `3c02d24` - Mejoras en jerarquía visual y herramientas de comparación

### ✨ Nuevas Características

#### 1. Sistema de Reordenamiento Visual
- **Botones ↑↓** en todos los 6 niveles jerárquicos
- Permite mover nodos completos (con todos sus hijos) dentro del mismo nivel
- Validación de límites automática
- Integrado con sistema de Undo/Redo
- Notificaciones toast de confirmación

**Ubicación**: `jerarquia_visual_dependencias.html`
- Función `moverNodo()` (línea ~3378)
- Botones en cada nivel: Área, SubÁrea, Sistema, SubSistema, Sección, SubSección

#### 2. Exportación Mejorada (PNG/PDF)
- **Respeta paleta de colores activa**: Detecta automáticamente qué paleta está seleccionada
- **Respeta filtros de búsqueda**: Exporta solo la rama visible cuando hay filtro activo
- **Espaciado optimizado**:
  - Márgenes: 8px (antes 20px)
  - Indentación: 40px (antes 50px)
  - Espaciado entre nodos: 5px (antes 12px)
  - Padding: 30px (antes 40px/60px)

**Ubicación**: `jerarquia_visual_dependencias.html`
- Exportación PNG: líneas 2849-2920
- Exportación PDF: líneas 2987-3075

### 🎨 Paletas de Colores Actualizadas

#### Paleta 1: "Azul Mate Oscuro"
- **Antes**: Azules brillantes (#2563eb → #f0f9ff)
- **Ahora**: Azules oscuros mate (#1a2332 → #70829a)
- Progresión de 7 niveles: muy oscuro → medio azul-gris
- Estética profesional y sobria

#### Paleta 7: "Gris Opaco Muerto"
- **Antes**: Rojos enérgicos (#7f1d1d → #fef2f2)
- **Ahora**: Grises completamente desaturados (#1c1f26 → #858b96)
- Sin color: tonos mate "muertos"
- Minimalista e industrial

#### Paleta 8: "Corporativo Oscuro"
- **Antes**: Azules marinos medios (#0c1e3d → #eff6ff)
- **Ahora**: Azul-gris muy oscuro (#171d28 → #61798a)
- Mantiene bordes izquierdos de 4px para jerarquía
- Elegante y corporativo

**Ubicación**: `jerarquia_visual_dependencias.html`
- Paleta 1: líneas 1537-1564
- Paleta 7: líneas 1716-1743
- Paleta 8: líneas 1746-1779

### 🆕 Herramientas Auxiliares Nuevas

#### 1. Comparador de Colores por Nivel
**Archivo**: `comparador_colores_niveles.html`
- **Propósito**: Visualizar las 10 paletas de colores lado a lado
- **Características**:
  - Sistema de tabs para cambiar entre paletas
  - Muestra todos los 7 niveles jerárquicos con sus códigos de color
  - Descripción de cada paleta y su uso ideal
  - Diseño responsive con animaciones

**Paletas incluidas**:
1. Azul Mate Oscuro
2. Océano (Verde → Azul)
3. Atardecer (Morado → Rosa)
4. Cálida (Naranja → Amarillo)
5. Grises Profesionales
6. Verde Naturaleza
7. Gris Opaco Muerto
8. Corporativo Oscuro
9. App Mate (Multi-Color)
10. Tonos Tierra

#### 2. Comparador de Estilos de Líneas
**Archivo**: `comparador_estilos_lineas.html`
- **Propósito**: Comparar 12 estilos diferentes de líneas jerárquicas
- **Características**:
  - 12 variantes de estilos visuales
  - Vista previa interactiva con árbol de ejemplo
  - Descripciones de uso para cada estilo

**Estilos incluidos**:
1. Sólido con Glow (Original)
2. Punteado con Rombos
3. Doble Trazo
4. Rayas Diagonales Opacas
5. Minimalista
6. Con Borde Mate
7. Industrial (Cuadrados)
8. Escala de Grises por Nivel
9. Colores Mate por Nivel
10. Monocromático Sutil
11. Degradado Progresivo
12. Líneas Fantasma

### 🐛 Correcciones

1. **Filtros de búsqueda en exportación**
   - Antes: Exportaba todos los nodos aunque algunos estuvieran ocultos
   - Ahora: Oculta correctamente tanto `.tree-children` como `.tree-node` colapsados

2. **Detección de paleta activa**
   - Antes: Exportaciones usaban siempre la paleta por defecto
   - Ahora: Detecta la clase `palette-X` del contenedor principal

3. **Espaciado en exportaciones**
   - Antes: Nodos demasiado separados (dificulta vista general)
   - Ahora: Espaciado compacto pero legible

### 📊 Estadísticas del Archivo Principal

**`jerarquia_visual_dependencias.html`**
- **Líneas totales**: 4,216 (crecimiento de 73 líneas)
- **Funciones nuevas**: 1 (`moverNodo`)
- **CSS nuevo**: Estilos para `.node-btn-move`
- **Botones agregados**: 12 (2 por cada uno de los 6 niveles)

### 🔄 Cambios en Git

```
3 archivos modificados:
- v6.0/jerarquia_visual_dependencias.html (modificado)
- v6.0/comparador_colores_niveles.html (nuevo)
- v6.0/comparador_estilos_lineas.html (nuevo)

Total: 3,706 inserciones(+), 170 eliminaciones(-)
```

### 🎯 Próximos Pasos Sugeridos

#### Opcionales (No urgentes):
1. **Migración a la App Principal**
   - Integrar sistema de reordenamiento
   - Aplicar paletas oscuras actualizadas
   - Mejorar exportaciones

2. **Mejoras Futuras**
   - Drag & drop para reordenamiento
   - Atajos de teclado (Ctrl+↑/↓)
   - Ordenamiento alfabético automático
   - Preview de exportación antes de descargar
   - Creador de paletas personalizado

3. **Documentación**
   - Guía de usuario para reordenamiento
   - Tutorial de exportación con filtros
   - Catálogo de paletas con casos de uso

### ✅ Estado Actual

- ✅ Todos los cambios committed
- ✅ Sincronizado con GitHub (origin/main)
- ✅ Sistema de reordenamiento funcional
- ✅ Exportaciones optimizadas
- ✅ Paletas oscuras implementadas
- ✅ Herramientas auxiliares creadas
- ✅ Usuario satisfecho ("quedo super bien...")

### 🔗 Enlaces

- **Repositorio**: https://github.com/orelcain/APP_INVENTARIO
- **Commit**: `3c02d24`
- **Branch**: `main`

---

**Fecha**: 11 de Noviembre 2025
**Desarrollado por**: GitHub Copilot
**Usuario**: orelcain
