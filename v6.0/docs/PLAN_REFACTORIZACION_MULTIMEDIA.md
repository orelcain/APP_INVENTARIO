# 🎯 PLAN DE REFACTORIZACIÓN - SISTEMA MULTIMEDIA

**Fecha:** 17 de noviembre de 2025  
**Objetivo:** Solucionar completamente el sistema de carga/eliminación de imágenes  
**Alcance:** Modal Editar/Agregar Repuesto - Tab Multimedia  
**Prioridad:** CRÍTICA - Funcionalidad fundamental de la app

---

## 📊 DIAGNÓSTICO ACTUAL

### Problemas identificados:

#### 1. **Eliminación de imágenes** ❌
- Elimina archivo físico inmediatamente ✅
- NO actualiza JSON correctamente ❌
- Input file no se resetea consistentemente ❌
- Quedan 34 referencias huérfanas en repuestos.json ⚠️

#### 2. **Adición de imágenes después de eliminar** ❌
- Input `#imagenFile` queda bloqueado
- No permite seleccionar nuevas imágenes
- Mensaje "Error" aparece en preview

#### 3. **Arquitectura confusa** ⚠️
- `currentMultimedia` (array temporal) vs `repuesto.multimedia` (persistente)
- Sincronización inconsistente entre modal y datos
- Código legacy mezclado con código nuevo
- Múltiples puntos de guardado (manual vs automático)

---

## 🎯 ESTRATEGIA DE REFACTORIZACIÓN

### Principios de diseño:
1. **Separación de responsabilidades** - Cada función hace UNA cosa
2. **Estado centralizado** - `currentMultimedia` como única fuente de verdad en el modal
3. **Guardado explícito** - Solo guardar al presionar "Guardar" (mantener UX actual)
4. **Validación robusta** - Verificar integridad antes de cada operación
5. **Logs detallados** - Para debugging y monitoreo

---

## 📋 FASES DE IMPLEMENTACIÓN

### **FASE 1: AUDITORÍA Y LIMPIEZA** (30 min)
**Objetivo:** Identificar código obsoleto y dependencias

#### Tareas:
- [x] Limpiar 34 referencias huérfanas en repuestos.json ✅
- [ ] Identificar todas las funciones relacionadas con multimedia
- [ ] Mapear flujo completo: Agregar → Preview → Guardar
- [ ] Mapear flujo completo: Eliminar → Preview → Guardar
- [ ] Documentar estado actual de cada función
- [ ] Identificar código duplicado

#### Archivos a revisar:
```
v6.0/index.html (líneas relacionadas):
├── Modal estructura: ~14400-14500
├── openModal(): ~34847-34960
├── handleImageWithOptimizer(): ~35353-35560
├── updateMultimediaPreview(): ~35935-36040
├── removeMultimedia(): ~36043-36090
├── saveRepuesto(): ~36091-36400
└── Eventos input file: ~14468
```

---

### **FASE 2: REFACTORIZAR FUNCIONES CORE** (1 hora)
**Objetivo:** Reescribir funciones clave con lógica clara

#### 2.1 Función: `handleImageWithOptimizer()`
**Responsabilidad:** Procesar imagen seleccionada y agregarla a `currentMultimedia`

```javascript
async handleImageWithOptimizer(event) {
  // 1. Validar input
  // 2. Leer archivos del input
  // 3. Optimizar cada imagen (WebP)
  // 4. Agregar a currentMultimedia[]
  // 5. Actualizar preview
  // 6. NO guardar (esperar botón "Guardar")
  // 7. Log detallado
}
```

#### 2.2 Función: `removeMultimedia()`
**Responsabilidad:** Eliminar imagen del preview y marcar para eliminación física

```javascript
async removeMultimedia(index) {
  // 1. Validar index
  // 2. Guardar referencia a imagen para eliminar después
  // 3. Eliminar de currentMultimedia[]
  // 4. Actualizar preview
  // 5. Resetear input file
  // 6. NO eliminar archivo físico aún
  // 7. Marcar para eliminación al guardar
  // 8. Log detallado
}
```

#### 2.3 Función: `updateMultimediaPreview()`
**Responsabilidad:** Renderizar preview desde `currentMultimedia`

