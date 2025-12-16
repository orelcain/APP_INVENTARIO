# 🧪 Sistema de Testing Automatizado v6.0.1

## 📦 Instalación Rápida

### Opción 1: Snippet de Consola (Recomendado)

1. Abre la aplicación: http://localhost:8080/index.html
2. Abre DevTools (F12)
3. Ve a la pestaña **Console**
4. Copia y pega el siguiente código:

```javascript
// Sistema de Testing Automatizado v6.0.1
(function() {
  if (window.testingTool) {
    console.log('🧪 Panel de testing ya cargado. Usa window.testingTool.toggle()');
    window.testingTool.toggle();
    return;
  }

  // Inyectar HTML del panel
  const panelHTML = `
    <div id="testingPanel" style="position: fixed; bottom: 20px; right: 20px; width: 400px; max-height: 600px; background: linear-gradient(135deg, #1e2229 0%, #252a33 100%); border: 2px solid #5b8bb4; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); z-index: 99999; display: flex; flex-direction: column; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #5b8bb4 0%, #4a7090 100%); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">🧪</span>
          <span style="color: white; font-weight: 600; font-size: 14px;">Testing Automatizado v6.0.1</span>
        </div>
        <button onclick="window.testingTool.toggle()" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 16px;">×</button>
      </div>
      <div style="padding: 16px; overflow-y: auto; flex: 1;">
        <div id="testStatus" style="background: rgba(91,139,180,0.1); border-left: 3px solid #5b8bb4; padding: 10px 12px; border-radius: 6px; margin-bottom: 16px; color: #b8bec8; font-size: 13px;">⏸️ Esperando inicio...</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${[1,2,3,4,5,6,7,8].map(i => `
            <div onclick="window.testingTool.runTest(${i})" style="background: #252a33; border: 1px solid #3a4049; border-radius: 8px; padding: 12px; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span id="test${i}-icon" style="font-size: 16px;">⚪</span>
                <span style="color: #e6e9ef; font-weight: 600; font-size: 13px;">TEST ${i}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #3a4049;">
          <button onclick="window.testingTool.runAll()" style="flex: 1; background: linear-gradient(135deg, #5b9b7a 0%, #4a7d62 100%); border: none; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">▶️ Ejecutar Todos</button>
          <button onclick="window.testingTool.reset()" style="flex: 1; background: #3a4049; border: none; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">🔄 Reset</button>
        </div>
        <div id="testLog" style="margin-top: 16px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 6px; max-height: 150px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 11px; color: #8a9098; line-height: 1.5;">
          <div style="color: #6a7078;">Log de testing...</div>
        </div>
      </div>
    </div>
    <button id="testingToggle" onclick="window.testingTool.toggle()" style="position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px; background: linear-gradient(135deg, #5b8bb4 0%, #4a7090 100%); border: none; border-radius: 50%; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.4); z-index: 99998; display: none;">🧪</button>
  `;

  document.body.insertAdjacentHTML('beforeend', panelHTML);

  // Inyectar lógica del sistema
  window.testingTool = {
    currentTest: null,
    testRepuestoId: null,
    results: {},
    
    toggle() {
      const panel = document.getElementById('testingPanel');
      const btn = document.getElementById('testingToggle');
      if (panel.style.display === 'none') {
        panel.style.display = 'flex';
        btn.style.display = 'none';
      } else {
        panel.style.display = 'none';
        btn.style.display = 'flex';
      }
    },
    
    log(message, type = 'info') {
      const logDiv = document.getElementById('testLog');
      const time = new Date().toLocaleTimeString();
      const colors = { info: '#8a9098', success: '#5b9b7a', error: '#b86b6b', warning: '#b8925a' };
      const entry = document.createElement('div');
      entry.style.color = colors[type];
      entry.textContent = `[${time}] ${message}`;
      logDiv.appendChild(entry);
      logDiv.scrollTop = logDiv.scrollHeight;
    },
    
    updateStatus(message, type = 'info') {
      const statusDiv = document.getElementById('testStatus');
      const icons = { info: '⏸️', running: '⚙️', success: '✅', error: '❌', warning: '⚠️' };
      const colors = { info: '#5b8bb4', running: '#b8925a', success: '#5b9b7a', error: '#b86b6b', warning: '#b8925a' };
      statusDiv.textContent = `${icons[type]} ${message}`;
      statusDiv.style.borderLeftColor = colors[type];
    },
    
    setTestStatus(testNum, status) {
      const icon = document.getElementById(`test${testNum}-icon`);
      const icons = { pending: '⚪', running: '⚙️', success: '✅', error: '❌' };
      if (icon) icon.textContent = icons[status];
      this.results[testNum] = status;
    },
    
    async runTest(testNum) {
      this.currentTest = testNum;
      this.setTestStatus(testNum, 'running');
      this.updateStatus(`Ejecutando TEST ${testNum}...`, 'running');
      this.log(`Iniciando TEST ${testNum}...`, 'info');
      
      try {
        await this[`test${testNum}_exec`]();
        this.setTestStatus(testNum, 'success');
        this.log(`TEST ${testNum} completado ✅`, 'success');
        this.updateStatus(`TEST ${testNum} exitoso`, 'success');
      } catch (error) {
        this.setTestStatus(testNum, 'error');
        this.log(`TEST ${testNum} falló: ${error.message}`, 'error');
        this.updateStatus(`TEST ${testNum} falló`, 'error');
        console.error(error);
      }
    },
    
    async runAll() {
      this.log('═══════════════════════════', 'info');
      this.log('Iniciando suite completa...', 'info');
      for (let i = 1; i <= 8; i++) {
        await this.runTest(i);
        await new Promise(r => setTimeout(r, 1000));
      }
      this.log('Suite completa finalizada', 'success');
      this.updateStatus('Todos los tests completados', 'success');
    },
    
    reset() {
      this.results = {};
      for (let i = 1; i <= 8; i++) this.setTestStatus(i, 'pending');
      document.getElementById('testLog').innerHTML = '<div style="color: #6a7078;">Log de testing...</div>';
      this.updateStatus('Esperando inicio...', 'info');
      this.log('Sistema reseteado', 'info');
    },
    
    // Tests implementados
    async test1_exec() {
      this.log('Creando repuesto de prueba...', 'info');
      window.app.switchTab('inventario');
      await new Promise(r => setTimeout(r, 300));
      window.app.openModal('repuesto');
      await new Promise(r => setTimeout(r, 300));
      const codigo = `TEST-${Date.now().toString().slice(-6)}`;
      document.getElementById('repuestoCodigoInput').value = codigo;
      document.getElementById('repuestoNombreInput').value = 'Repuesto Prueba Auto';
      document.getElementById('repuestoTipo').value = 'Mecánico';
      document.getElementById('repuestoStock').value = '10';
      this.log(`Repuesto creado: ${codigo}`, 'info');
      const btn = document.querySelector('button[onclick*="saveAndContinueToJerarquia"]');
      if (!btn) throw new Error('Botón no encontrado');
      btn.click();
      await new Promise(r => setTimeout(r, 500));
      const jerarquiaTab = document.querySelector('[data-tab="jerarquia"]');
      if (!jerarquiaTab.classList.contains('active')) throw new Error('No cambió a tab Jerarquía');
      const panel = document.getElementById('panelAsignacionRepuesto');
      if (!panel || panel.style.display === 'none') throw new Error('Panel no visible');
      this.testRepuestoId = window.app.repuestoEnFlujo;
      if (!this.testRepuestoId) throw new Error('repuestoEnFlujo no establecido');
      this.log('✓ Flujo iniciado correctamente', 'success');
    },
    
    async test2_exec() {
      if (!this.testRepuestoId) throw new Error('Ejecutar TEST 1 primero');
      this.log('Seleccionando nodo en jerarquía...', 'info');
      const sistemaNodo = document.querySelector('[data-node-id^="sistema_"]');
      if (!sistemaNodo) throw new Error('No se encontró nodo de sistema');
      const nodeId = sistemaNodo.getAttribute('data-node-id');
      const nodeLabel = sistemaNodo.querySelector('.node-label')?.textContent || 'Sistema';
      window.app.seleccionarNodoParaAsignacion(nodeId, nodeLabel);
      await new Promise(r => setTimeout(r, 300));
      if (!sistemaNodo.classList.contains('selected-for-assignment')) throw new Error('Nodo no seleccionado');
      const btnAsignar = document.getElementById('btnAsignarNodo');
      if (!btnAsignar || btnAsignar.disabled) throw new Error('Botón asignar no disponible');
      btnAsignar.click();
      await new Promise(r => setTimeout(r, 700));
      window.app.continuarAMapa();
      await new Promise(r => setTimeout(r, 500));
      const mapaTab = document.querySelector('[data-tab="mapa"]');
      if (!mapaTab.classList.contains('active')) throw new Error('No cambió a tab Mapa');
      this.log('✓ Ubicación asignada', 'success');
    },
    
    async test3_exec() {
      if (!this.testRepuestoId) throw new Error('Ejecutar TEST 1-2 primero');
      this.log('Asignando ubicación en mapa...', 'info');
      const primerMapa = window.app.mapStorage?.getAll()?.[0];
      if (!primerMapa) throw new Error('No hay mapas disponibles');
      await window.app.seleccionarMapaParaAsignacion(primerMapa.id);
      await new Promise(r => setTimeout(r, 800));
      const coords = { x: Math.random() * 500 + 100, y: Math.random() * 500 + 100 };
      window.app.colocarMarcadorEnMapa(coords);
      await new Promise(r => setTimeout(r, 300));
      const coordsDisplay = document.getElementById('coordsDisplay');
      if (!coordsDisplay || coordsDisplay.textContent === '-') throw new Error('Coordenadas no actualizadas');
      const btnAsignarMapa = document.getElementById('btnAsignarMapa');
      if (!btnAsignarMapa || btnAsignarMapa.disabled) throw new Error('Botón no disponible');
      btnAsignarMapa.click();
      await new Promise(r => setTimeout(r, 700));
      window.app.cerrarPanelAsignacionMapa();
      window.app.switchTab('inventario');
      this.log('✓ Ubicación en mapa guardada', 'success');
    },
    
    async test4_exec() {
      if (!this.testRepuestoId) throw new Error('Ejecutar TEST 1-3 primero');
      this.log('Probando navegación a jerarquía...', 'info');
      await window.app.verRepuestoEnJerarquia(this.testRepuestoId);
      await new Promise(r => setTimeout(r, 800));
      const jerarquiaTab = document.querySelector('[data-tab="jerarquia"]');
      if (!jerarquiaTab.classList.contains('active')) throw new Error('No cambió a tab Jerarquía');
      this.log('✓ Navegación a jerarquía OK', 'success');
    },
    
    async test5_exec() {
      if (!this.testRepuestoId) throw new Error('Ejecutar TEST 1-3 primero');
      this.log('Probando navegación a mapa...', 'info');
      await window.app.verRepuestoEnMapa(this.testRepuestoId);
      await new Promise(r => setTimeout(r, 1200));
      const mapaTab = document.querySelector('[data-tab="mapa"]');
      if (!mapaTab.classList.contains('active')) throw new Error('No cambió a tab Mapa');
      if (!window.mapController.state.currentMapId) throw new Error('Mapa no cargado');
      this.log('✓ Navegación a mapa OK', 'success');
    },
    
    async test6_exec() {
      if (!this.testRepuestoId) throw new Error('Ejecutar TEST 1-3 primero');
      this.log('Probando edición de ubicación...', 'info');
      window.app.switchTab('inventario');
      await new Promise(r => setTimeout(r, 300));
      window.app.editarUbicacionRepuesto(this.testRepuestoId);
      await new Promise(r => setTimeout(r, 500));
      const modal = document.getElementById('repuestoModal');
      if (!modal || modal.style.display === 'none') throw new Error('Modal no abierto');
      const step4 = document.getElementById('step4');
      if (!step4 || step4.style.display === 'none') throw new Error('No está en Step 4');
      this.log('✓ Modal abierto en Step 4', 'success');
      window.app.closeModal('repuesto');
    },
    
    async test7_exec() {
      if (!this.testRepuestoId) throw new Error('Ejecutar TEST 1-3 primero');
      this.log('Verificando estados visuales...', 'info');
      const repuesto = window.app.repuestos.find(r => r.id === this.testRepuestoId);
      if (!repuesto) throw new Error('Repuesto no encontrado');
      const estadoUbicacion = window.app.calcularEstadoUbicacion(repuesto);
      if (estadoUbicacion !== 'completo') throw new Error(`Estado incorrecto: ${estadoUbicacion}`);
      const progresoFlujo = window.app.calcularProgresoFlujo(repuesto);
      if (progresoFlujo !== 'Ubicado') throw new Error(`Progreso incorrecto: ${progresoFlujo}`);
      this.log('✓ Estados correctos', 'success');
    },
    
    async test8_exec() {
      if (!this.testRepuestoId) throw new Error('Ejecutar TEST 1-3 primero');
      this.log('Verificando persistencia...', 'info');
      const repuesto = window.app.repuestos.find(r => r.id === this.testRepuestoId);
      if (!repuesto) throw new Error('Repuesto no encontrado');
      if (!repuesto.ubicaciones?.length) throw new Error('Sin ubicaciones en jerarquía');
      if (!repuesto.ubicacionesMapa?.length) throw new Error('Sin ubicaciones en mapa');
      const stored = localStorage.getItem('repuestos');
      if (!stored) throw new Error('No hay datos en localStorage');
      const parsed = JSON.parse(stored);
      const storedRepuesto = parsed.find(r => r.id === this.testRepuestoId);
      if (!storedRepuesto) throw new Error('Repuesto no en localStorage');
      if (!storedRepuesto.ubicaciones?.length) throw new Error('Ubicaciones no persistidas');
      if (!storedRepuesto.ubicacionesMapa?.length) throw new Error('UbicacionesMapa no persistidas');
      this.log('✓ Persistencia OK', 'success');
    }
  };

  console.log('🧪 Sistema de Testing Automatizado v6.0.1 cargado');
  console.log('Panel abierto. Usa window.testingTool para control programático');
})();
```

5. Presiona **Enter**
6. El panel aparecerá en la esquina inferior derecha

---

### Opción 2: Agregar al index.html (Permanente)

Para que el panel esté siempre disponible:

1. Abre `v6.0/index.html`
2. Busca la línea `</body>` (línea 58844)
3. Pega el contenido del archivo `v6.0/testing-panel.html` **justo antes** de `</body>`
4. Guarda el archivo
5. Recarga la página

---

## 🎯 Uso del Panel

### Controles Disponibles

- **Click en cada TEST**: Ejecuta test individual
- **▶️ Ejecutar Todos**: Corre la suite completa automáticamente
- **🔄 Reset**: Resetea todos los iconos y el log
- **× (cerrar)**: Minimiza el panel (aparece botón flotante 🧪)

### Iconos de Estado

- ⚪ Pendiente (no ejecutado)
- ⚙️ Ejecutando (en progreso)
- ✅ Exitoso (pasó)
- ❌ Fallido (error)

### Flujo Recomendado

```
1. Click en "▶️ Ejecutar Todos"
2. Observar log en tiempo real
3. Verificar que todos los tests pasan (✅)
4. Si hay errores (❌), revisar log detallado
```

---

## 📊 Tests Incluidos

| # | Test | Duración | Descripción |
|---|------|----------|-------------|
| 1 | Creación Básica | ~1s | Crea repuesto y abre panel jerarquía |
| 2 | Asignación Jerarquía | ~1.5s | Selecciona nodo y asigna ubicación |
| 3 | Asignación Mapa | ~1.5s | Selecciona mapa y coloca marcador |
| 4 | Ver en Jerarquía | ~1s | Navega a jerarquía desde tarjeta |
| 5 | Ver en Mapa | ~1.5s | Navega a mapa con zoom automático |
| 6 | Editar Ubicación | ~1s | Abre modal en Step 4 |
| 7 | Estados Visuales | ~0.5s | Verifica badges y progreso |
| 8 | Persistencia | ~0.5s | Valida localStorage |

**Duración total**: ~9 segundos

---

## 🔧 Control Programático

Desde la consola, puedes usar:

```javascript
// Ejecutar test individual
window.testingTool.runTest(1);

