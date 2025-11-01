# 🎨 PROMPT PARA FIGMA AI - INVENTARIO PRO v6.0

## 📋 PROMPT COMPLETO (Copiar y pegar en Figma AI)

```
Diseña un sistema de inventario corporativo moderno con estas especificaciones:

PALETA DE COLORES:
- Fondo principal: #1e2229 (gris oscuro carbón)
- Fondo tarjetas: #252a33 (gris oscuro ligeramente más claro)
- Fondo hover: #2d333d (gris oscuro elevado)
- Acento principal (botones): #5b8bb4 (azul corporativo desaturado)
- Acento éxito: #5b9b7a (verde esmeralda mate)
- Acento advertencia: #b8925a (ámbar suave)
- Acento peligro: #b86b6b (rojo coral desaturado)
- Texto principal: #e6e9ef (blanco humo)
- Texto secundario: #b8bec8 (gris claro)
- Bordes: #3a404a (gris medio sutil)

GEOMETRÍA:
- Border radius consistente: 8px en TODO (botones, tarjetas, inputs)
- Border radius badges: 6px (forma píldora)
- Border radius modales: 12px
- Sombras sutiles: 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)

COMPONENTES PRINCIPALES:

1. TARJETA DE REPUESTO (240px ancho):
   - Imagen superior (240x180px, border-radius 8px top)
   - Fondo: #252a33
   - Padding: 16px
   - Título: 16px, #e6e9ef, font-weight 600
   - Subtítulo: 14px, #b8bec8
   - Badge de stock (top-right): 6px border-radius, colores según estado
   - 3 botones footer: "Editar" (azul), "Contar" (verde), "Eliminar" (rojo)
   - Sombra: 0 2px 4px rgba(0,0,0,0.25)
   - Hover: elevación con transform translateY(-2px), sombra más grande

2. BOTONES:
   - Padding: 8px 16px
   - Border radius: 8px
   - Font size: 13px, font-weight 500
   - Sombra: 0 2px 4px rgba(0,0,0,0.25)
   - Hover: elevación sutil con más sombra
   - Primario: fondo #5b8bb4, texto blanco
   - Secundario: fondo #2d333d, borde #3a404a, texto #e6e9ef
   - Peligro: fondo #b86b6b, texto blanco
   - Éxito: fondo #5b9b7a, texto blanco

3. INPUTS Y SELECTS:
   - Fondo: #2a2f38
   - Borde: 1px solid #3a404a
   - Border radius: 8px
   - Padding: 8px 16px
   - Color texto: #e6e9ef
   - Focus: borde #5b8bb4, glow sutil

4. MODAL:
   - Fondo: #353c47 (más claro que tarjetas)
   - Border radius: 12px
   - Padding: 32px
   - Sombra grande: 0 8px 16px rgba(0,0,0,0.35), 0 4px 8px rgba(0,0,0,0.25)
   - Backdrop: rgba(0,0,0,0.6)

5. BADGES DE ESTADO:
   - Border radius: 6px (píldora)
   - Padding: 4px 8px
   - Font size: 11px, font-weight 500
   - Stock óptimo: fondo #5b9b7a, texto blanco
   - Stock bajo: fondo #b8925a, texto blanco
   - Sin stock: fondo #b86b6b, texto blanco

6. HEADER:
   - Fondo: #1a1d23 (más oscuro que contenido)
   - Altura: 64px
   - Logo + título a la izquierda
   - Botones de acción a la derecha
   - Sombra sutil abajo

LAYOUT:
- Grid de tarjetas: 4 columnas en desktop, gap 16px
- Responsive: 3 cols en tablet, 1 col en móvil
- Padding general: 24px
- Margen entre secciones: 32px

ESTILO GENERAL:
- Minimalista pero no aburrido
- Profesional corporativo con personalidad
- Sombras sutiles para profundidad (no flat, no neumorfismo dramático)
- Transiciones suaves 250ms
- Tipografía: Inter, SF Pro, o Segoe UI

REFERENCIAS VISUALES:
- Inspiración: Linear.app, Notion, GitHub Dashboard, Stripe
- NO como: VSCode default (muy plano), Material Design (muy colorido)
- Balance: 80% grises, 20% acentos desaturados

Crea:
1. Frame principal con grid de 4 tarjetas de ejemplo
2. Un modal abierto con formulario
3. Sección de filtros (dropdowns y search)
4. Componentes individuales documentados (design system)
```