```javascript
async updateMultimediaPreview() {
  // 1. Limpiar contenedor preview
  // 2. Iterar currentMultimedia[]
  // 3. Cargar cada imagen (blob o FileSystem)
  // 4. Renderizar thumbnails con botón eliminar
  // 5. Actualizar contador badge
  // 6. Manejar estado vacío
  // 7. Log detallado
}
```

#### 2.4 Función: `saveRepuesto()` - Sección multimedia
**Responsabilidad:** Persistir cambios al guardar formulario

```javascript
async saveRepuesto() {
  // ... validaciones existentes ...
  
  // MULTIMEDIA:
  // 1. Copiar currentMultimedia → repuesto.multimedia
  // 2. Guardar archivos físicos nuevos en FileSystem
  // 3. Eliminar archivos físicos marcados
  // 4. Actualizar JSON (inventario.json / repuestos.json)
  // 5. Limpiar marcas de eliminación
  // 6. Log detallado
}
```

---

### **FASE 3: MEJORAR SINCRONIZACIÓN** (30 min)
**Objetivo:** Asegurar coherencia entre modal y datos

#### Tareas:
- [ ] Crear función `initMultimediaState()` - Inicializar estado al abrir modal
- [ ] Crear función `resetMultimediaState()` - Limpiar al cerrar modal
- [ ] Agregar validación de integridad antes de guardar
- [ ] Implementar sistema de "pendingDeletions" para archivos físicos

```javascript
// Estado multimedia del modal
multimediaState = {
  currentMultimedia: [],      // Imágenes actuales en preview
  pendingDeletions: [],       // Archivos físicos a eliminar al guardar
  originalMultimedia: []      // Backup para "Cancelar"
}
```

---

### **FASE 4: INPUT FILE ROBUSTO** (20 min)
**Objetivo:** Asegurar que input siempre responda

#### Tareas:
- [ ] Agregar reset explícito después de cada operación
- [ ] Implementar validación de estado del input
- [ ] Agregar listener para detectar cambios
- [ ] Manejar caso: eliminar última imagen + agregar nueva

```javascript
function resetImageInput() {
  const input = document.getElementById('imagenFile');
  if (input) {
    input.value = '';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Input reseteado');
  }
}
```

---

### **FASE 5: VALIDACIÓN Y PRUEBAS** (30 min)
**Objetivo:** Verificar todos los flujos posibles

#### Casos de prueba:

##### Test 1: Agregar imagen desde cero
```
1. Abrir modal nuevo repuesto
2. Ir a tab Multimedia
3. Seleccionar 2 imágenes
4. Verificar preview muestra 2 thumbnails
5. Guardar repuesto
6. Verificar archivos físicos creados
7. Verificar JSON actualizado
```

##### Test 2: Eliminar imagen existente
```
1. Abrir repuesto con 2 imágenes
2. Ir a tab Multimedia
3. Eliminar primera imagen
4. Verificar preview muestra 1 thumbnail
5. Verificar input reseteado
6. Guardar repuesto
7. Verificar archivo físico eliminado
8. Verificar JSON actualizado
```

##### Test 3: Eliminar + Agregar sin cerrar modal
```
1. Abrir repuesto con 1 imagen
2. Ir a tab Multimedia
3. Eliminar la imagen
4. Inmediatamente agregar nueva imagen
5. Verificar input responde
6. Verificar preview muestra nueva imagen
7. Guardar repuesto
8. Verificar archivo viejo eliminado
9. Verificar archivo nuevo creado
10. Verificar JSON correcto
```

##### Test 4: Cancelar cambios
```
1. Abrir repuesto con 2 imágenes
2. Eliminar ambas imágenes
3. Presionar "Cancelar"
4. Verificar archivos físicos NO eliminados
5. Verificar JSON sin cambios
```

##### Test 5: Multiple ediciones
```
1. Abrir repuesto con 1 imagen
2. Agregar 2 imágenes más (total: 3)
3. Eliminar la primera (total: 2)
4. Agregar 1 más (total: 3)
5. Eliminar 2 (total: 1)
6. Guardar
7. Verificar FileSystem tiene solo 1 archivo
8. Verificar JSON correcto
```

---

### **FASE 6: OPTIMIZACIÓN FINAL** (20 min)
**Objetivo:** Mejorar performance y UX

