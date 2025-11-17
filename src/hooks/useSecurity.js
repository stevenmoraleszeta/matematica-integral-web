import { useCallback } from 'react';
import { 
  canCreate, 
  canUpdate, 
  canDelete, 
  recordSuccessfulOperation,
  validateEmail,
  validatePhone
} from '../services/securityService';

/**
 * Hook personalizado para manejar seguridad en operaciones CRUD
 */
export function useSecurity() {
  
  /**
   * Envuelve una operación CREATE con validaciones de seguridad
   */
  const secureCreate = useCallback(async (data, collectionName, createFunction) => {
    const check = canCreate(data, collectionName);
    
    if (!check.allowed) {
      throw new Error(check.message || 'Operación no permitida');
    }
    
    try {
      const result = await createFunction(check.data);
      recordSuccessfulOperation('CREATE');
      return result;
    } catch (error) {
      throw error;
    }
  }, []);
  
  /**
   * Envuelve una operación UPDATE con validaciones de seguridad
   */
  const secureUpdate = useCallback(async (data, collectionName, updateFunction) => {
    const check = canUpdate(data, collectionName);
    
    if (!check.allowed) {
      throw new Error(check.message || 'Operación no permitida');
    }
    
    try {
      const result = await updateFunction(check.data);
      recordSuccessfulOperation('UPDATE');
      return result;
    } catch (error) {
      throw error;
    }
  }, []);
  
  /**
   * Verifica si se puede eliminar y requiere confirmación
   */
  const secureDelete = useCallback(async (itemName, deleteFunction) => {
    const check = canDelete();
    
    if (!check.allowed) {
      throw new Error(check.message || 'Operación no permitida');
    }
    
    // Confirmación simple (el componente puede agregar confirmación adicional)
    try {
      const result = await deleteFunction();
      recordSuccessfulOperation('DELETE');
      return result;
    } catch (error) {
      throw error;
    }
  }, []);
  
  /**
   * Valida un email con mensaje de error
   */
  const validateEmailWithMessage = useCallback((email, fieldName = 'Email') => {
    if (!email || email.trim() === '') {
      return null; // Email vacío es válido si no es requerido
    }
    
    if (!validateEmail(email)) {
      return `${fieldName} no es válido. Por favor, ingresa un email válido.`;
    }
    
    return null;
  }, []);
  
  /**
   * Valida un teléfono con mensaje de error
   */
  const validatePhoneWithMessage = useCallback((phone, fieldName = 'Teléfono') => {
    if (!phone || phone.trim() === '') {
      return null; // Teléfono vacío es válido si no es requerido
    }
    
    if (!validatePhone(phone)) {
      return `${fieldName} no es válido. Debe incluir código de país (ej: +50612345678).`;
    }
    
    return null;
  }, []);
  
  return {
    secureCreate,
    secureUpdate,
    secureDelete,
    validateEmailWithMessage,
    validatePhoneWithMessage,
    canDelete: () => canDelete()
  };
}

export default useSecurity;

