#!/usr/bin/env python3
"""
Career Platform Backend API
FastAPI backend for AI-powered career navigation and recruitment platform.

This backend provides endpoints for:
- Student features: skill analysis, career paths, learning roadmaps, job market insights
- Recruiter features: JD parsing, CV parsing, match scoring, interview scheduling

Note: This is a demo backend. Replace AI logic with actual ML models in production.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import uuid
from datetime import datetime, timedelta
import random

app = FastAPI(title="Career Platform API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================
# Data Models
# ========================

class SkillAnalysis(BaseModel):
    skill: str
    confidence_score: int
    category: str

class CareerPath(BaseModel):
    role: str
    required_skills: List[str]
    match_percentage: int
    missing_skills: List[str]
    industry: str

class LearningResource(BaseModel):
    skill: str
    resource: str
    priority: str  # 'High', 'Medium', 'Low'
    type: str  # 'Course', 'Certification', 'Project', 'Book'
    url: Optional[str] = None

class JobMarketInsight(BaseModel):
    role: str
    openings: int
    salary_range: str
    growth_trend: str  # 'Rising', 'Stable', 'Declining'
    location: str

class JDSummary(BaseModel):
    title: str
    department: str
    experience_level: str
    required_skills: List[str]
    preferred_skills: List[str]
    responsibilities: List[str]
    qualifications: List[str]

class CVParsedData(BaseModel):
    candidate_name: str
    email: str
    phone: str
    skills: List[str]
    experience_years: int
    education: List[str]
    previous_roles: List[str]

class MatchResult(BaseModel):
    candidate_id: str
    candidate_name: str
    match_score: int
    missing_skills: List[str]
    matching_skills: List[str]
    status: str  # 'shortlisted' or 'rejected'
    interview_date: Optional[str] = None
    message: str

class APIResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None

# ========================
# Mock Data and Utilities
# ========================

# Mock skill categories for analysis
SKILL_CATEGORIES = {
    'react': 'Frontend Development',
    'javascript': 'Programming Languages',
    'typescript': 'Programming Languages',
    'python': 'Programming Languages',
    'node': 'Backend Development',
    'sql': 'Database',
    'machine learning': 'AI/ML',
    'git': 'Version Control',
    'aws': 'Cloud Computing',
    'docker': 'DevOps',
    'html': 'Frontend Development',
    'css': 'Frontend Development'
}

def extract_skills_from_text(text: str) -> List[SkillAnalysis]:
    """Mock skill extraction. Replace with actual NLP/ML model."""
    skills = []
    text_lower = text.lower()
    
    skill_patterns = [
        ('React.js', ['react', 'reactjs']),
        ('TypeScript', ['typescript', 'ts']),
        ('JavaScript', ['javascript', 'js']),
        ('Node.js', ['node', 'nodejs']),
        ('Python', ['python']),
        ('SQL', ['sql', 'mysql', 'postgresql']),
        ('Machine Learning', ['machine learning', 'ml', 'ai']),
        ('Git', ['git', 'github']),
        ('AWS', ['aws', 'amazon web services']),
        ('Docker', ['docker']),
        ('HTML/CSS', ['html', 'css']),
        ('Redux', ['redux']),
        ('Vue.js', ['vue', 'vuejs']),
        ('Angular', ['angular']),
        ('MongoDB', ['mongodb', 'mongo']),
    ]
    
    for skill_name, patterns in skill_patterns:
        for pattern in patterns:
            if pattern in text_lower:
                category = SKILL_CATEGORIES.get(pattern, 'General')
                confidence = random.randint(70, 95)
                skills.append(SkillAnalysis(
                    skill=skill_name,
                    confidence_score=confidence,
                    category=category
                ))
                break
    
    return skills

def generate_career_paths(skills: List[str]) -> List[CareerPath]:
    """Mock career path generation. Replace with actual recommendation engine."""
    paths = []
    
    career_templates = [
        {
            'role': 'Frontend Developer',
            'required_skills': ['React.js', 'JavaScript', 'HTML/CSS', 'TypeScript'],
            'industry': 'Technology'
        },
        {
            'role': 'Full Stack Developer',
            'required_skills': ['React.js', 'Node.js', 'JavaScript', 'SQL', 'TypeScript'],
            'industry': 'Technology'
        },
        {
            'role': 'Data Scientist',
            'required_skills': ['Python', 'Machine Learning', 'SQL', 'Statistics'],
            'industry': 'Data Science'
        },
        {
            'role': 'DevOps Engineer',
            'required_skills': ['AWS', 'Docker', 'Kubernetes', 'Git', 'Linux'],
            'industry': 'Technology'
        }
    ]
    
    for template in career_templates:
        matching_skills = [s for s in template['required_skills'] if any(us.lower() in s.lower() for us in skills)]
        missing_skills = [s for s in template['required_skills'] if s not in matching_skills]
        match_percentage = int((len(matching_skills) / len(template['required_skills'])) * 100)
        
        paths.append(CareerPath(
            role=template['role'],
            required_skills=template['required_skills'],
            match_percentage=match_percentage,
            missing_skills=missing_skills,
            industry=template['industry']
        ))
    
    return sorted(paths, key=lambda x: x.match_percentage, reverse=True)

# ========================
# Student Endpoints
# ========================

@app.post("/analyze-skills")
async def analyze_skills(file: UploadFile = File(...)):
    """Extract skills from uploaded CV/transcript."""
    try:
        # Read file content
        content = await file.read()
        text_content = content.decode('utf-8', errors='ignore')
        
        # Extract skills (mock implementation)
        skills = extract_skills_from_text(text_content)
        
        return JSONResponse({
            "success": True,
            "data": [skill.dict() for skill in skills],
            "message": f"Successfully analyzed {len(skills)} skills from the document."
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill analysis failed: {str(e)}")

@app.post("/career-path")
async def career_path(request_data: dict):
    """Generate career path recommendations based on skills."""
    try:
        skills = request_data.get('skills', [])
        
        if not skills:
            raise HTTPException(status_code=400, detail="Skills list is required")
        
        paths = generate_career_paths(skills)
        
        return JSONResponse({
            "success": True,
            "data": [path.dict() for path in paths],
            "message": f"Found {len(paths)} potential career paths."
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Career path generation failed: {str(e)}")

@app.post("/learning-roadmap")
async def learning_roadmap(request_data: dict):
    """Generate learning roadmap for target role."""
    try:
        current_skills = request_data.get('currentSkills', [])
        target_role = request_data.get('targetRole', '')
        
        if not target_role:
            raise HTTPException(status_code=400, detail="Target role is required")
        
        # Mock roadmap generation
        resources = [
            LearningResource(
                skill="Advanced React Patterns",
                resource="React Advanced Patterns Course",
                priority="High",
                type="Course",
                url="https://example.com/react-course"
            ),
            LearningResource(
                skill="State Management",
                resource="Redux Toolkit Mastery",
                priority="High",
                type="Course",
                url="https://example.com/redux-course"
            ),
            LearningResource(
                skill="Testing",
                resource="Jest & React Testing Library",
                priority="Medium",
                type="Course",
                url="https://example.com/testing-course"
            ),
            LearningResource(
                skill="Performance Optimization",
                resource="Web Performance Optimization",
                priority="Medium",
                type="Book",
                url="https://example.com/performance-book"
            )
        ]
        
        return JSONResponse({
            "success": True,
            "data": [resource.dict() for resource in resources],
            "message": f"Generated learning roadmap for {target_role}."
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")

@app.get("/job-market")
async def job_market(role: Optional[str] = None):
    """Get job market insights."""
    try:
        # Mock job market data
        insights = [
            JobMarketInsight(
                role="Frontend Developer",
                openings=1250,
                salary_range="$70K - $120K",
                growth_trend="Rising",
                location="Remote/Global"
            ),
            JobMarketInsight(
                role="Full Stack Developer",
                openings=980,
                salary_range="$80K - $140K",
                growth_trend="Rising",
                location="Remote/Global"
            ),
            JobMarketInsight(
                role="Data Scientist",
                openings=750,
                salary_range="$95K - $160K",
                growth_trend="Rising",
                location="San Francisco, CA"
            ),
            # Add more insights...
        ]
        
        # Filter by role if specified
        if role:
            insights = [i for i in insights if role.lower() in i.role.lower()]
        
        return JSONResponse({
            "success": True,
            "data": [insight.dict() for insight in insights],
            "message": f"Retrieved {len(insights)} job market insights."
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job market data retrieval failed: {str(e)}")

# ========================
# Recruiter Endpoints
# ========================

@app.post("/jd-summarizer")
async def jd_summarizer(file: UploadFile = File(...)):
    """Parse and summarize job description."""
    try:
        content = await file.read()
        text_content = content.decode('utf-8', errors='ignore')
        
        # Mock JD parsing (replace with actual NLP)
        summary = JDSummary(
            title="Senior Frontend Developer",
            department="Engineering",
            experience_level="5+ years",
            required_skills=["React.js", "TypeScript", "JavaScript", "HTML/CSS", "Redux"],
            preferred_skills=["Node.js", "AWS", "Docker", "Kubernetes"],
            responsibilities=[
                "Develop and maintain complex web applications",
                "Collaborate with cross-functional teams",
                "Optimize applications for maximum speed and scalability"
            ],
            qualifications=[
                "Bachelor's degree in Computer Science",
                "5+ years of frontend development experience",
                "Strong proficiency in React.js"
            ]
        )
        
        return JSONResponse({
            "success": True,
            "data": summary.dict(),
            "message": "Job description analyzed successfully."
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"JD analysis failed: {str(e)}")

@app.post("/cv-parser")
async def cv_parser(file: UploadFile = File(...)):
    """Parse candidate CV."""
    try:
        content = await file.read()
        text_content = content.decode('utf-8', errors='ignore')
        
        # Extract candidate info (mock implementation)
        candidate_name = file.filename.replace('.pdf', '').replace('.txt', '').replace('_', ' ').title()
        
        cv_data = CVParsedData(
            candidate_name=candidate_name,
            email=f"{candidate_name.lower().replace(' ', '.')}@email.com",
            phone="+1-555-" + str(random.randint(1000, 9999)),
            skills=["React.js", "TypeScript", "JavaScript", "Node.js", "Python", "SQL"],
            experience_years=random.randint(2, 8),
            education=["Bachelor's in Computer Science"],
            previous_roles=["Software Engineer at TechCorp", "Frontend Developer at StartupXYZ"]
        )
        
        return JSONResponse({
            "success": True,
            "data": cv_data.dict(),
            "message": "CV parsed successfully."
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV parsing failed: {str(e)}")

@app.post("/match-scorer")
async def match_scorer(request_data: dict):
    """Calculate match score between JD and CV."""
    try:
        jd_data = request_data.get('jd')
        cv_data = request_data.get('cv')
        
        if not jd_data or not cv_data:
            raise HTTPException(status_code=400, detail="Both JD and CV data are required")
        
        # Calculate match score (mock implementation)
        required_skills = jd_data.get('required_skills', [])
        candidate_skills = cv_data.get('skills', [])
        
        matching_skills = [skill for skill in required_skills 
                          if any(cs.lower() in skill.lower() for cs in candidate_skills)]
        missing_skills = [skill for skill in required_skills if skill not in matching_skills]
        
        match_score = int((len(matching_skills) / len(required_skills)) * 100) if required_skills else 0
        status = 'shortlisted' if match_score >= 80 else 'rejected'
        
        result = MatchResult(
            candidate_id=str(uuid.uuid4()),
            candidate_name=cv_data.get('candidate_name', 'Unknown'),
            match_score=match_score,
            missing_skills=missing_skills,
            matching_skills=matching_skills,
            status=status,
            message=f"Candidate scored {match_score}% match." if status == 'rejected' 
                   else f"Excellent match! Candidate meets {match_score}% of requirements."
        )
        
        return JSONResponse({
            "success": True,
            "data": result.dict(),
            "message": "Match analysis completed."
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Match scoring failed: {str(e)}")

@app.post("/interview-scheduler")
async def interview_scheduler(request_data: dict):
    """Schedule interview if match score >= 80%."""
    try:
        match_score = request_data.get('match_score', 0)
        candidate_name = request_data.get('candidate_name', 'Unknown')
        
        if match_score < 80:
            return JSONResponse({
                "success": False,
                "data": {
                    "match_score": match_score,
                    "status": "rejected",
                    "message": "❌ Candidate did not pass screening."
                },
                "message": "Candidate does not meet minimum requirements."
            })
        
        # Calculate interview date (2 days later at 11:00 AM)
        interview_date = datetime.now() + timedelta(days=2)
        interview_date = interview_date.replace(hour=11, minute=0, second=0, microsecond=0)
        
        return JSONResponse({
            "success": True,
            "data": {
                "match_score": match_score,
                "status": "shortlisted",
                "interview_date": interview_date.isoformat(),
                "message": f"✅ Candidate shortlisted. Interview scheduled on {interview_date.strftime('%Y-%m-%d')} at 11:00 AM. Email notification ready for n8n."
            },
            "message": "Interview scheduled successfully."
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview scheduling failed: {str(e)}")

# ========================
# Health Check
# ========================

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Career Platform API is running",
        "version": "1.0.0",
        "endpoints": {
            "student": ["/analyze-skills", "/career-path", "/learning-roadmap", "/job-market"],
            "recruiter": ["/jd-summarizer", "/cv-parser", "/match-scorer", "/interview-scheduler"]
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "operational",
            "database": "not_connected",  # Update when you connect a real database
            "ai_models": "mock_mode"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)