#### Tareas:
- [ ] Agregar loading spinner durante optimización WebP
- [ ] Implementar preview progresivo (mostrar mientras procesa)
- [ ] Agregar confirmación antes de eliminar última imagen
- [ ] Optimizar carga de blobs (reutilizar cache)
- [ ] Agregar indicador de cambios no guardados

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Estructura de datos propuesta:

```javascript
class MultimediaManager {
  constructor() {
    this.currentMultimedia = [];
    this.pendingDeletions = [];
    this.originalMultimedia = [];
  }

  // Inicializar al abrir modal
  async init(repuestoId = null) {
    this.reset();
    if (repuestoId) {
      const repuesto = app.repuestos.find(r => r.id === repuestoId);
      if (repuesto?.multimedia) {
        this.currentMultimedia = JSON.parse(JSON.stringify(repuesto.multimedia));
        this.originalMultimedia = JSON.parse(JSON.stringify(repuesto.multimedia));
      }
    }
    await this.renderPreview();
  }

  // Agregar imagen
  async addImage(file) {
    const optimized = await this.optimizeImage(file);
    this.currentMultimedia.push(optimized);
    await this.renderPreview();
    this.resetInput();
  }

  // Eliminar imagen
  async removeImage(index) {
    const image = this.currentMultimedia[index];
    
    // Si es imagen existente (FileSystem), marcar para eliminación
    if (image.isFileSystem && image.url) {
      this.pendingDeletions.push(image.url);
    }
    
    this.currentMultimedia.splice(index, 1);
    await this.renderPreview();
    this.resetInput();
  }

  // Guardar cambios
  async saveChanges(repuestoId) {
    // 1. Guardar nuevas imágenes en FileSystem
    for (const image of this.currentMultimedia) {
      if (!image.isFileSystem) {
        await fsManager.saveImage(image);
      }
    }

    // 2. Eliminar archivos marcados
    for (const url of this.pendingDeletions) {
      await fsManager.deleteImage(url);
    }

    // 3. Actualizar repuesto
    const repuesto = app.repuestos.find(r => r.id === repuestoId);
    repuesto.multimedia = [...this.currentMultimedia];

    // 4. Limpiar estado
    this.pendingDeletions = [];
    this.originalMultimedia = JSON.parse(JSON.stringify(this.currentMultimedia));
  }

  // Cancelar cambios
  cancel() {
    this.currentMultimedia = JSON.parse(JSON.stringify(this.originalMultimedia));
    this.pendingDeletions = [];
    this.renderPreview();
  }

  // Reset completo
  reset() {
    this.currentMultimedia = [];
    this.pendingDeletions = [];
    this.originalMultimedia = [];
  }

  // Renderizar preview
  async renderPreview() {
    const container = document.getElementById('imagePreview');
    container.innerHTML = '';

    if (this.currentMultimedia.length === 0) {
      container.innerHTML = '<p class="empty-state">Sin imágenes</p>';
      return;
    }

    for (let i = 0; i < this.currentMultimedia.length; i++) {
      const image = this.currentMultimedia[i];
      const url = await this.getImageUrl(image);
      
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${url}" alt="Preview ${i+1}">
        <button onclick="multimediaManager.removeImage(${i})" class="btn-remove">
          ❌
        </button>
      `;
      
      container.appendChild(div);
    }

    this.updateBadge();
  }

  // Helper: obtener URL de imagen
  async getImageUrl(image) {
    if (image.isFileSystem) {
      return await fsManager.loadImage(image.url);
    }
    return image.url; // Blob URL
  }

  // Helper: actualizar badge
  updateBadge() {
    const badge = document.getElementById('modalMultimediaCount');
    const count = this.currentMultimedia.length;
    badge.textContent = count === 0 ? 'Sin archivos' : `${count} archivo(s)`;
    badge.classList.toggle('sap-meta-chip--empty', count === 0);
  }

  // Helper: resetear input
  resetInput() {
    const input = document.getElementById('imagenFile');
    if (input) {
      input.value = '';
      console.log('✅ Input reseteado');
    }
  }

  // Helper: optimizar imagen
  async optimizeImage(file) {
    // Lógica de optimización WebP existente
    // Retornar objeto { type, url, name, size, ... }
  }
}

