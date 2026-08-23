'use client';

import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { DocumentData } from '@/store/useDocumentStore';
import { PhotoData } from '@/store/usePhotoStore';
import { MemoryCapsuleData } from '@/store/useTimelineStore';

// React Query hooks separating data-fetching state from rendering concerns
export function useDocumentsQuery(fallbackData: DocumentData[]) {
  return useQuery<DocumentData[]>({
    queryKey: ['documents'],
    queryFn: () => apiService.fetchDocuments(),
    initialData: fallbackData,
    staleTime: 1000 * 60 * 5, // 5 minutes cache validity
    retry: 1,
  });
}

export function usePhotosQuery(fallbackData: PhotoData[]) {
  return useQuery<PhotoData[]>({
    queryKey: ['photos'],
    queryFn: () => apiService.fetchPhotos(),
    initialData: fallbackData,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useTimelineQuery(fallbackData: MemoryCapsuleData[]) {
  return useQuery<MemoryCapsuleData[]>({
    queryKey: ['timeline'],
    queryFn: () => apiService.fetchTimeline(),
    initialData: fallbackData,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
