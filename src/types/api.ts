// Student API Types
export interface SkillAnalysis {
  skill: string;
  confidence_score: number;
  category: string;
}

export interface CareerPath {
  role: string;
  required_skills: string[];
  match_percentage: number;
  missing_skills: string[];
  industry: string;
}

export interface LearningResource {
  skill: string;
  resource: string;
  priority: 'High' | 'Medium' | 'Low';
  type: 'Course' | 'Certification' | 'Project' | 'Book';
  url?: string;
}

export interface JobMarketInsight {
  role: string;
  openings: number;
  salary_range: string;
  growth_trend: 'Rising' | 'Stable' | 'Declining';
  location: string;
}

// Recruiter API Types
export interface JDSummary {
  title: string;
  department: string;
  experience_level: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  qualifications: string[];
}

export interface CVParsedData {
  candidate_name: string;
  email: string;
  phone: string;
  skills: string[];
  experience_years: number;
  education: string[];
  previous_roles: string[];
}

export interface MatchResult {
  candidate_id: string;
  candidate_name: string;
  match_score: number;
  missing_skills: string[];
  matching_skills: string[];
  status: 'shortlisted' | 'rejected';
  interview_date?: string;
  message: string;
}

// Common API Response
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}