// Instancia global
const multimediaManager = new MultimediaManager();
```

---

## 📅 CRONOGRAMA

| Fase | Duración | Dependencias |
|------|----------|--------------|
| Fase 1: Auditoría | 30 min | - |
| Fase 2: Refactorizar | 1 hora | Fase 1 |
| Fase 3: Sincronización | 30 min | Fase 2 |
| Fase 4: Input File | 20 min | Fase 2 |
| Fase 5: Testing | 30 min | Fases 2-4 |
| Fase 6: Optimización | 20 min | Fase 5 |
| **TOTAL** | **3 horas** | |

---

## 🎯 CRITERIOS DE ÉXITO

### Funcionales:
- ✅ Agregar imágenes funciona consistentemente
- ✅ Eliminar imágenes actualiza JSON correctamente
- ✅ Input file responde después de eliminar
- ✅ No quedan referencias huérfanas
- ✅ Archivos físicos se sincronizan con JSON
- ✅ Cancelar restaura estado original

### Técnicos:
- ✅ Código limpio y documentado
- ✅ Logs detallados para debugging
- ✅ Sin errores en consola
- ✅ Performance < 500ms por operación
- ✅ Manejo robusto de errores

### UX:
- ✅ Visual actual se mantiene idéntico
- ✅ Feedback visual inmediato
- ✅ Loading spinners donde aplique
- ✅ Mensajes claros de error/éxito

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Perder datos existentes | Alto | Baja | Backup automático antes de cambios |
| Romper funcionalidad actual | Alto | Media | Testing exhaustivo en cada fase |
| Incompatibilidad FileSystem | Medio | Baja | Mantener fallback localStorage |
| Blobs no se liberan | Bajo | Media | Revocar URLs explícitamente |

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### Commits recomendados:
```bash
# Fase 1
git commit -m "refactor(multimedia): Auditoría completa del sistema"

# Fase 2
git commit -m "refactor(multimedia): Reescribir funciones core (add/remove/preview)"

# Fase 3
git commit -m "refactor(multimedia): Mejorar sincronización modal-datos"

# Fase 4
git commit -m "fix(multimedia): Input file robusto con reset automático"

# Fase 5
git commit -m "test(multimedia): Validar todos los flujos de uso"

# Fase 6
git commit -m "perf(multimedia): Optimizar UX y performance"
```

### Puntos de checkpoint:
- Después de cada fase: commit + push
- Antes de Fase 2: backup completo de index.html
- Después de Fase 5: testing con usuario real

---

## 🔍 MONITOREO POST-IMPLEMENTACIÓN

### Métricas a observar:
- Errores en consola relacionados con multimedia
- Tiempo de carga de imágenes
- Tamaño de repuestos.json
- Cantidad de archivos en INVENTARIO_STORAGE/imagenes/
- Feedback de usuarios

### Logs críticos:
```javascript
// Agregar imagen
console.log('📸 [ADD] Imagen agregada:', fileName, size);

// Eliminar imagen
console.log('🗑️ [DELETE] Imagen marcada para eliminación:', url);

// Guardar cambios
console.log('💾 [SAVE] Multimedia guardada:', {
  agregadas: newImages.length,
  eliminadas: deletions.length,
  total: currentMultimedia.length
});

// Errores
console.error('❌ [ERROR] Operación falló:', operation, error);
```

---

## ✅ CHECKLIST FINAL

### Antes de comenzar:
- [ ] Backup completo del proyecto
- [ ] Commit actual sincronizado con GitHub
- [ ] Servidor local funcionando
- [ ] Consola de DevTools abierta
- [ ] Plan de rollback definido

### Durante implementación:
- [ ] Seguir orden de fases estrictamente
- [ ] Probar después de cada cambio
- [ ] Documentar decisiones importantes
- [ ] Hacer commits frecuentes
- [ ] Mantener visual actual intacto

### Después de completar:
- [ ] Todos los tests pasan
- [ ] Sin errores en consola
- [ ] Documentación actualizada
- [ ] README actualizado
- [ ] Commit final con resumen completo

---

**Próximos pasos:** Comenzar con Fase 1 - Auditoría y Limpieza

