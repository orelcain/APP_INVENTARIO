# 🎨 Prototipo: Jerarquía SAP - Vistas de Dependencias

## 📋 Descripción

Este es un **prototipo experimental** de visualización jerárquica con líneas guía y múltiples vistas interactivas. Desarrollado como concepto separado antes de integrarlo a la aplicación principal.

## 🚀 Cómo Usar

### Opción 1: Abrir directamente
```
Doble clic en: jerarquia_visual_dependencias.html
```

### Opción 2: Con servidor local
```bash
# Desde la carpeta v6.0
python -m http.server 8001

# Abrir en navegador:
http://localhost:8001/jerarquia_visual_dependencias.html
```

## 🎯 Características Implementadas

### 3 Vistas Diferentes:

#### 1️⃣ **Árbol Vertical** 📊
- Estructura clásica de árbol
- Líneas conectoras entre niveles
- Gradientes de color por nivel jerárquico
- Expand/collapse de nodos
- Animaciones suaves

**Ventajas:**
- ✅ Familiar y fácil de entender
- ✅ Muestra claramente la jerarquía
- ✅ Escala bien verticalmente

**Desventajas:**
- ❌ Puede ser muy largo con muchos niveles
- ❌ Ocupa mucho espacio vertical

#### 2️⃣ **Organigrama Horizontal** 🏛️
- Diseño tipo organigrama corporativo
- Cajas conectadas con líneas
- Vista de múltiples niveles simultáneos
- Bordes con colores por nivel

**Ventajas:**
- ✅ Vista panorámica de toda la estructura
- ✅ Fácil identificar relaciones hermanas
- ✅ Profesional y corporativo

**Desventajas:**
- ❌ Requiere mucho espacio horizontal
- ❌ Difícil con jerarquías muy anchas

#### 3️⃣ **Red de Dependencias** 🔗
- Nodos circulares interactivos
- Líneas de conexión con canvas
- Distribución radial desde centro
- Colores distintos por nivel

**Ventajas:**
- ✅ Muy visual e impactante
- ✅ Muestra dependencias claramente
- ✅ Interactivo (arrastrables en futuro)

**Desventajas:**
- ❌ Puede ser confuso con muchos nodos
- ❌ Requiere más recursos de renderizado

## 🎨 Sistema de Colores

Cada nivel tiene su propio gradiente:

| Nivel | Color | Código |
|-------|-------|--------|
| 🏢 Empresa | Púrpura | `#667eea → #764ba2` |
| 📂 Área | Rosa-Rojo | `#f093fb → #f5576c` |
| 📁 Sub-Área | Azul Cielo | `#4facfe → #00f2fe` |
| ⚙️ Sistema | Verde-Cyan | `#43e97b → #38f9d7` |
| 🔧 Sub-Sistema | Rosa-Amarillo | `#fa709a → #fee140` |
| 📋 Sección | Cyan-Púrpura | `#30cfd0 → #330867` |

## 🛠️ Funcionalidades Disponibles

### Controles Globales:
- **⬇️ Expandir Todo**: Despliega todos los nodos colapsados
- **⬆️ Colapsar Todo**: Oculta todos los niveles hijos
- **🔄 Reiniciar Vista**: Resetea a estado inicial
- **💾 Exportar**: (Placeholder) Exportar a PNG/SVG

### Interacciones:
- **Click en nodo**: Colapsar/expandir hijos (Vista Árbol)
- **Hover**: Efecto de elevación y escala
- **Switch de vista**: Botones superiores

## 📊 Datos de Ejemplo

El prototipo usa datos simulados basados en la estructura real:

```javascript
{
  empresa: {
    id: 'EMP-01',
    nombre: 'Planta Procesadora'
  },
  areas: [
    {
      id: 'AREA-01',
      nombre: 'Producción',
      subAreas: [
        {
          nombre: 'Eviscerado',
          sistemas: ['Línea de Corte', 'Mesa de Inspección']
        },
        {
          nombre: 'Filete',
          sistemas: ['Cinta Curva']
        }
      ]
    },
    // ... más áreas
  ]
}
```

## 🔄 Próximos Pasos para Integración

### 1. Conectar con localStorage
```javascript
// Leer jerarquía real
const jerarquiaReal = JSON.parse(localStorage.getItem('jerarquiaAnidada'));
```

