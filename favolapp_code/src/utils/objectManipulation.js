export async function traverseObject(obj, callback, prefix = '') {
  const promises = [];

  for (let key in obj) {
    const value = obj[key];
    const fieldPath = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      promises.push(traverseObject(value, callback, fieldPath));
    } else {
      promises.push(callback(fieldPath, value));
    }
  }

  await Promise.all(promises);
}

export function compareAndReturnDifferences(obj1, obj2) {
  // Ottieni tutte le chiavi (campi) del primo oggetto
  const keys1 = Object.keys(obj1);
  // Ottieni tutte le chiavi (campi) del secondo oggetto
  const keys2 = Object.keys(obj2);

  // Trova le chiavi comuni tra i due oggetti
  const commonKeys = keys1.filter((key) => keys2.includes(key));

  // Oggetto per memorizzare le differenze
  const differences = {};

  // Confronta i valori dei campi comuni
  for (let key of commonKeys) {
    if (obj1[key] !== obj2[key]) {
      differences[key] = obj2[key]; // Memorizza il valore del secondo oggetto
    }
  }

  // Se non ci sono differenze, restituisci null
  if (Object.keys(differences).length === 0) {
    return null;
  }

  // Restituisci l'oggetto con le differenze
  return differences;
}

function isEqual1(value1, value2) {
  if (typeof value1 !== typeof value2) return false;

  if (typeof value1 === 'object' && value1 !== null && value2 !== null) {
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);
    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!isEqual1(value1[key], value2[key])) return false;
    }
    return true;
  }

  return value1 === value2;
}

export function compareAndReturnDifferencesSubObjects(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  const commonKeys = keys1.filter((key) => keys2.includes(key));

  const differences = {};

  for (let key of commonKeys) {
    if (!isEqual1(obj1[key], obj2[key])) {
      differences[key] = obj2[key];
    }
  }

  if (Object.keys(differences).length === 0) {
    return null;
  }

  return differences;
}

function isEqual(value1, value2) {
  if (typeof value1 !== typeof value2) return false;

  if (typeof value1 === 'object' && value1 !== null && value2 !== null) {
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);
    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!isEqual(value1[key], value2[key])) return false;
    }
    return true;
  }

  return value1 === value2;
}

export function compareArraysMissUpdateAdd(originalArray, modifiedArray) {
  const updatedItems = [];
  const addedItems = [];
  const missingItems = [];

  const modifiedIds = new Set(modifiedArray.map((item) => item.id));

  // Check for updated and added items
  modifiedArray.forEach((modifiedItem) => {
    const originalItem = originalArray.find(
      (item) => item.id === modifiedItem.id
    );
    if (originalItem) {
      if (!isEqual(originalItem, modifiedItem)) {
        if (modifiedItem.edit === 'updated') {
          updatedItems.push(modifiedItem);
        } else if (modifiedItem.edit === 'added') {
          addedItems.push(modifiedItem);
        }
      }
    } else {
      if (modifiedItem.edit === 'added') {
        addedItems.push(modifiedItem);
      }
    }
  });

  // Check for missing items
  originalArray.forEach((originalItem) => {
    if (!modifiedIds.has(originalItem.id)) {
      missingItems.push(originalItem);
    }
  });

  return {
    areEqual:
      updatedItems.length === 0 &&
      addedItems.length === 0 &&
      missingItems.length === 0,
    updatedItems,
    addedItems,
    missingItems,
  };
}

export function compareArraysMissAdd(originalArray, modifiedArray) {
  const addedItems = [];
  const removedItems = [];

  const originalIds = new Set(originalArray.map((item) => item.id));
  const modifiedIds = new Set(modifiedArray.map((item) => item.id));

  // Check for added items
  modifiedArray.forEach((modifiedItem) => {
    if (!originalIds.has(modifiedItem.id)) {
      addedItems.push(modifiedItem);
    }
  });

  // Check for removed items
  originalArray.forEach((originalItem) => {
    if (!modifiedIds.has(originalItem.id)) {
      removedItems.push(originalItem);
    }
  });

  const areEqual = addedItems.length === 0 && removedItems.length === 0;

  return {
    areEqual,
    addedItems,
    removedItems,
  };
}
