/**
 * Security Service
 * Proporciona medidas de seguridad para operaciones CRUD sin autenticación
 * Incluye rate limiting, validación de inputs, y protección contra operaciones masivas
 */

// Configuración de rate limiting
const RATE_LIMIT_CONFIG = {
  CREATE: { max: 10, window: 60000 }, // 10 creaciones por minuto
  UPDATE: { max: 20, window: 60000 }, // 20 actualizaciones por minuto
  DELETE: { max: 5, window: 60000 },  // 5 eliminaciones por minuto
  TOTAL: { max: 30, window: 60000 }   // 30 operaciones totales por minuto
};

// Cooldown entre operaciones destructivas
const DELETE_COOLDOWN = 2000; // 2 segundos entre eliminaciones

// Límites de tamaño de datos
const MAX_STRING_LENGTH = 5000;
const MAX_FIELD_COUNT = 50;
const MAX_OBJECT_SIZE = 100000; // ~100KB en bytes aproximados

// Almacenamiento de timestamps de operaciones (en memoria, se resetea al recargar)
const operationHistory = {
  creates: [],
  updates: [],
  deletes: [],
  total: [],
  lastDelete: null
};

/**
 * Verifica si una operación está dentro de los límites de rate
 */
function checkRateLimit(operationType) {
  const now = Date.now();
  const config = RATE_LIMIT_CONFIG[operationType];
  
  if (!config) {
    console.warn(`Unknown operation type: ${operationType}`);
    return { allowed: true, remaining: 0 };
  }

  // Limpiar operaciones antiguas
  const history = operationHistory[operationType.toLowerCase() + 's'] || operationHistory.total;
  const recent = history.filter(timestamp => now - timestamp < config.window);
  
  // Actualizar historial
  if (operationType !== 'TOTAL') {
    operationHistory[operationType.toLowerCase() + 's'] = recent;
  }
  operationHistory.total = operationHistory.total.filter(timestamp => now - timestamp < RATE_LIMIT_CONFIG.TOTAL.window);

  // Verificar límites
  if (recent.length >= config.max) {
    const oldest = recent[0];
    const waitTime = Math.ceil((config.window - (now - oldest)) / 1000);
    return {
      allowed: false,
      remaining: config.max - recent.length,
      waitTime,
      message: `Límite de ${operationType.toLowerCase()} alcanzado. Espera ${waitTime} segundos.`
    };
  }

  // Verificar límite total
  const recentTotal = operationHistory.total.filter(timestamp => now - timestamp < RATE_LIMIT_CONFIG.TOTAL.window);
  if (recentTotal.length >= RATE_LIMIT_CONFIG.TOTAL.max) {
    const oldest = recentTotal[0];
    const waitTime = Math.ceil((RATE_LIMIT_CONFIG.TOTAL.window - (now - oldest)) / 1000);
    return {
      allowed: false,
      remaining: 0,
      waitTime,
      message: `Límite de operaciones alcanzado. Espera ${waitTime} segundos.`
    };
  }

  return {
    allowed: true,
    remaining: config.max - recent.length - 1
  };
}

/**
 * Registra una operación en el historial
 */
function recordOperation(operationType) {
  const now = Date.now();
  const type = operationType.toLowerCase();
  
  if (type === 'delete') {
    operationHistory.deletes.push(now);
    operationHistory.lastDelete = now;
  } else if (type === 'create') {
    operationHistory.creates.push(now);
  } else if (type === 'update') {
    operationHistory.updates.push(now);
  }
  
  operationHistory.total.push(now);
  
  // Limpiar historiales antiguos periódicamente
  const maxAge = Math.max(
    RATE_LIMIT_CONFIG.CREATE.window,
    RATE_LIMIT_CONFIG.UPDATE.window,
    RATE_LIMIT_CONFIG.DELETE.window,
    RATE_LIMIT_CONFIG.TOTAL.window
  );
  
  Object.keys(operationHistory).forEach(key => {
    if (Array.isArray(operationHistory[key])) {
      operationHistory[key] = operationHistory[key].filter(timestamp => now - timestamp < maxAge);
    }
  });
}

/**
 * Verifica cooldown para operaciones de eliminación
 */
function checkDeleteCooldown() {
  if (!operationHistory.lastDelete) {
    return { allowed: true };
  }
  
  const timeSinceLastDelete = Date.now() - operationHistory.lastDelete;
  if (timeSinceLastDelete < DELETE_COOLDOWN) {
    const waitTime = Math.ceil((DELETE_COOLDOWN - timeSinceLastDelete) / 1000);
    return {
      allowed: false,
      waitTime,
      message: `Espera ${waitTime} segundo(s) antes de eliminar otro elemento.`
    };
  }
  
  return { allowed: true };
}

/**
 * Sanitiza y valida strings
 */