### 2. Agregar a inventario_v6.0_portable.html
- Crear nueva pestaña "Vista Dependencias"
- Inyectar estilos y scripts
- Sincronizar con datos reales

### 3. Funcionalidades Avanzadas

#### Drag & Drop en Red
```javascript
// Permitir arrastrar nodos en vista de red
networkNode.draggable = true;
networkNode.addEventListener('dragstart', handleDragStart);
```

#### Zoom y Pan
```javascript
// Agregar zoom con rueda del mouse
container.addEventListener('wheel', (e) => {
  scale += e.deltaY * -0.01;
  container.style.transform = `scale(${scale})`;
});
```

#### Exportar a Imagen
```javascript
// Usando html2canvas
html2canvas(container).then(canvas => {
  const link = document.createElement('a');
  link.download = 'jerarquia.png';
  link.href = canvas.toDataURL();
  link.click();
});
```

#### Búsqueda y Filtrado
```javascript
function buscarNodo(termino) {
  // Resaltar nodos que coincidan
  // Mostrar camino desde raíz
  // Ocultar nodos irrelevantes
}
```

## 💡 Ideas Adicionales

### Vista 4: Mapa de Calor 🔥
- Mostrar intensidad de uso por color
- Destacar áreas con más repuestos
- Identificar zonas críticas

### Vista 5: Timeline ⏱️
- Mostrar evolución temporal de la jerarquía
- Ver cuándo se agregaron nodos
- Historial de cambios

### Vista 6: Comparación 🔀
- Vista lado a lado de dos jerarquías
- Comparar versiones (antes/después)
- Identificar diferencias

### Vista 7: 3D (Ambicioso) 🎮
- Usar Three.js
- Jerarquía en 3 dimensiones
- Rotación y navegación espacial

## 🎓 Tecnologías Usadas

- **HTML5**: Estructura semántica
- **CSS3**: Gradientes, animaciones, flexbox
- **JavaScript Vanilla**: Sin dependencias
- **Canvas API**: Dibujo de líneas conectoras
- **CSS Grid/Flexbox**: Layout responsive

## 📱 Responsive

El prototipo es responsive y se adapta a:
- 📱 Móviles (< 768px)
- 💻 Tablets (768px - 1024px)
- 🖥️ Desktop (> 1024px)

## 🐛 Limitaciones Conocidas

1. **Vista de Red**: Las líneas son estáticas, no se actualizan si se arrastra
2. **Exportar**: Es un placeholder, no funciona aún
3. **Performance**: Con 100+ nodos puede ser lento
4. **Safari**: backdrop-filter requiere prefijo `-webkit-`
5. **IE11**: No soportado (usa CSS moderno)

## 🔗 Integración con App Principal

### Opción A: Nueva Pestaña
```html
<!-- En inventario_v6.0_portable.html -->
<div class="tab" data-tab="vista-dependencias">
  <iframe src="jerarquia_visual_dependencias.html"></iframe>
</div>
```

### Opción B: Modal/Overlay
```javascript
// Abrir en ventana modal
function abrirVistaDependencias() {
  const modal = document.createElement('div');
  modal.className = 'modal-dependencias';
  modal.innerHTML = `<iframe src="jerarquia_visual_dependencias.html"></iframe>`;
  document.body.appendChild(modal);
}
```

### Opción C: Fusión Completa
- Copiar estilos a `main.css`
- Copiar JavaScript a módulo separado
- Integrar en pestaña existente

## 📝 Notas de Desarrollo

**Fecha de creación**: 9 de noviembre de 2025  
**Estado**: Prototipo funcional (WIP)  
**Próxima iteración**: Agregar interactividad real con datos de localStorage

---

## 🎯 ¿Cuál Vista Prefieres?

**Vota por tu favorita:**
1. 📊 Árbol Vertical (clásico, simple)
2. 🏛️ Organigrama (profesional, panorámico)
3. 🔗 Red de Dependencias (moderno, visual)

**O mejor aún:** ¡Ofrecer las 3 y que el usuario elija! 😎

---

**¿Preguntas o sugerencias?**  
Este es un prototipo experimental. Pruébalo, experimenta y decide si quieres integrarlo a la app principal.
