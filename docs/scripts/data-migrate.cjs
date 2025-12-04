#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const pretty = args.includes('--pretty');
const clearMedia = args.includes('--clear-media');

const projectRoot = path.resolve(__dirname, '..');
const storageDir = path.join(projectRoot, 'INVENTARIO_STORAGE');
const imagesDir = path.join(storageDir, 'imagenes');

const jerarquiaLevels = [
  { id: 'planta', storageKey: 'nivel1', label: 'Empresa / Planta' },
  { id: 'areaGeneral', storageKey: 'nivel2', label: 'Area general' },
  { id: 'subArea', storageKey: 'nivel3', label: 'Sub-area' },
  { id: 'sistemaEquipo', storageKey: 'nivel4', label: 'Sistema / Equipo' },
  { id: 'subSistema', storageKey: 'nivel5', label: 'Sub-sistema' },
  { id: 'seccion', storageKey: 'nivel6', label: 'Seccion' },
  { id: 'subSeccion', storageKey: 'nivel7', label: 'Sub-seccion' },
  { id: 'detalle', storageKey: 'nivel8', label: 'Detalle / Ubicacion' }
];

const levelAliases = {
  planta: ['nivel1', 'empresa', 'site', 'plantaBase'],
  areaGeneral: ['nivel2', 'area', 'area_general'],
  subArea: ['nivel3', 'subarea', 'area_detallada'],
  sistemaEquipo: ['nivel4', 'equipo', 'sistema', 'sistema_equipo'],
  subSistema: ['nivel5', 'subsistema'],
  seccion: ['nivel6', 'section'],
  subSeccion: ['nivel7', 'subseccion'],
  detalle: ['nivel8', 'detalleubicacion', 'ubicacion', 'areaDetallada']
};

const levelMapById = jerarquiaLevels.reduce((map, level) => {
  map[level.id] = level;
  return map;
}, {});

const levelMapByStorageKey = jerarquiaLevels.reduce((map, level) => {
  map[level.storageKey] = level;
  return map;
}, {});

const hasImagesDir = fs.existsSync(imagesDir);

function loadJson(filePath) {
  const buffer = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(buffer);
}

function saveJson(filePath, data) {
  const json = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(filePath, json, 'utf8');
}

function slugify(input) {
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'node';
}

function generateNodeId(level, name) {
  const slug = slugify(name || level.id);
  const hash = crypto
    .createHash('md5')
    .update(`${level.storageKey}:${slug}`)
    .digest('hex')
    .slice(0, 8);
  return `auto-${level.storageKey}-${slug}-${hash}`;
}

function clonePath(path) {
  return Array.isArray(path) ? path.map((segment) => ({ ...segment })) : [];
}

function sanitizePath(path) {
  if (!Array.isArray(path)) {
    return [];
  }

  return path
    .map((segment) => {
      if (!segment) return null;
      const nivel = resolveLevelId(segment);
      if (!nivel) return null;
      const level = levelMapById[nivel] || levelMapByStorageKey[segment.storageKey];
      if (!level) return null;
      const nameCandidate = segment.name || segment.label || segment.value || segment.id;
      const nodeId = segment.id && String(segment.id).trim()
        ? String(segment.id).trim()
        : generateNodeId(level, nameCandidate);
      return {
        id: nodeId,
        nivel: level.id,
        storageKey: level.storageKey,
        name: String(nameCandidate || level.label).trim()
      };
    })
    .filter(Boolean);
}

function resolveLevelId(segment) {
  if (!segment) return null;
  if (segment.nivel) return segment.nivel;
  if (segment.level) return segment.level;
  if (segment.storageKey && levelMapByStorageKey[segment.storageKey]) {
    return levelMapByStorageKey[segment.storageKey].id;
  }
  return null;
}

