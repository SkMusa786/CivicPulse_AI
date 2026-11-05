import axios from 'axios';
import { apiClient } from './api';
import { AIAnalysisResult, SpotGuardAnalysis } from '../types';

export interface AnalysisProgressCallback {
  (stage: number, stageName: string, progress: number): void;
}

const imageRequestOptions = (
  file: File,
  onProgress?: AnalysisProgressCallback,
) => ({
  headers: { 'Content-Type': file.type },
  timeout: 120000,
  onUploadProgress: (event: { loaded: number; total?: number }) => {
    if (event.total && onProgress) {
      onProgress(1, 'Uploading image securely to CivicPulse AI...', Math.round((event.loaded / event.total) * 30));
      if (event.loaded >= event.total) {
        onProgress(2, 'Waiting for Gemini image analysis...', 35);
      }
    }
  },
});

const getApiError = (error: unknown): Error => {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return new Error(error.response?.data?.error || error.message);
  }
  return error instanceof Error ? error : new Error('AI request failed.');
};

export const analyzeImageWithAI = async (
  imageFile: File,
  onProgress?: AnalysisProgressCallback,
): Promise<AIAnalysisResult> => {
  try {
    onProgress?.(1, 'Uploading image securely to CivicPulse AI...', 0);
    const response = await apiClient.post<{ result: AIAnalysisResult }>(
      '/ai/analyze-image',
      imageFile,
      imageRequestOptions(imageFile, onProgress),
    );
    onProgress?.(2, 'Gemini analysis complete; review the suggested details.', 100);
    return response.data.result;
  } catch (error) {
    throw getApiError(error);
  }
};

export const analyzeSpotGuardWithAI = async (
  imageFile: File,
  onProgress?: AnalysisProgressCallback,
): Promise<SpotGuardAnalysis> => {
  try {
    onProgress?.(1, 'Uploading original space photograph securely...', 0);
    const response = await apiClient.post<{ result: SpotGuardAnalysis }>(
      '/ai/spotguard',
      imageFile,
      imageRequestOptions(imageFile, onProgress),
    );
    onProgress?.(2, 'Gemini analysis and conceptual preview complete.', 100);
    return response.data.result;
  } catch (error) {
    throw getApiError(error);
  }
};
