import { PrescriptionData } from "../types";

const STORAGE_KEY = 'mediscript_prescriptions';

export const savePrescription = (data: PrescriptionData): Promise<void> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const existing = getPrescriptionsSync();
      let updatedList = [...existing];
      
      if (data.id) {
        // Update existing record
        const index = existing.findIndex(p => p.id === data.id);
        if (index >= 0) {
          updatedList[index] = data;
        } else {
          // ID provided but not found, treat as new (shouldn't happen often but safe fallback)
          updatedList = [data, ...existing];
        }
      } else {
        // Insert new record with generated ID
        const newRecord: PrescriptionData = { 
          ...data, 
          id: crypto.randomUUID(),
          // Use provided status or default to pending
          status: data.status || 'pending'
        };
        updatedList = [newRecord, ...existing];
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      resolve();
    }, 400);
  });
};

export const getPrescriptions = (): Promise<PrescriptionData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getPrescriptionsSync());
    }, 500);
  });
};

const getPrescriptionsSync = (): PrescriptionData[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
}