'use client';

import { create } from 'zustand';

export type OrbitState = 'idle' | 'uploading' | 'thinking' | 'searching' | 'speaking' | 'success' | 'error';

interface SystemStore {
  // Orbit State
  orbState: OrbitState;
  orbColor: string;
  orbPulseSpeed: number;
  orbDistortion: number;
  setOrbState: (state: OrbitState) => void;

  // Upload & Pipeline State
  uploadProgress: number;
  activeUploadFile: string | null;
  pipelineStep: string | null;
  setUploadState: (progress: number, fileName: string | null, step: string | null) => void;

  // Background Processing Logs
  activeJobs: string[];
  addJob: (jobId: string) => void;
  removeJob: (jobId: string) => void;
  
  // Active Workspace
  activeWorkspace: string;
  setActiveWorkspace: (workspace: string) => void;
}

const stateConfigs: Record<OrbitState, { color: string; speed: number; distortion: number }> = {
  idle: { color: '#8B5CF6', speed: 1.8, distortion: 0.35 }, // Violet
  uploading: { color: '#00E1D9', speed: 4.0, distortion: 0.8 }, // Cyan pulse
  thinking: { color: '#FF1E56', speed: 6.0, distortion: 1.1 }, // Rapid Pink distortion
  searching: { color: '#FF9E00', speed: 3.5, distortion: 0.7 }, // Amber waves
  speaking: { color: '#00E1D9', speed: 3.0, distortion: 0.5 }, // Smooth speech morphs
  success: { color: '#10B981', speed: 1.5, distortion: 0.2 }, // Forest Green calming wave
  error: { color: '#EF4444', speed: 8.0, distortion: 1.4 }, // Aggressive Red jitter
};

export const useSystemStore = create<SystemStore>((set) => ({
  // Orbit State
  orbState: 'idle',
  orbColor: stateConfigs.idle.color,
  orbPulseSpeed: stateConfigs.idle.speed,
  orbDistortion: stateConfigs.idle.distortion,
  setOrbState: (orbState) => set({
    orbState,
    orbColor: stateConfigs[orbState].color,
    orbPulseSpeed: stateConfigs[orbState].speed,
    orbDistortion: stateConfigs[orbState].distortion,
  }),

  // Upload & Pipeline State
  uploadProgress: 0,
  activeUploadFile: null,
  pipelineStep: null,
  setUploadState: (uploadProgress, activeUploadFile, pipelineStep) => set({
    uploadProgress,
    activeUploadFile,
    pipelineStep,
  }),

  // Background Processing
  activeJobs: [],
  addJob: (jobId) => set((state) => ({ activeJobs: [...state.activeJobs, jobId] })),
  removeJob: (jobId) => set((state) => ({ activeJobs: state.activeJobs.filter((j) => j !== jobId) })),

  // Active Workspace
  activeWorkspace: 'dashboard',
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
}));