---

## 🎯 PROMPT ALTERNATIVO SIMPLIFICADO (Para herramientas más básicas)

```
Diseña UI de inventario corporativo oscuro:
- Fondo #1e2229, tarjetas #252a33
- Acentos azul #5b8bb4, verde #5b9b7a, rojo #b86b6b (desaturados)
- Border radius 8px consistente
- Sombras sutiles 2-4px
- Grid de tarjetas con imagen, título, botones
- Estilo: profesional pero no aburrido, inspirado en Linear.app
```

---

## 📸 MOCKUPS QUE NECESITAS

### Frame 1: Vista Principal (1920x1080)
- Header con logo y botones
- Barra de búsqueda + 4 filtros dropdown
- Grid 4x3 tarjetas de repuestos
- Footer con paginación

### Frame 2: Tarjeta Detallada (300x400)
- Zoom de una tarjeta con todos los estados:
  * Normal
  * Hover
  * Con badge "Stock Bajo"
  * Con badge "Sin Stock"

### Frame 3: Modal Editar (800x600)
- Form con inputs de ejemplo
- Botones Guardar/Cancelar
- Backdrop oscuro

### Frame 4: Design System (1200x800)
- Paleta de colores con códigos hex
- Todos los botones (primario, secundario, peligro, etc.)
- Inputs (normal, focus, disabled)
- Badges (óptimo, bajo, agotado)
- Tipografía (tamaños, pesos)
- Espaciado (8px system)
- Border radius (6px, 8px, 12px)
- Sombras (sm, md, lg)

---

## 🛠️ HERRAMIENTAS ALTERNATIVAS

Si Figma AI no funciona bien, puedes usar:

### 1. **v0.dev by Vercel** (Recomendado)
```
Prompt: "Create an inventory management dashboard with dark theme #1e2229 background, 
cards #252a33, blue accent #5b8bb4, 8px border radius, subtle shadows"
```
- ✅ Genera código + preview en vivo
- ✅ Exportable a React/HTML
- 🔗 https://v0.dev

### 2. **Midjourney** (Para visualización)
```
/imagine modern dark inventory dashboard UI, corporate blue accent #5b8bb4, 
cards grid layout, 8px rounded corners, subtle shadows, clean professional design, 
figma style mockup --ar 16:9 --v 6
```

### 3. **Claude con Artifacts** (Yo mismo 😊)
- Puedo crear un HTML completo con el diseño propuesto
- Lo abres en navegador y tomas screenshots
- Ajustamos hasta que quede perfecto

### 4. **Canva Magic Design**
```
Prompt: "Dashboard de inventario oscuro corporativo con tarjetas azules #5b8bb4"
```

---

## 💡 MI RECOMENDACIÓN

**Opción A: Visual rápido (5 minutos)**
→ Usa **v0.dev** con el prompt simplificado
→ Te genera preview + código React
→ Tomas screenshot y decidimos

**Opción B: Prototipo funcional (20 minutos)**
→ Yo aplico el design system a tu HTML actual
→ Lo abres en navegador
→ Lo ves funcionando en vivo con tus datos reales
→ Ajustamos en tiempo real

**Opción C: Mockup profesional (30 min)**
→ Usas Figma AI con prompt completo
→ Exportas PNG high-fidelity
→ Yo lo replico exacto en CSS

---

## 🚀 ¿QUÉ PREFIERES?

**A)** Dame el prompt y pruebo en v0.dev/Figma  
**B)** Aplico el diseño directo a tu HTML (lo ves funcionando YA)  
**C)** Creo un HTML demo standalone con el diseño propuesto  

Dime qué opción y en **5 minutos** tienes algo visual para ver 👀
