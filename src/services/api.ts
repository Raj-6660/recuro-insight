import axios from 'axios';
import { APIResponse, SkillAnalysis, CareerPath, LearningResource, JobMarketInsight, JDSummary, CVParsedData, MatchResult } from '@/types/api';

const API_BASE_URL = 'http://localhost:8000'; // Change to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Student API calls
export const analyzeSkills = async (file: File): Promise<APIResponse<SkillAnalysis[]>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/analyze-skills', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getCareerPath = async (skills: string[]): Promise<APIResponse<CareerPath[]>> => {
  const response = await api.post('/career-path', { skills });
  return response.data;
};

export const getLearningRoadmap = async (currentSkills: string[], targetRole: string): Promise<APIResponse<LearningResource[]>> => {
  const response = await api.post('/learning-roadmap', { currentSkills, targetRole });
  return response.data;
};

export const getJobMarket = async (role?: string): Promise<APIResponse<JobMarketInsight[]>> => {
  const response = await api.get('/job-market', { params: { role } });
  return response.data;
};

// Recruiter API calls
export const summarizeJD = async (file: File): Promise<APIResponse<JDSummary>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/jd-summarizer', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const parseCV = async (file: File): Promise<APIResponse<CVParsedData>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/cv-parser', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const matchScore = async (jdData: JDSummary, cvData: CVParsedData): Promise<APIResponse<MatchResult>> => {
  const response = await api.post('/match-scorer', { jd: jdData, cv: cvData });
  return response.data;
};

export const scheduleInterview = async (matchData: MatchResult): Promise<APIResponse<MatchResult>> => {
  const response = await api.post('/interview-scheduler', matchData);
  return response.data;
};