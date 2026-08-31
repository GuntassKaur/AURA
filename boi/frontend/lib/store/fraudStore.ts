import { create } from 'zustand';

export interface Transaction {
  id: string;
  txn_id: string;
  source: string;
  dest: string;
  amount: number;
  channel: string;
  timestamp: string;
  fraud_score: number;
  risk_tier: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision_score: number;
  recall_score: number;
  f1_score: number;
  auc_roc: number;
  training_samples: number;
}

interface FraudStoreState {
  transactions: Transaction[];
  metrics: ModelMetrics;
  threshold: number;
  liveStats: {
    total_volume: number;
    total_txns: number;
    watch_count: number;
    frozen_count: number;
  };
  addTransaction: (txn: Transaction) => void;
  setTransactions: (txns: Transaction[]) => void;
  setMetrics: (metrics: ModelMetrics) => void;
  setThreshold: (val: number) => void;
  updateLiveStats: (stats: Partial<FraudStoreState['liveStats']>) => void;
}

export const useFraudStore = create<FraudStoreState>((set) => ({
  transactions: [],
  metrics: {
    accuracy: 0.985,
    precision_score: 0.962,
    recall_score: 0.941,
    f1_score: 0.951,
    auc_roc: 0.991,
    training_samples: 42000,
  },
  threshold: 0.5,
  liveStats: {
    total_volume: 8432000,
    total_txns: 12430,
    watch_count: 32,
    frozen_count: 5,
  },
  addTransaction: (txn) => set((state) => {
    const updated = [txn, ...state.transactions].slice(0, 100);
    // Update live volumes
    const volume_add = txn.amount;
    return {
      transactions: updated,
      liveStats: {
        ...state.liveStats,
        total_txns: state.liveStats.total_txns + 1,
        total_volume: state.liveStats.total_volume + volume_add,
        frozen_count: txn.risk_tier === 'FREEZE' ? state.liveStats.frozen_count + 1 : state.liveStats.frozen_count,
        watch_count: txn.risk_tier === 'WATCH' ? state.liveStats.watch_count + 1 : state.liveStats.watch_count,
      }
    };
  }),
  setTransactions: (txns) => set({ transactions: txns }),
  setMetrics: (metrics) => set({ metrics }),
  setThreshold: (threshold) => set({ threshold }),
  updateLiveStats: (stats) => set((state) => ({ liveStats: { ...state.liveStats, ...stats } })),
}));
