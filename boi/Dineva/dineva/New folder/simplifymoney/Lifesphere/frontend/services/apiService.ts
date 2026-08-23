import { DocumentData } from '@/store/useDocumentStore';
import { PhotoData } from '@/store/usePhotoStore';
import { MemoryCapsuleData } from '@/store/useTimelineStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Clean abstract service layer separating UI presentation from backend API requests
export const apiService = {
  async fetchDocuments(): Promise<DocumentData[]> {
    const res = await fetch(`${API_BASE_URL}/documents`, { method: 'GET' });
    if (!res.ok) throw new Error('API_FETCH_ERROR_DOCUMENTS');
    return res.json();
  },

  async fetchPhotos(): Promise<PhotoData[]> {
    const res = await fetch(`${API_BASE_URL}/photos`, { method: 'GET' });
    if (!res.ok) throw new Error('API_FETCH_ERROR_PHOTOS');
    return res.json();
  },

  async fetchTimeline(): Promise<MemoryCapsuleData[]> {
    const res = await fetch(`${API_BASE_URL}/timeline`, { method: 'GET' });
    if (!res.ok) throw new Error('API_FETCH_ERROR_TIMELINE');
    return res.json();
  },

  async fetchDashboardSummary() {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary`, { method: 'GET' });
    if (!res.ok) throw new Error('API_FETCH_ERROR_DASHBOARD');
    return res.json();
  }
};
