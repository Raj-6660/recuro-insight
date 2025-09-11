# Career Platform Backend

AI-powered career navigation and recruitment platform backend built with FastAPI.

## Features

### Student Features
- **Skill Analysis**: Upload CV/transcript to extract skills with confidence scores
- **Career Path Finder**: Get career recommendations based on current skills
- **Learning Roadmap**: Generate personalized learning paths for target roles
- **Job Market Insights**: Real-time job market data and trends

### Recruiter Features
- **JD Summarizer**: Parse job descriptions and extract requirements
- **CV Parser**: Extract structured data from candidate CVs
- **Match Scorer**: Calculate compatibility between JDs and CVs
- **Interview Scheduler**: Auto-schedule interviews for high-scoring candidates

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Database
```bash
# For PostgreSQL
createdb career_platform
psql career_platform < sql_schema.sql

# For SQLite (simpler for testing)
sqlite3 career_platform.db < sql_schema.sql
```

### 3. Configure Environment
```bash
# Create .env file
cp .env.example .env

# Edit with your database credentials
DATABASE_URL=postgresql://user:password@localhost/career_platform
# OR for SQLite:
# DATABASE_URL=sqlite:///career_platform.db
```

### 4. Run the Server
```bash
python app.py
# OR
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Student Endpoints
- `POST /analyze-skills` - Upload CV/transcript for skill extraction
- `POST /career-path` - Get career recommendations
- `POST /learning-roadmap` - Generate learning roadmap
- `GET /job-market` - Get job market insights

### Recruiter Endpoints
- `POST /jd-summarizer` - Parse job description
- `POST /cv-parser` - Parse candidate CV
- `POST /match-scorer` - Calculate JD-CV match score
- `POST /interview-scheduler` - Schedule interviews for qualified candidates

### Utility Endpoints
- `GET /` - API information
- `GET /health` - Health check

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Example Usage

### Analyze Skills
```python
import requests

# Upload CV for skill analysis
with open('resume.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/analyze-skills',
        files={'file': f}
    )
    skills = response.json()['data']
    print(f"Found {len(skills)} skills")
```

### Get Career Paths
```python
response = requests.post(
    'http://localhost:8000/career-path',
    json={'skills': ['React.js', 'Python', 'SQL']}
)
career_paths = response.json()['data']
```

### Match CV to JD
```python
jd_data = {...}  # Job description data
cv_data = {...}  # CV data

response = requests.post(
    'http://localhost:8000/match-scorer',
    json={'jd': jd_data, 'cv': cv_data}
)
match_result = response.json()['data']

if match_result['match_score'] >= 80:
    # Schedule interview
    interview_response = requests.post(
        'http://localhost:8000/interview-scheduler',
        json=match_result
    )
```

## Interview Scheduling Logic

The backend automatically:
1. Calculates match scores between JD and CV
2. If score ≥ 80%: Sets interview date to current date + 2 days at 11:00 AM
3. Returns JSON with interview details for n8n email automation
4. If score < 80%: Returns rejection message

## Integration with n8n

The `/interview-scheduler` endpoint returns structured data for n8n workflows:

```json
{
  "success": true,
  "data": {
    "match_score": 85,
    "status": "shortlisted",
    "interview_date": "2024-01-15T11:00:00",
    "message": "✅ Candidate shortlisted. Interview scheduled..."
  }
}
```

Use this data in n8n to:
- Send email notifications to recruiter and candidate
- Create calendar events
- Update CRM systems
- Trigger follow-up workflows

## Database Schema

See `sql_schema.sql` for the complete database structure including:
- User authentication and roles
- Student profiles and skill analyses
- Job descriptions and candidate CVs
- Match results and interview scheduling
- Job market insights

## Production Deployment

### With Docker
```bash
# Build image
docker build -t career-platform-backend .

# Run container
docker run -p 8000:8000 -e DATABASE_URL=your_db_url career-platform-backend
```

### With Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/career_platform
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: career_platform
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Development Notes

### Current Implementation
- Mock AI/ML models for demo purposes
- In-memory data processing
- Basic file parsing
- Sample data generation

### Production Improvements
1. **Replace Mock AI with Real Models**:
   - Use NLP models for skill extraction
   - Implement actual career recommendation algorithms
   - Add proper CV parsing with OCR

2. **Database Integration**:
   - Connect to PostgreSQL/MySQL
   - Implement proper data persistence
   - Add caching with Redis

3. **Authentication & Security**:
   - JWT token authentication
   - Role-based access control
   - API rate limiting
   - Input validation and sanitization

4. **Scalability**:
   - Async task processing with Celery
   - File storage with S3/CloudStorage
   - Microservices architecture
   - Load balancing

5. **Monitoring & Logging**:
   - Structured logging
   - Performance monitoring
   - Error tracking
   - Health checks

## Support

For questions about the backend implementation:
1. Check the API documentation at `/docs`
2. Review the example usage in this README
3. Examine the database schema in `sql_schema.sql`
4. Test endpoints with the provided mock data