function sanitizeString(value, fieldName = '') {
  if (typeof value !== 'string') {
    return String(value);
  }
  
  // Remover caracteres peligrosos
  let sanitized = value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
    .replace(/javascript:/gi, '') // Remover javascript: links
    .replace(/on\w+\s*=/gi, '') // Remover event handlers
    .trim();
  
  // Limitar longitud
  if (sanitized.length > MAX_STRING_LENGTH) {
    console.warn(`Campo ${fieldName} excede longitud máxima, truncado`);
    sanitized = sanitized.substring(0, MAX_STRING_LENGTH);
  }
  
  return sanitized;
}

/**
 * Valida y sanitiza un objeto de datos
 */
function validateAndSanitizeData(data, collectionName = '') {
  if (!data || typeof data !== 'object') {
    throw new Error('Los datos deben ser un objeto');
  }
  
  // Verificar número de campos
  const fieldCount = Object.keys(data).length;
  if (fieldCount > MAX_FIELD_COUNT) {
    throw new Error(`Demasiados campos (${fieldCount}). Máximo permitido: ${MAX_FIELD_COUNT}`);
  }
  
  // Verificar tamaño aproximado del objeto
  const objectSize = JSON.stringify(data).length;
  if (objectSize > MAX_OBJECT_SIZE) {
    throw new Error(`Datos demasiado grandes (${objectSize} bytes). Máximo permitido: ${MAX_OBJECT_SIZE} bytes`);
  }
  
  // Sanitizar campos de texto
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, key);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Objetos anidados (como attendance, scores, etc.)
      sanitized[key] = validateAndSanitizeData(value, `${collectionName}.${key}`);
    } else if (Array.isArray(value)) {
      // Arrays
      sanitized[key] = value.map((item, index) => {
        if (typeof item === 'string') {
          return sanitizeString(item, `${key}[${index}]`);
        } else if (typeof item === 'object') {
          return validateAndSanitizeData(item, `${collectionName}.${key}[${index}]`);
        }
        return item;
      });
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Valida formato de email
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida formato de teléfono
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Verifica si se puede realizar una operación CREATE
 */
export function canCreate(data, collectionName) {
  try {
    // Validar rate limit
    const rateCheck = checkRateLimit('CREATE');
    if (!rateCheck.allowed) {
      return rateCheck;
    }
    
    // Validar y sanitizar datos
    validateAndSanitizeData(data, collectionName);
    
    return { allowed: true, data: validateAndSanitizeData(data, collectionName) };
  } catch (error) {
    return {
      allowed: false,
      message: error.message || 'Error de validación'
    };
  }
}

/**
 * Verifica si se puede realizar una operación UPDATE
 */
export function canUpdate(data, collectionName) {
  try {
    // Validar rate limit
    const rateCheck = checkRateLimit('UPDATE');
    if (!rateCheck.allowed) {
      return rateCheck;
    }
    
    // Validar y sanitizar datos
    const sanitized = validateAndSanitizeData(data, collectionName);
    
    return { allowed: true, data: sanitized };
  } catch (error) {
    return {
      allowed: false,
      message: error.message || 'Error de validación'
    };
  }
}

/**
 * Verifica si se puede realizar una operación DELETE
 */
export function canDelete() {
  // Verificar cooldown
  const cooldownCheck = checkDeleteCooldown();
  if (!cooldownCheck.allowed) {
    return cooldownCheck;
  }
  
  // Verificar rate limit
  const rateCheck = checkRateLimit('DELETE');
  if (!rateCheck.allowed) {
    return rateCheck;
  }
  
  return { allowed: true };
}

/**
 * Registra una operación exitosa
 */
export function recordSuccessfulOperation(operationType) {
  recordOperation(operationType);
}

/**
 * Obtiene estadísticas de uso actuales (para debugging)
 */
export function getSecurityStats() {
  const now = Date.now();
  return {
    creates: {
      recent: operationHistory.creates.filter(t => now - t < RATE_LIMIT_CONFIG.CREATE.window).length,
      limit: RATE_LIMIT_CONFIG.CREATE.max
    },
    updates: {
      recent: operationHistory.updates.filter(t => now - t < RATE_LIMIT_CONFIG.UPDATE.window).length,
      limit: RATE_LIMIT_CONFIG.UPDATE.max
    },
    deletes: {
      recent: operationHistory.deletes.filter(t => now - t < RATE_LIMIT_CONFIG.DELETE.window).length,
      limit: RATE_LIMIT_CONFIG.DELETE.max
    },
    total: {
      recent: operationHistory.total.filter(t => now - t < RATE_LIMIT_CONFIG.TOTAL.window).length,
      limit: RATE_LIMIT_CONFIG.TOTAL.max
    },
    lastDelete: operationHistory.lastDelete ? new Date(operationHistory.lastDelete) : null
  };
}

// Exportar utilidades de validación
export { validateEmail, validatePhone, sanitizeString, validateAndSanitizeData };