function lookupValue(source, key) {
  if (!source || typeof source !== 'object') {
    return null;
  }
  if (source[key] && typeof source[key] === 'string' && source[key].trim()) {
    return source[key].trim();
  }
  const lowerKey = key.toLowerCase();
  for (const prop of Object.keys(source)) {
    if (prop.toLowerCase() === lowerKey) {
      const value = source[prop];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
  }
  return null;
}

function extractLevelValue(source, level, levelIndex) {
  const aliasKeys = new Set([
    level.id,
    level.id.toLowerCase(),
    level.storageKey,
    level.storageKey.toLowerCase(),
    `nivel${levelIndex + 1}`,
    ...(levelAliases[level.id] || [])
  ]);

  const containers = [source, source?.jerarquia, source?.metadata?.jerarquia];
  for (const container of containers) {
    for (const key of aliasKeys) {
      const value = lookupValue(container, key);
      if (value) {
        return value;
      }
    }
  }
  return null;
}

function buildJerarquiaPath(source, options = {}) {
  if (Array.isArray(source?.jerarquiaPath) && source.jerarquiaPath.length) {
    return sanitizePath(source.jerarquiaPath);
  }

  const values = {};
  jerarquiaLevels.forEach((level, index) => {
    const value = extractLevelValue(source, level, index);
    if (value) {
      values[level.id] = value;
    }
  });

  const path = jerarquiaLevels
    .filter((level) => values[level.id])
    .map((level) => ({
      id: generateNodeId(level, values[level.id]),
      nivel: level.id,
      storageKey: level.storageKey,
      name: values[level.id]
    }));

  if (path.length) {
    return path;
  }

  if (Array.isArray(options.fallbackPath) && options.fallbackPath.length) {
    return clonePath(options.fallbackPath);
  }

  return [];
}

function buildJerarquiaObject(path) {
  const jerarquia = {};
  path.forEach((segment) => {
    const config = levelMapById[segment.nivel];
    if (config) {
      jerarquia[config.storageKey] = segment.name;
    }
  });
  return jerarquia;
}

function normalizeMediaEntry(entry = {}) {
  if (!entry) {
    return null;
  }

  if (typeof entry === 'string') {
    return normalizeMediaEntry({ type: 'image', url: entry });
  }

  const url = typeof entry.url === 'string' ? entry.url.trim() : '';
  if (!url) {
    return null;
  }

  const name = entry.name || entry.filename || entry.originalName || path.basename(url);
  const normalized = {
    type: 'image',
    url,
    name,
    size: entry.size || entry.originalSize || entry.tamano || 0,
    mimeType: entry.mimeType || entry.type || 'image/webp'
  };

  if (entry.isFileSystem || url.startsWith('./imagenes/') || url.startsWith('imagenes/') || url.startsWith('/imagenes/')) {
    normalized.isFileSystem = true;
  }

  if (entry.isIndexedDB) {
    normalized.isIndexedDB = true;
  }

  return normalized;
}

function extractFilename(url) {
  if (!url) return '';
  const cleaned = url.replace(/^\.\//, '').replace(/^\//, '');
  return cleaned.startsWith('imagenes/') ? cleaned.slice('imagenes/'.length) : cleaned;
}

function fileExistsInImages(url) {
  if (!hasImagesDir) return false;
  const filename = extractFilename(url);
  if (!filename) return false;
  return fs.existsSync(path.join(imagesDir, filename));
}

function normalizeMapEntry(entry = {}) {
  const allowFreeLevel = Boolean(entry.allowFreeLevel);
  const path = allowFreeLevel ? sanitizePath(entry.jerarquiaPath || []) : buildJerarquiaPath(entry);
  const normalizedPath = allowFreeLevel ? path : sanitizePath(path);
  const finalPath = allowFreeLevel ? normalizedPath : normalizedPath;
  const mapLevel = allowFreeLevel ? null : (finalPath[finalPath.length - 1]?.nivel || null);

  return {
    ...entry,
    allowFreeLevel,
    jerarquiaPath: finalPath,
    mapLevel
  };
}

function normalizeRepuestos(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = loadJson(filePath);
  if (!Array.isArray(data?.repuestos)) {
    return null;
  }

  const stats = {
    file: path.relative(projectRoot, filePath),
    total: data.repuestos.length,
    sanitized: 0,
    clearedMedia: 0,
    ubicacionesActualizadas: 0,
    mediaPreservada: 0,
    mediaDescartada: 0
  };

  data.repuestos = data.repuestos.map((item) => {
    const next = { ...item };
    const path = buildJerarquiaPath(next);
    if (path.length) {
      next.jerarquiaPath = path;
      next.mapLevel = path[path.length - 1].nivel;
    } else {
      next.jerarquiaPath = [];
      next.mapLevel = null;
    }

    if (Array.isArray(next.multimedia) && next.multimedia.length) {
      if (clearMedia) {
        stats.clearedMedia += next.multimedia.length;
        next.multimedia = [];
      } else {
        const normalizedMedia = next.multimedia
          .map(normalizeMediaEntry)
          .filter(Boolean)
          .filter((media) => {
            if (!media.isFileSystem) {
              return true;
            }
            const exists = fileExistsInImages(media.url);
            if (!exists) {
              stats.mediaDescartada += 1;
            }
            return exists;
          });

        stats.mediaPreservada += normalizedMedia.length;
        next.multimedia = normalizedMedia;
      }
    }

    if (Array.isArray(next.ubicaciones) && next.ubicaciones.length) {
      next.ubicaciones = next.ubicaciones.map((ubicacion) => {
        const ubicacionPath = buildJerarquiaPath(ubicacion, { fallbackPath: path });
        if (ubicacionPath.length) {
          stats.ubicacionesActualizadas += 1;
        }
        return {
          ...ubicacion,
          jerarquiaPath: ubicacionPath,
          mapLevel: ubicacionPath[ubicacionPath.length - 1]?.nivel || null
        };
      });
    }

    stats.sanitized += 1;
    return next;
  });

  if (!dryRun) {
    saveJson(filePath, data);
  }

  return stats;
}

function normalizeZonas(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const zonas = loadJson(filePath);
  if (!Array.isArray(zonas)) {
    return null;
  }

  const stats = {
    file: path.relative(projectRoot, filePath),
    total: zonas.length,
    sanitized: 0
  };

  const nextZonas = zonas.map((zona) => {
    const allowFreeLevel = Boolean(zona.allowFreeLevel);
    const path = buildJerarquiaPath(zona, { fallbackPath: zona.jerarquiaPath });
    const finalPath = allowFreeLevel ? [] : path;
    const mapLevel = allowFreeLevel ? null : (finalPath[finalPath.length - 1]?.nivel || null);

    const updated = {
      ...zona,
      allowFreeLevel,
      jerarquiaPath: finalPath,
      mapLevel
    };

    updated.jerarquia = buildJerarquiaObject(finalPath);

    stats.sanitized += 1;
    return updated;
  });

  if (!dryRun) {
    saveJson(filePath, nextZonas);
  }

  return stats;
}

function normalizeMapCollection(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = loadJson(filePath);
  if (!Array.isArray(data)) {
    return null;
  }
  const stats = {
    file: path.relative(projectRoot, filePath),
    total: data.length,
    sanitized: 0
  };

  const nextMaps = data.map((map) => {
    stats.sanitized += 1;
    return normalizeMapEntry(map);
  });

  if (!dryRun) {
    saveJson(filePath, nextMaps);
  }

  return stats;
}

function processMapBackups(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  const files = fs.readdirSync(dirPath).filter((file) => file.endsWith('.json'));
  return files
    .map((file) => normalizeMapCollection(path.join(dirPath, file)))
    .filter(Boolean);
}

function processZonaBackups(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  const files = fs.readdirSync(dirPath).filter((file) => file.endsWith('.json'));
  return files
    .map((file) => normalizeZonas(path.join(dirPath, file)))
    .filter(Boolean);
}

function main() {
  const report = {};

  report.repuestos = normalizeRepuestos(path.join(storageDir, 'repuestos.json'));
  report.zonas = normalizeZonas(path.join(storageDir, 'zonas.json'));
  report.mapas = normalizeMapCollection(path.join(storageDir, 'mapas.json'));
  report.mapBackups = processMapBackups(path.join(storageDir, 'backups', 'mapas'));
  report.zonaBackups = processZonaBackups(path.join(storageDir, 'backups', 'zonas'));

  if (pretty) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('Saneamiento de datos terminado');
    Object.entries(report).forEach(([key, value]) => {
      if (!value) {
        console.log(`- ${key}: sin cambios`);
        return;
      }
      if (Array.isArray(value)) {
        console.log(`- ${key}: ${value.length} archivo(s)`);
        value.forEach((entry) => {
          console.log(`   • ${entry.file} → ${entry.sanitized}/${entry.total} registros`);
        });
        return;
      }
      console.log(`- ${key}: ${value.sanitized}/${value.total} registros`);
      if (typeof value.clearedMedia === 'number') {
        console.log(`   • multimedia eliminada: ${value.clearedMedia}`);
      }
      if (typeof value.mediaPreservada === 'number' && value.mediaPreservada > 0) {
        console.log(`   • multimedia preservada: ${value.mediaPreservada}`);
      }
      if (typeof value.mediaDescartada === 'number' && value.mediaDescartada > 0) {
        console.log(`   • multimedia descartada (sin archivo): ${value.mediaDescartada}`);
      }
      if (typeof value.ubicacionesActualizadas === 'number') {
        console.log(`   • ubicaciones actualizadas: ${value.ubicacionesActualizadas}`);
      }
    });
  }

  if (dryRun) {
    console.log('\nDRY RUN: no se escribieron archivos.');
  }
}

main();
