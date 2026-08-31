import { create } from 'zustand';

export interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  entity_id: string;
  message: string;
  details?: any;
  created_at: string;
}

interface AlertStoreState {
  alerts: Alert[];
  isFreezeActive: boolean;
  frozenAccounts: string[];
  addAlert: (alert: Alert) => void;
  setAlerts: (alerts: Alert[]) => void;
  setFreezeState: (active: boolean, accounts?: string[]) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertStoreState>((set) => ({
  alerts: [],
  isFreezeActive: false,
  frozenAccounts: [],
  addAlert: (alert) => set((state) => {
    // Avoid duplicate alerts in local state if matching type + ID
    const exists = state.alerts.some((a) => a.id === alert.id);
    if (exists) return {};
    return { alerts: [alert, ...state.alerts].slice(0, 50) };
  }),
  setAlerts: (alerts) => set({ alerts }),
  setFreezeState: (active, accounts = []) => set({
    isFreezeActive: active,
    frozenAccounts: active ? accounts : []
  }),
  clearAlerts: () => set({ alerts: [] }),
}));