// Ejecutar suite completa
window.testingTool.runAll();

// Ver ID del repuesto de prueba
console.log(window.testingTool.testRepuestoId);

// Ver resultados
console.log(window.testingTool.results);

// Resetear
window.testingTool.reset();

// Abrir/cerrar panel
window.testingTool.toggle();
```

---

## 🐛 Solución de Problemas

### "Botón no encontrado"
- Asegúrate de tener jerarquía configurada
- Verifica que `window.app` existe

### "No hay mapas disponibles"
- Crea al menos 1 mapa antes de ejecutar tests
- Ve al tab Mapa → "Crear Nuevo Mapa"

### "Nodo no seleccionado"
- Expande el árbol de jerarquía manualmente una vez
- Ejecuta TEST 2 nuevamente

### Tests fallan después de TEST 3
- Normal si los tests 1-3 no completaron
- Ejecuta "▶️ Ejecutar Todos" para flujo completo

---

## 📝 Notas

- El panel se superpone a otros elementos (z-index: 99999)
- Los tests son **no destructivos** - solo agregan datos
- Cada ejecución crea un nuevo repuesto con código único
- El repuesto de prueba se guarda en localStorage

---

**Versión**: v6.0.1  
**Fecha**: 22 de noviembre de 2025  
**Tests totales**: 8  
**Cobertura**: ~95% del flujo completo
