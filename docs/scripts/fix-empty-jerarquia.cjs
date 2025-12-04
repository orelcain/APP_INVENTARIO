const fs = require('fs');
const path = require('path');

const ZONAS_FILE = path.join(__dirname, '../INVENTARIO_STORAGE/zonas.json');

function fixZonas() {
  const zonas = JSON.parse(fs.readFileSync(ZONAS_FILE, 'utf8'));
  
  let fixed = 0;
  
  const zonasFixed = zonas.map(zona => {
    // Si jerarquia está vacía o no tiene nivel1
    if (!zona.jerarquia || !zona.jerarquia.nivel1) {
      console.log(`🔧 Corrigiendo zona: ${zona.name} (ID: ${zona.id})`);
      
      // Crear jerarquia básica
      zona.jerarquia = {
        nivel1: 'Aquachile Antarfood',
        nivel2: zona.name || 'Sin nombre',
        nivel3: null,
        nivel4: null,
        nivel5: null,
        nivel6: null,
        nivel7: null
      };
      
      fixed++;
    }
    
    return zona;
  });
  
  // Guardar
  fs.writeFileSync(ZONAS_FILE, JSON.stringify(zonasFixed, null, 2));
  
  console.log(`\n✅ Corrección completada: ${fixed} zonas corregidas`);
}

fixZonas();
