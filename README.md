# Career.io - AI Resume Analyzer

A premium, modern SaaS application that analyzes resumes against job descriptions using AI (via OpenRouter Step 3.5 Flash).

## ✨ Features
- **AI-Powered ATS Scoring**: Get a realistic score based on industry standards.
- **Keyword Gap Analysis**: Identify missing critical and technical skills.
- **Bullet-Point Optimization**: Get specific suggestions to improve your resume content.
- **Glassmorphism UI**: Beautiful, interactive landing page and results dashboard.

## 🏗️ Architecture
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: FastAPI (Python), OpenRouter API, Pydantic.

## 🚀 Local Setup

### 1. Backend
1. Clone the repository.
2. Navigate to `/backend`.
3. Create a virtual environment: `python -m venv venv`.
4. Install dependencies: `pip install -r requirements.txt`.
5. Create a `.env` file from the placeholder:
   ```env
   OPENROUTER_API_KEY=your_key_here
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```
6. Run the server: `python main.py` or `uvicorn main:app --reload`.

### 2. Frontend
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Set environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```
4. Run the development server: `npm run dev`.

## 📦 Production Deployment

### Backend (Docker)
1. Build the image: `docker build -t career-io-backend ./backend`.
2. Run the container: `docker run -p 8000:8000 -e OPENROUTER_API_KEY=... career-io-backend`.

### Frontend
1. Build the production app: `npm run build`.
2. Deploy the `.next` folder to Vercel or your preferred host.

## 🔒 Security & Scaling
- Ensure `ALLOWED_ORIGINS` is set in the backend to your frontend domain.
- Use a database (e.g., Supabase, PostgreSQL) to persist user data for a full SaaS experience.
- Implement auth (Clerk/NextAuth) before going live with a public user base.
