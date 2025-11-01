// ========================================
// MÓDULO DE ALMACENAMIENTO
// FileSystemManager + MapStorageService
// ========================================

class FileSystemManager {
  constructor() {
    this.directoryHandle = null;
    this.imagesFolder = null;
    this.isFileSystemMode = false;
    this.folderPath = '';
    this.dbName = 'InventarioFS';
    this.dbVersion = 1;
  }

  get storageHandle() {
    return this.directoryHandle;
  }

  get isConnected() {
    return this.isFileSystemMode && !!this.directoryHandle;
  }

  async saveDirectoryHandle(handle) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['directories'], 'readwrite');
        const store = transaction.objectStore('directories');
        store.put({ id: 'main', handle: handle, timestamp: Date.now() });
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('directories')) {
          db.createObjectStore('directories', { keyPath: 'id' });
        }
      };
    });
  }

  async loadDirectoryHandle() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['directories'], 'readonly');
        const store = transaction.objectStore('directories');
        const getRequest = store.get('main');
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result?.handle || null);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('directories')) {
          db.createObjectStore('directories', { keyPath: 'id' });
        }
      };
    });
  }

  async restoreFromPreviousSession() {
    try {
      const savedHandle = await this.loadDirectoryHandle();
      if (!savedHandle) {
        console.log('No hay carpeta guardada previamente');
        return false;
      }

      const permission = await savedHandle.queryPermission({ mode: 'readwrite' });
      
      if (permission === 'granted') {
        this.directoryHandle = savedHandle;
        await this.ensureImageFolder();
        this.folderPath = this.directoryHandle.name;
        this.isFileSystemMode = true;
        this.updateStatusIndicator(true, this.folderPath);
        console.log('- Sesin FileSystem restaurada automticamente:', this.folderPath);
        return true;
      } else if (permission === 'prompt') {
        const newPermission = await savedHandle.requestPermission({ mode: 'readwrite' });
        if (newPermission === 'granted') {
          this.directoryHandle = savedHandle;
          await this.ensureImageFolder();
          this.folderPath = this.directoryHandle.name;
          this.isFileSystemMode = true;
          this.updateStatusIndicator(true, this.folderPath);
          console.log('- Permisos re-otorgados, sesin restaurada:', this.folderPath);
          return true;
        }
      }
      
      console.log('  Permisos denegados, necesita reactivar manualmente');
      return false;
    } catch (error) {
      console.error('Error restaurando sesin:', error);
      return false;
    }
  }

  updateStatusIndicator(connected, path = '') {
    const indicator = document.getElementById('connectionIndicator');
    const btn = document.getElementById('connectionBtn');
    const icon = document.getElementById('connectionIcon');
    const text = document.getElementById('connectionText');

    if (connected) {
      // Actualizar indicador del panel de configuración
      if (indicator) {
        indicator.classList.remove('disconnected');
        indicator.classList.add('connected');
      }
      if (indicator?.querySelector('.connection-icon')) {
        indicator.querySelector('.connection-icon').textContent = 'ON';
      }
      if (indicator?.querySelector('.connection-text')) {
        indicator.querySelector('.connection-text').textContent = path ? `INVENTARIO_PORTABLE conectado (${path})` : 'INVENTARIO_PORTABLE conectado';
      }
      
      // Actualizar botón de estado en toolbar (nuevo diseño corporativo)
      if (btn) {
        btn.classList.remove('disconnected');
        btn.classList.add('connected');
      }
      if (text) {
        text.textContent = 'Conectado';
      }
    } else {
      // Actualizar indicador del panel de configuración
      if (indicator) {
        indicator.classList.remove('connected');
        indicator.classList.add('disconnected');
      }
      if (indicator?.querySelector('.connection-icon')) {
        indicator.querySelector('.connection-icon').textContent = 'OFF';
      }
      if (indicator?.querySelector('.connection-text')) {
        indicator.querySelector('.connection-text').textContent = 'INVENTARIO_STORAGE NO CONECTADO';
      }
      
      // Actualizar botón de estado en toolbar (nuevo diseño corporativo)
      if (btn) {
        btn.classList.remove('connected');
        btn.classList.add('disconnected');
      }
      if (text) {
        text.textContent = 'Desconectado';
      }
    }
  }

  async selectFolder() {
    try {
      const selectedFolder = await window.showDirectoryPicker({ mode: 'readwrite' });
      console.log('  Carpeta seleccionada por usuario:', selectedFolder.name);
      
      let workingFolder = selectedFolder;
      let detectedPath = selectedFolder.name;
      
      if (selectedFolder.name === 'INVENTARIO_PORTABLE') {
        console.log('  Detectado INVENTARIO_PORTABLE, buscando INVENTARIO_STORAGE dentro...');
        try {
          const storageFolder = await selectedFolder.getDirectoryHandle('INVENTARIO_STORAGE', { create: false });
          workingFolder = storageFolder;
          detectedPath = 'INVENTARIO_STORAGE';
          console.log('- INVENTARIO_STORAGE encontrado automticamente!');
        } catch (e) {
          console.warn('  INVENTARIO_STORAGE no encontrada, crendola...');
          const storageFolder = await selectedFolder.getDirectoryHandle('INVENTARIO_STORAGE', { create: true });
          workingFolder = storageFolder;
          detectedPath = 'INVENTARIO_STORAGE';
          console.log('- INVENTARIO_STORAGE creada automticamente!');
        }
      } else if (selectedFolder.name === 'INVENTARIO_STORAGE') {
        console.log('- INVENTARIO_STORAGE seleccionada directamente');
        detectedPath = 'INVENTARIO_STORAGE';
      } else {
        console.log('  Buscando INVENTARIO_STORAGE dentro de', selectedFolder.name);
        try {
          const storageFolder = await selectedFolder.getDirectoryHandle('INVENTARIO_STORAGE', { create: false });
          workingFolder = storageFolder;
          detectedPath = `${selectedFolder.name}/${storageFolder.name}`;
          console.log('- INVENTARIO_STORAGE encontrado dentro de', selectedFolder.name);
        } catch (e) {
          console.log('  INVENTARIO_STORAGE no encontrada, usando carpeta seleccionada como est');
        }
      }
      
      this.directoryHandle = workingFolder;
      await this.ensureImageFolder();
      
      await this.saveDirectoryHandle(this.directoryHandle);
      localStorage.setItem('fsDirectory', 'enabled');
      
      this.folderPath = detectedPath;
      localStorage.setItem('fsFolderName', this.folderPath);
      
      this.isFileSystemMode = true;
      console.log('- Sistema configurado con carpeta:', detectedPath);
      this.updateStatusIndicator(true, detectedPath);
      if (typeof mapStorage !== 'undefined' && mapStorage) {
        try {
          await mapStorage.init({ autoReconnect: false });
        } catch (error) {
          console.warn('No se pudo inicializar MapStorage tras seleccionar carpeta:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error seleccionando carpeta:', error);
      this.updateStatusIndicator(false);
      return false;
    }
  }

  async ensureImageFolder() {
    try {
      this.imagesFolder = await this.directoryHandle.getDirectoryHandle('imagenes', { create: true });
      console.log('- Carpeta "imagenes" accesible:', this.imagesFolder);
      
      let count = 0;
      for await (const entry of this.imagesFolder.values()) {
        count++;
        if (count <= 3) {
          console.log(`     Encontrado: ${entry.name}`);
        }
      }
      console.log(`     Total de archivos en carpeta imagenes: ${count}`);
    } catch (error) {
      console.error('- Error accediendo a carpeta imagenes:', error);
      this.imagesFolder = null;
    }
  }

  async saveJSON(data) {
    if (!this.isFileSystemMode) {
      return false; // No est en modo FileSystem
    }
    try {
      const fileHandle = await this.directoryHandle.getFileHandle('inventario.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
      console.log('- JSON guardado en archivo: inventario.json');
      return true;
    } catch (error) {
      console.error('- Error guardando JSON en FileSystem:', error);
      return false;
    }
  }

  async saveImage(blob, filename) {
    if (!this.isFileSystemMode) return null;
    try {
      const fileHandle = await this.imagesFolder.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      console.log('- Imagen guardada:', filename);
      return './imagenes/' + filename;
    } catch (error) {
      console.error('Error guardando imagen:', error);
      return null;
    }
  }

  /**
   * Guarda imagen en carpeta jerrquica segn ubicacin
   */
  async saveImageJerarquica(blob, filename, carpetaDestino) {
    if (!this.isFileSystemMode) return null;
    try {
      const fileHandle = await carpetaDestino.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      console.log('- Imagen guardada en carpeta jerrquica:', filename);
      return filename;
    } catch (error) {
      console.error('Error guardando imagen en carpeta jerrquica:', error);
      return null;
    }
  }

  /**
   * Refresca el handle de la carpeta imagenes para asegurar sincronizacin
   */
  async refreshImagesFolder() {
    if (this.isFileSystemMode && this.directoryHandle) {
      try {
        this.imagesFolder = await this.directoryHandle.getDirectoryHandle('imagenes', { create: true });
        console.log('- Handle de carpeta imagenes refrescado');
      } catch (error) {
        console.error('- Error refrescando handle de carpeta imagenes:', error);
      }
    }
  }

  /**
   * Elimina una imagen del FileSystem, soporta rutas jerrquicas
   */
  async deleteImage(imagePath) {
    if (!this.isFileSystemMode) return false;
    try {
      const relativePath = imagePath.replace('./imagenes/', '').replace('imagenes/', '');
      if (!relativePath) {
        console.warn('  Nombre de archivo invlido:', imagePath);
        return false;
      }
      // Si la ruta tiene subcarpetas (ej: TEST/archivo.webp)
      if (relativePath.includes('/')) {
        const parts = relativePath.split('/');
        const filename = parts.pop(); // ltimo elemento es el archivo
        let currentFolder = this.imagesFolder;
        // Navegar por las subcarpetas
        for (const folderName of parts) {
          try {
            currentFolder = await currentFolder.getDirectoryHandle(folderName);
          } catch (error) {
            console.warn(`  Carpeta no encontrada: ${folderName}`);
            return true; // Considerar xito si no existe
          }
        }
        // Eliminar archivo de la carpeta final
        await currentFolder.removeEntry(filename);
        console.log(`- Archivo eliminado: ${relativePath}`);
        return true;
      } else {
        // Archivo en la raz de imagenes/
        await this.imagesFolder.removeEntry(relativePath);
        console.log(`- Archivo eliminado: ${relativePath}`);
        return true;
      }
    } catch (error) {
      if (error.name === 'NotFoundError') {
        console.warn(`  Archivo no encontrado (ya estaba eliminado): ${imagePath}`);
        return true; // Considerar como xito si ya no existe
      }
      console.error('- Error eliminando imagen:', error);
      console.error('   Ruta:', imagePath);
      return false;
    }
  }

  async deleteMultipleImages(imagePaths) {
    if (!this.isFileSystemMode) return { deleted: 0, failed: 0 };
    
    let deleted = 0;
    let failed = 0;
    
    console.log(` - Eliminando ${imagePaths.length} imgenes del FileSystem...`);
    
    for (const imagePath of imagePaths) {
      const success = await this.deleteImage(imagePath);
      if (success) {
        deleted++;
      } else {
        failed++;
      }
    }
    
    console.log(`- Eliminadas: ${deleted} | - Fallidas: ${failed}`);
    return { deleted, failed };
  }

  async getAllImagesInFolder() {
    if (!this.isFileSystemMode) return [];
    
    try {
      const images = [];
      for await (const entry of this.imagesFolder.values()) {
        if (entry.kind === 'file') {
          images.push(entry.name);
        }
      }
      return images;
    } catch (error) {
      console.error('Error listando imgenes:', error);
      return [];
    }
  }

  async cleanOrphanImages(repuestos) {
    if (!this.isFileSystemMode) return { orphans: 0, deleted: 0, failed: 0, size: 0 };
    
    console.log('  Buscando imgenes hurfanas...');
    
    const allImages = await this.getAllImagesInFolder();
    console.log(`  Total de imgenes en carpeta: ${allImages.length}`);
    
    const referencedImages = new Set();
    repuestos.forEach(r => {
      if (r.multimedia) {
        r.multimedia
          .filter(m => m.type === 'image' && m.isFileSystem && m.url)
          .forEach(m => {
            const filename = m.url.replace('./imagenes/', '').replace('imagenes/', '');
            referencedImages.add(filename);
          });
      }
    });
    console.log(`  Imgenes referenciadas: ${referencedImages.size}`);
    
    const orphanImages = allImages.filter(img => !referencedImages.has(img));
    console.log(` - Imgenes hurfanas encontradas: ${orphanImages.length}`);
    
    if (orphanImages.length === 0) {
      return { orphans: 0, deleted: 0, failed: 0, size: 0 };
    }
    
    let totalSize = 0;
    for (const filename of orphanImages) {
      try {
        const fileHandle = await this.imagesFolder.getFileHandle(filename);
        const file = await fileHandle.getFile();
        totalSize += file.size;
      } catch (error) {
        console.warn(`  No se pudo leer tamao de: ${filename}`);
      }
    }
    
    let deleted = 0;
    let failed = 0;
    
    for (const filename of orphanImages) {
      try {
        await this.imagesFolder.removeEntry(filename);
        deleted++;
        console.log(`- Eliminada hurfana: ${filename}`);
      } catch (error) {
        failed++;
        console.error(`- Error eliminando: ${filename}`, error);
      }
    }
    
    console.log(`- Limpieza completada: ${deleted} eliminadas, ${failed} fallidas`);
    console.log(`  Espacio liberado: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    return { 
      orphans: orphanImages.length, 
      deleted, 
      failed, 
      size: totalSize 
    };
  }
}

class MapStorageService {
  constructor(fsManager) {
    this.fsManager = fsManager;
    this.maps = [];
    this.zones = [];
    this.maxBackups = 5;
    this.mapsFileName = 'mapas.json';
    this.zonesFileName = 'zonas.json';
    this.logsDirName = 'logs';
    this.logFileName = 'mapas-history.log';
    this.mapImagesPath = ['imagenes', 'mapas'];
    this.backupMapPath = ['backups', 'mapas'];
    this.backupZonePath = ['backups', 'zonas'];
    this.initialized = false;
    this.logsDirHandle = null;
    this.backupMapsDir = null;
    this.backupZonesDir = null;
    this.mapImagesDir = null;
  }

  get rootHandle() {
    return this.fsManager ? this.fsManager.storageHandle : null;
  }

  setMaxBackups(value) {
    if (typeof value === 'number' && value >= 1) {
      this.maxBackups = Math.floor(value);
    }
  }

  async init(options = {}) {
    const { autoReconnect = true } = options;
    if (!this.fsManager) {
      return false;
    }

    if (!this.fsManager.isConnected && autoReconnect && typeof this.fsManager.restoreFromPreviousSession === 'function') {
      try {
        await this.fsManager.restoreFromPreviousSession();
      } catch (error) {
        console.warn('No se pudo restaurar la carpeta de FileSystem:', error);
      }
    }

    if (!this.fsManager.isConnected) {
      return false;
    }

    await this.ensureStructure();
    await Promise.all([this.loadMaps(), this.loadZones()]);
    this.initialized = true;
    return true;
  }

  async ensureStructure() {
    const root = this.rootHandle;
    if (!root) {
      return;
    }

    this.mapImagesDir = await this.ensureDirectory(this.mapImagesPath);
    this.backupMapsDir = await this.ensureDirectory(this.backupMapPath);
    this.backupZonesDir = await this.ensureDirectory(this.backupZonePath);
    this.logsDirHandle = await this.ensureDirectory([this.logsDirName]);

    await this.ensureJSONFile(this.mapsFileName, '[]');
    await this.ensureJSONFile(this.zonesFileName, '[]');
    await this.ensureLogFile();
  }

  async ensureDirectory(pathSegments) {
    let current = this.rootHandle;
    if (!current) {
      return null;
    }

    for (const segment of pathSegments) {
      if (!segment) {
        continue;
      }
      current = await current.getDirectoryHandle(segment, { create: true });
    }

    return current;
  }

  async ensureJSONFile(fileName, defaultContent) {
    const root = this.rootHandle;
    if (!root) {
      return;
    }

    try {
      await root.getFileHandle(fileName);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        const handle = await root.getFileHandle(fileName, { create: true });
        const writable = await handle.createWritable();
        await writable.write(defaultContent);
        await writable.close();
      } else {
        console.warn(`No se pudo asegurar ${fileName}:`, error);
      }
    }
  }

  async ensureLogFile() {
    if (!this.logsDirHandle) {
      return;
    }

    try {
      await this.logsDirHandle.getFileHandle(this.logFileName);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        const handle = await this.logsDirHandle.getFileHandle(this.logFileName, { create: true });
        const writable = await handle.createWritable();
        await writable.write('');
        await writable.close();
      } else {
        console.warn('No se pudo asegurar el archivo de log:', error);
      }
    }
  }

  async loadMaps() {
    if (!this.fsManager || !this.fsManager.isConnected) {
      this.maps = [];
      return this.maps;
    }

    try {
      const fileHandle = await this.rootHandle.getFileHandle(this.mapsFileName, { create: true });
      const file = await fileHandle.getFile();
      const raw = (await file.text()).trim();
      let parsed = [];
      if (raw) {
        parsed = JSON.parse(raw);
      }
      this.maps = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('No se pudieron cargar los mapas:', error);
      this.maps = [];
    }

    return this.maps;
  }

  async loadZones() {
    if (!this.fsManager || !this.fsManager.isConnected) {
      this.zones = [];
      return this.zones;
    }

    try {
      const fileHandle = await this.rootHandle.getFileHandle(this.zonesFileName, { create: true });
      const file = await fileHandle.getFile();
      const raw = (await file.text()).trim();
      let parsed = [];
      if (raw) {
        parsed = JSON.parse(raw);
      }
      this.zones = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('No se pudieron cargar las zonas:', error);
      this.zones = [];
    }

    return this.zones;
  }

  async writeJSON(fileName, data) {
    if (!this.fsManager || !this.fsManager.isConnected) {
      return false;
    }

    try {
      const handle = await this.rootHandle.getFileHandle(fileName, { create: true });
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
      return true;
    } catch (error) {
      console.warn(`No se pudo escribir ${fileName}:`, error);
      return false;
    }
  }

  async saveMaps(maps, meta = {}) {
    const normalized = Array.isArray(maps) ? maps : [];

    if (!this.fsManager || !this.fsManager.isConnected) {
      this.maps = [...normalized];
      return false;
    }

    await this.createBackup(this.mapsFileName, 'maps');
    await this.writeJSON(this.mapsFileName, normalized);
    this.maps = [...normalized];

    await this.appendLog({ scope: 'maps', action: meta.action || 'save', mapId: meta.mapId || null, detail: meta.detail || null });
    return true;
  }

  async saveZones(zones, meta = {}) {
    const normalized = Array.isArray(zones) ? zones : [];

    if (!this.fsManager || !this.fsManager.isConnected) {
      this.zones = [...normalized];
      return false;
    }

    await this.createBackup(this.zonesFileName, 'zones');
    await this.writeJSON(this.zonesFileName, normalized);
    this.zones = [...normalized];

    await this.appendLog({ scope: 'zones', action: meta.action || 'save', mapId: meta.mapId || null, zoneId: meta.zoneId || null, detail: meta.detail || null });
    return true;
  }

  async createBackup(fileName, namespace) {
    if (!this.fsManager || !this.fsManager.isConnected) {
      return;
    }

    const dirHandle = namespace === 'zones' ? this.backupZonesDir : this.backupMapsDir;
    if (!dirHandle) {
      return;
    }

    try {
      const fileHandle = await this.rootHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const content = await file.text();
      if (!content || !content.trim()) {
        return;
      }

      const timestamp = this.formatTimestamp(new Date());
      const baseName = fileName.replace('.json', '');
      const backupHandle = await dirHandle.getFileHandle(`${baseName}-${timestamp}.json`, { create: true });
      const writable = await backupHandle.createWritable();
      await writable.write(content);
      await writable.close();

      await this.rotateBackups(dirHandle);
    } catch (error) {
      if (error.name !== 'NotFoundError') {
        console.warn(`No se pudo crear backup para ${fileName}:`, error);
      }
    }
  }

  async rotateBackups(dirHandle) {
    if (!dirHandle) {
      return;
    }

    const files = [];
    try {
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          files.push(entry.name);
        }
      }
    } catch (error) {
      console.warn('No se pudo enumerar los backups:', error);
      return;
    }

    files.sort();

    while (files.length > this.maxBackups) {
      const oldest = files.shift();
      try {
        await dirHandle.removeEntry(oldest);
      } catch (error) {
        console.warn('No se pudo eliminar backup antiguo:', oldest, error);
        break;
      }
    }
  }

  async appendLog(event) {
    if (!event || typeof event !== 'object') {
      return;
    }

    if (!this.logsDirHandle) {
      return;
    }

    try {
      const payload = {
        scope: event.scope || 'maps',
        action: event.action || 'update',
        mapId: event.mapId || null,
        zoneId: event.zoneId || null,
        detail: event.detail || null,
        timestamp: new Date().toISOString()
      };
      const handle = await this.logsDirHandle.getFileHandle(this.logFileName, { create: true });
      const file = await handle.getFile();
      const writable = await handle.createWritable({ keepExistingData: true });
      await writable.seek(file.size);
      await writable.write(JSON.stringify(payload) + '\n');
      await writable.close();
    } catch (error) {
      console.warn('No se pudo registrar el evento de mapa:', error);
    }
  }

  async readLog(limit = null) {
    if (!this.logsDirHandle) {
      return [];
    }

    try {
      const handle = await this.logsDirHandle.getFileHandle(this.logFileName, { create: true });
      const file = await handle.getFile();
      const text = await file.text();
      if (!text) {
        return [];
      }

      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const events = [];
      for (const line of lines) {
        try {
          events.push(JSON.parse(line));
        } catch (error) {
          console.warn('Entrada de log invalida:', line);
        }
      }

      if (typeof limit === 'number' && limit > 0) {
        return events.slice(-limit);
      }

      return events;
    } catch (error) {
      console.warn('No se pudo leer el log de mapas:', error);
      return [];
    }
  }

  async getFileHandleFromPath(path) {
    if (!this.fsManager || !this.fsManager.isConnected) {
      return null;
    }

    const segments = Array.isArray(path) ? path : String(path || '').split('/').filter(Boolean);
    if (!segments.length) {
      return null;
    }

    let currentDir = this.rootHandle;
    try {
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const isLast = i === segments.length - 1;
        if (isLast) {
          return await currentDir.getFileHandle(segment, { create: false });
        }
        currentDir = await currentDir.getDirectoryHandle(segment, { create: false });
      }
    } catch (error) {
      console.warn('No se pudo resolver ruta de archivo:', path, error);
      return null;
    }

    return null;
  }

  async getMapImage(map) {
    if (!map || !map.imagePath) {
      return null;
    }

    try {
      const handle = await this.getFileHandleFromPath(map.imagePath);
      if (!handle) {
        return null;
      }
      return await handle.getFile();
    } catch (error) {
      console.warn('No se pudo obtener imagen del mapa:', error);
      return null;
    }
  }
  getMapById(mapId) {
    return this.maps.find(map => map.id === mapId) || null;
  }

  getZonesByMap(mapId) {
    return this.zones.filter(zone => zone.mapId === mapId);
  }

  formatTimestamp(date = new Date()) {
    const pad = (value) => String(value).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
  }
}

// Instancias globales
const fsManager = new FileSystemManager();
const mapStorage = new MapStorageService(fsManager);

export { fsManager, mapStorage, FileSystemManager, MapStorageService };
