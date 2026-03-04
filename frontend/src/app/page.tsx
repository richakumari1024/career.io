"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Upload, FileText, Sparkles, Target, AlertTriangle, CheckCircle2, Copy,
  ChevronDown, ChevronUp, Zap, BarChart3, Lightbulb, ArrowRight,
  Search, PenTool, GraduationCap, Briefcase, Users, Github,
  Linkedin, BookOpen, ExternalLink, Star, TrendingUp, Shield,
  Cpu, Cloud, Database, Globe, MousePointer,
  LogOut, LogIn, User as UserIcon, History as HistoryIcon,
  X, Mail, Lock, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 15C30.7 15 15 30.7 15 50s15.7 35 35 35c8.5 0 16.3-3.1 22.4-8.2l-6.4-6.4c-4.4 3-9.7 4.6-16 4.6-13.8 0-25-11.2-25-25s11.2-25 25-25c7.8 0 14.8 3.5 19.5 9.1L50 50h40C90 30.7 72.1 15 50 15z" fill="currentColor" />
    <path d="M75 50l10 10 10-10H75z" fill="currentColor" transform="translate(-5, 0)" />
  </svg>
);

/* ════════════════════════════════════════════════════
   BACKGROUND PARTICLES
   ════════════════════════════════════════════════════ */
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; pulse: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.body.scrollHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.01;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 92, 252, ${currentOpacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124, 92, 252, ${0.05 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ════════════════════════════════════════════════════
   ATS SCORE GAUGE (for mockup)
   ════════════════════════════════════════════════════ */
function ScoreGauge({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} className="score-gauge-track" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="score-gauge-fill"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground">ATS Score</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION HEADER
   ════════════════════════════════════════════════════ */
function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-primary font-medium mb-6">
        <Sparkles className="w-3 h-3" /> {badge}
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{subtitle}</p>
    </div>
  );
}

const JOB_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Architect",
  "Product Manager",
  "Project Manager",
  "UX/UI Designer",
  "Quality Assurance (QA) Engineer",
  "Cybersecurity Analyst",
  "Business Analyst",
  "Marketing Manager",
  "Sales Representative",
  "Human Resources (HR) Specialist",
  "Financial Analyst",
  "Operations Manager",
  "Custom Job Description"
];

/* ════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════ */
export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Functional States
  const [file, setFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState("Custom Job Description");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"analyzer" | "history">("analyzer");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      }
      setShowAuthModal(false);
      setAuthEmail("");
      setAuthPassword("");
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView("analyzer");
  };

  const fetchHistory = async () => {
    if (!session) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.get(`${baseUrl}/history`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    if (view === "history" && session) {
      fetchHistory();
    }
  }, [view, session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      setError("Please upload a resume and provide a job description.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

      // Step 1: Parse the resume
      const formData = new FormData();
      formData.append("file", file);

      const parseResponse = await axios.post(`${baseUrl}/parse-pdf`, formData);
      const resumeText = parseResponse.data.text;

      // Step 2: Analyze the resume
      const headers: any = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const analyzeResponse = await axios.post(`${baseUrl}/analyze`, {
        resume_text: resumeText,
        job_description: jobDescription
      }, { headers });

      setResult(analyzeResponse.data);
      // Scroll to result
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred during analysis. Make sure the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Particles />

      {/* ──────────────────────────────────────────
          NAV (Extracted logic remains same as navbar change above)
          ────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <Logo className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">Career.io</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#demo" className="hover:text-foreground transition">Demo</a>
            <a href="#tech" className="hover:text-foreground transition">Tech Stack</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView(view === "analyzer" ? "history" : "analyzer")}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
                >
                  <HistoryIcon className="w-4 h-4" />
                  {view === "analyzer" ? "View History" : "Back to Analyzer"}
                </button>
                <div className="h-6 w-px bg-border/50" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition border border-primary/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {view === "analyzer" ? (
        <>
          <section className="relative pt-32 pb-24 px-6">
            {/* Decorative orbs */}
            <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
              {/* Left — Copy */}
              <div className={`space-y-8 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-primary font-medium">
                  <Sparkles className="w-3 h-3" /> AI-Powered Resume Analysis
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                  <span className="gradient-text">Beat the ATS.</span>
                  <br />
                  <span className="text-foreground">Get More</span>
                  <br />
                  <span className="text-foreground">Interviews.</span>
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Upload your resume and paste a job description to receive instant AI-powered analysis,
                  keyword gap detection, and improved bullet point suggestions.
                </p>

                <div className="flex flex-wrap gap-4">
                  <a href="#analyzer" className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all animate-pulse-glow">
                    Analyze My Resume
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <button
                    onClick={() => {
                      setSelectedRole("Custom Job Description");
                      setJobDescription("We are looking for a Senior Full-Stack Engineer with experience in Next.js, FastAPI, and Cloud Architecture...");
                      document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass text-foreground font-semibold text-base hover:bg-white/5 transition-all border border-border/50"
                  >
                    <MousePointer className="w-4 h-4" /> Try Demo Resume
                  </button>
                </div>

                <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free to use</div>
                  <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> No data stored</div>
                  <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-400" /> Instant results</div>
                </div>
              </div>

              {/* Right — Product Mockup */}
              <div className={`${mounted ? "animate-scale-in" : "opacity-0"}`} style={{ animationDelay: "0.3s" }}>
                <div className="glass-strong rounded-3xl p-6 glow-primary animate-float-slow">
                  {/* Mockup Header */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    <span className="ml-3 text-xs text-muted-foreground">Career.io — {result ? "Your Analysis" : "Preview Dashboard"}</span>
                  </div>

                  {/* Top row — Score + Stats */}
                  <div className="grid grid-cols-[auto_1fr] gap-4 mb-4">
                    <div className="glass rounded-2xl p-4 flex items-center justify-center">
                      <ScoreGauge score={result ? result.ats_score : 82} size={110} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="glass rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground">Keywords Found</p>
                        <p className="text-lg font-bold text-emerald-400">
                          {result ? (result.technical_skills?.filter((s: any) => s.status === 'found').length || 0) : 24}
                        </p>
                      </div>
                      <div className="glass rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground">Missing</p>
                        <p className="text-lg font-bold text-red-400">{result ? result.keyword_gaps?.length : 8}</p>
                      </div>
                      <div className="glass rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground">Bullets to Fix</p>
                        <p className="text-lg font-bold text-amber-400">{result ? result.bullet_analysis?.length : 5}</p>
                      </div>
                      <div className="glass rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground">Status</p>
                        <p className="text-lg font-bold text-primary">{result ? "Live" : "Demo"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Keyword Gaps */}
                  <div className="glass rounded-xl p-3 mb-3">
                    <p className="text-[10px] text-muted-foreground mb-2">Key Gaps Detected</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(result?.keyword_gaps?.slice(0, 5) || ["Kubernetes", "CI/CD", "Distributed Systems", "GraphQL", "Terraform"]).map((kw: string) => (
                        <span key={kw} className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-400 border border-red-500/15">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bullet Rewrite */}
                  <div className="glass rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground mb-2">Smart Rewrite Sample</p>
                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                        <p className="text-[11px] text-red-400/90 line-through">
                          &quot;{result ? result.bullet_analysis?.[0]?.original?.substring(0, 50) + "..." : "Managed backend systems."}&quot;
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2">
                        <Sparkles className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-emerald-400">
                          &quot;{result ? result.bullet_analysis?.[0]?.suggestions?.[0]?.substring(0, 80) + "..." : "Improved backend performance by 35% by optimizing API endpoints and reducing database latency."}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="section-divider max-w-5xl mx-auto" />

          {/* ──────────────────────────────────────────
          SECTION: ANALYZER (WORK AREA)
          ────────────────────────────────────────── */}
          <section id="analyzer" className="py-24 px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <SectionHeader
                badge="Analyze Now"
                title="Get Your Analysis"
                subtitle="Upload your resume and paste the job description to start."
              />

              <div className="glass-strong rounded-3xl p-8 md:p-12 glow-primary space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* File Upload */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Upload Resume (PDF/DOCX)</label>
                    <div
                      onClick={() => document.getElementById('fileInput')?.click()}
                      className={`relative h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer
                    ${file ? "border-emerald-500/50 bg-emerald-500/5" : "border-border/50 hover:border-primary/50 hover:bg-white/5"}
                  `}
                    >
                      <input
                        id="fileInput"
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                      />
                      {file ? (
                        <>
                          <FileText className="w-10 h-10 text-emerald-400 mb-3" />
                          <p className="text-sm font-medium text-emerald-400">{file.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Click to change file</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                          <p className="text-sm font-medium">Click to upload or drag & drop</p>
                          <p className="text-xs text-muted-foreground mt-1">Supports PDF and DOCX</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Target Role / Job Description */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Target Role / Job Description</label>
                    <div className="relative">
                      <select
                        value={selectedRole}
                        onChange={(e) => {
                          setSelectedRole(e.target.value);
                          if (e.target.value !== "Custom Job Description") {
                            setJobDescription(`Targeting the following role: ${e.target.value}`);
                          } else {
                            setJobDescription("");
                          }
                        }}
                        className="w-full bg-white/5 border border-border/50 rounded-2xl py-3.5 px-4 text-sm focus:border-primary/50 outline-none transition appearance-none cursor-pointer"
                      >
                        {JOB_ROLES.map(role => (
                          <option key={role} value={role} className="bg-background text-foreground">{role}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>

                    {selectedRole === "Custom Job Description" && (
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the detailed job requirements here..."
                        className="w-full h-32 rounded-2xl bg-white/5 border border-border/50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none animate-in fade-in"
                      />
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                ${isAnalyzing
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:opacity-90 animate-pulse-glow"
                    }
              `}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Analyzing Your Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Run AI Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          <div className="section-divider max-w-5xl mx-auto" />

          {/* ──────────────────────────────────────────
          SECTION: RESULTS (DYNAMIC)
          ────────────────────────────────────────── */}
          {result && (
            <section id="results" className="py-24 px-6 relative z-10 transition-all">
              <div className="max-w-6xl mx-auto">
                <SectionHeader
                  badge="Analysis Complete"
                  title="Your Resume Insights"
                  subtitle="Review your score and see exactly how to improve your application."
                />

                <div className="glass-strong rounded-3xl p-8 md:p-12 glow-primary">
                  <div className="grid lg:grid-cols-[300px_1fr] gap-12">
                    {/* Left — Score & Overview */}
                    <div className="space-y-8">
                      <div className="glass rounded-3xl p-8 flex flex-col items-center text-center">
                        <ScoreGauge score={result.ats_score || 0} size={180} />
                        <h3 className="text-2xl font-bold mt-6">
                          {result.ats_score >= 75 ? "Strong Candidate" : result.ats_score >= 50 ? "Solid Base" : "Needs Improvement"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Your resume matches {result.ats_score}% of the core requirements.
                        </p>
                      </div>

                      <div className="glass rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Technical Keywords</span>
                          <span className="font-bold text-emerald-400 text-lg">
                            {result.technical_skills?.filter((s: any) => s.status === 'found').length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Gaps Detected</span>
                          <span className="font-bold text-red-400 text-lg">{result.keyword_gaps?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Analyses</span>
                          <span className="font-bold text-amber-400 text-lg">{result.bullet_analysis?.length || 0} bullets</span>
                        </div>
                      </div>
                    </div>

                    {/* Right — Detailed Analysis */}
                    <div className="space-y-8">
                      {/* Keyword Gaps */}
                      <div className="space-y-4">
                        <h4 className="text-xl font-bold flex items-center gap-2">
                          <Target className="w-5 h-5 text-red-400" /> Missing Keywords
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          ATS systems look for these specific terms. Ensure you incorporate these naturally into your experience.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {result.keyword_gaps?.map((kw: string) => (
                            <span key={kw} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/15 text-sm font-medium">
                              {kw}
                            </span>
                          ))}
                          {(!result.keyword_gaps || result.keyword_gaps.length === 0) && (
                            <p className="text-sm italic text-emerald-400 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> No major keyword gaps found!
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bullet Rewrites */}
                      <div className="space-y-4 pt-4">
                        <h4 className="text-xl font-bold flex items-center gap-2">
                          <PenTool className="w-5 h-5 text-primary" /> Bullet Point Improvements
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          We've rewritten your experience to focus on quantifiable results and stronger action verbs.
                        </p>
                        <div className="space-y-6 pt-2">
                          {result.bullet_analysis?.map((bullet: any, idx: number) => (
                            <div key={idx} className="glass rounded-2xl overflow-hidden border border-border/30">
                              <div className="p-4 bg-red-500/5 border-b border-border/30">
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Original Experience</p>
                                <p className="text-sm text-muted-foreground italic">&quot;{bullet.original}&quot;</p>
                              </div>
                              <div className="p-4 bg-emerald-500/5">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">AI-Enhanced Version</p>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                      <Star key={s} className={`w-2.5 h-2.5 ${s <= bullet.score ? "text-primary fill-primary" : "text-muted"}`} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-foreground font-medium leading-relaxed">&quot;{bullet.suggestions?.[0]}&quot;</p>
                                <div className="mt-3 flex items-center gap-2">
                                  <Lightbulb className="w-3 h-3 text-primary" />
                                  <p className="text-[11px] text-muted-foreground italic">{bullet.explanation}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="section-divider max-w-5xl mx-auto" />

          {/* ──────────────────────────────────────────
          SECTION 2 — HOW IT WORKS
          ────────────────────────────────────────── */}
          <section className="py-24 px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <SectionHeader
                badge="Simple Process"
                title="How It Works"
                subtitle="Three simple steps to a better resume."
              />

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: 1,
                    icon: Upload,
                    title: "Upload Resume",
                    desc: "Drag and drop PDF or DOCX resumes for instant parsing.",
                  },
                  {
                    step: 2,
                    icon: Target,
                    title: "Paste Job Description",
                    desc: "Add a job description to analyze required skills and keywords.",
                  },
                  {
                    step: 3,
                    icon: Sparkles,
                    title: "Get AI Analysis",
                    desc: "Receive ATS score, keyword gaps, and improved bullet point suggestions instantly.",
                  },
                ].map((item) => (
                  <div key={item.step} className="glass-card rounded-2xl p-8 text-center relative group">
                    {/* Step number */}
                    <div className="step-number w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-bold text-white">
                      {item.step}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>

                    {/* Connector line */}
                    {item.step < 3 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t border-dashed border-primary/20" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="section-divider max-w-5xl mx-auto" />

          {/* ──────────────────────────────────────────
          SECTION 3 — FEATURES
          ────────────────────────────────────────── */}
          <section id="features" className="py-24 px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <SectionHeader
                badge="Powerful Features"
                title="Everything You Need to Land Interviews"
                subtitle="AI-powered tools that give you an unfair advantage in the job market."
              />

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: BarChart3,
                    title: "ATS Score",
                    desc: "See how well your resume matches the job description with a detailed compatibility score.",
                    color: "#7c5cfc",
                  },
                  {
                    icon: Search,
                    title: "Keyword Gap Analysis",
                    desc: "Identify missing keywords required by ATS systems and learn how to add them naturally.",
                    color: "#06b6d4",
                  },
                  {
                    icon: TrendingUp,
                    title: "Bullet Point Strength Analyzer",
                    desc: "AI detects weak, vague bullet points and recommends stronger, impact-driven versions.",
                    color: "#f59e0b",
                  },
                  {
                    icon: PenTool,
                    title: "AI Rewrite Suggestions",
                    desc: "Generate improved bullet points with quantifiable achievements and stronger action verbs.",
                    color: "#10b981",
                  },
                ].map((f) => (
                  <div key={f.title} className="glass-card rounded-2xl p-8 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}15` }}>
                      <f.icon className="w-6 h-6" style={{ color: f.color }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="section-divider max-w-5xl mx-auto" />

          {/* ──────────────────────────────────────────
          SECTION 4 — PRODUCT DEMO
          ────────────────────────────────────────── */}
          <section id="demo" className="py-24 px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <SectionHeader
                badge="Live Preview"
                title="See It In Action"
                subtitle="A real analysis showing how Career.io identifies gaps and suggests improvements."
              />

              <div className="glass-strong rounded-3xl p-8 glow-primary">
                {/* Mockup browser chrome */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  <div className="flex-1 ml-4 h-7 rounded-lg bg-white/5 flex items-center px-3">
                    <span className="text-[10px] text-muted-foreground">career.io/dashboard</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-[260px_1fr] gap-6">
                  {/* Left — Score panel */}
                  <div className="space-y-4">
                    <div className="glass rounded-2xl p-5 flex flex-col items-center">
                      <ScoreGauge score={82} size={140} />
                      <p className="text-sm font-medium mt-3">Strong Match</p>
                      <p className="text-xs text-muted-foreground">vs. Senior Full-Stack Engineer</p>
                    </div>

                    <div className="glass rounded-xl p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Keywords Found</span>
                        <span className="font-semibold text-emerald-400">24</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Keywords Missing</span>
                        <span className="font-semibold text-red-400">8</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Weak Bullets</span>
                        <span className="font-semibold text-amber-400">5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rewrites Ready</span>
                        <span className="font-semibold text-primary">12</span>
                      </div>
                    </div>
                  </div>

                  {/* Right — Details */}
                  <div className="space-y-4">
                    {/* Missing keywords */}
                    <div className="glass rounded-2xl p-5">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" /> Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["Kubernetes", "CI/CD", "Distributed Systems", "Docker", "RabbitMQ", "Kafka", "GraphQL", "Terraform"].map((kw) => (
                          <span key={kw} className="px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/15 font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Found keywords */}
                    <div className="glass rounded-2xl p-5">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Keywords Found
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["Python", "TypeScript", "React", "Node.js", "PostgreSQL", "REST API", "Agile", "Git"].map((kw) => (
                          <span key={kw} className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bullet rewrite example */}
                    <div className="glass rounded-2xl p-5">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-primary" /> Bullet Rewrite
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                          <p className="text-xs text-muted-foreground mb-1">Original • Score: 2/5</p>
                          <p className="text-sm text-red-400/90">&quot;Managed backend systems.&quot;</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-primary" /> AI Rewrite • Score: 5/5
                          </p>
                          <p className="text-sm text-emerald-400">&quot;Improved backend performance by 35% by optimizing API endpoints and reducing database latency.&quot;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="section-divider max-w-5xl mx-auto" />

          {/* ──────────────────────────────────────────
          SECTION 5 — WHO IT'S FOR
          ────────────────────────────────────────── */}
          <section className="py-24 px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <SectionHeader
                badge="Built For You"
                title="Who It's For"
                subtitle="Whether you're starting out or leveling up, Career.io helps you stand out."
              />

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: GraduationCap,
                    title: "Recent Graduates",
                    desc: "Improve your resume to pass ATS filters and land your first job interviews.",
                    color: "#7c5cfc",
                  },
                  {
                    icon: Briefcase,
                    title: "Career Switchers",
                    desc: "Translate your experience into new industry language and terminology.",
                    color: "#06b6d4",
                  },
                  {
                    icon: Users,
                    title: "Active Job Seekers",
                    desc: "Tailor your resume for multiple applications quickly and efficiently.",
                    color: "#10b981",
                  },
                ].map((p) => (
                  <div key={p.title} className="glass-card rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: `${p.color}12` }}>
                      <p.icon className="w-8 h-8" style={{ color: p.color }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="section-divider max-w-5xl mx-auto" />

          {/* ──────────────────────────────────────────
          SECTION 6 — TECH STACK
          ────────────────────────────────────────── */}
          <section id="tech" className="py-24 px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <SectionHeader
                badge="Under the Hood"
                title="Tech Stack"
                subtitle="Built as a full-stack AI portfolio project with modern tools."
              />

              <div className="flex flex-wrap justify-center gap-6">
                {[
                  { name: "Next.js", icon: Globe, color: "#ffffff" },
                  { name: "FastAPI", icon: Zap, color: "#059669" },
                  { name: "Claude AI", icon: Cpu, color: "#d97706" },
                  { name: "Supabase", icon: Database, color: "#10b981" },
                  { name: "Vercel", icon: Cloud, color: "#ffffff" },
                ].map((t) => (
                  <div key={t.name} className="tech-icon glass-card rounded-2xl px-8 py-6 flex flex-col items-center gap-3 min-w-[130px]">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <t.icon className="w-6 h-6" style={{ color: t.color }} />
                    </div>
                    <span className="text-sm font-medium">{t.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-8">Built as a full-stack AI portfolio project.</p>
            </div>
          </section>

          <div className="section-divider max-w-5xl mx-auto" />

          {/* ──────────────────────────────────────────
          SECTION 7 — FINAL CTA
          ────────────────────────────────────────── */}
          <section id="cta" className="py-24 px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              {/* Decorative glow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

              <div className="relative glass-strong rounded-3xl p-12 md:p-16 gradient-border">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-primary font-medium mb-6">
                  <Star className="w-3 h-3" /> Get Started Free
                </div>

                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  Start Improving Your
                  <br />
                  <span className="gradient-text">Resume Today</span>
                </h2>

                <p className="text-muted-foreground mb-8 text-lg max-w-lg mx-auto">
                  Join thousands of job seekers using AI to land more interviews.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <button className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all animate-pulse-glow">
                    Analyze Resume
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass text-foreground font-semibold text-base hover:bg-white/5 transition-all border border-border/50">
                    Try Demo
                  </button>
                </div>
              </div>
            </div>
          </section>

        </>
      ) : (
        <section className="pt-32 pb-24 px-6 relative z-10 min-h-screen">
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              badge="Your Journey"
              title="Analysis History"
              subtitle="Review your past resume analyses and track your improvement."
            />

            {history.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center border border-dashed border-border/50">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <HistoryIcon className="w-8 h-8 text-primary/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No history yet</h3>
                <p className="text-muted-foreground mb-8">Run your first analysis to see it saved here.</p>
                <button
                  onClick={() => setView("analyzer")}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition"
                >
                  Analyze Now
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {history.map((item: any) => (
                  <div key={item.id} className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all group">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-semibold text-lg line-clamp-1">{item.resume_text.substring(0, 80)}...</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.job_description.substring(0, 120)}...</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold gradient-text">{item.ats_score}</div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">ATS Score</div>
                        </div>
                        <button
                          onClick={() => {
                            setResult(item.full_result);
                            setView("analyzer");
                            setTimeout(() => document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' }), 100);
                          }}
                          className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition group-hover:scale-105"
                        >
                          <ChevronDown className="w-5 h-5 -rotate-90" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────
          AUTH MODAL
          ────────────────────────────────────────── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
          <div className="relative w-full max-w-md glass-strong rounded-3xl p-8 shadow-2xl border border-primary/20 animate-scale-in">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 transition text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8 items-center flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center glow-primary mb-4">
                <Logo className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{authMode === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {authMode === "login" ? "Sign in to save your progress" : "Start your journey to a better career"}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email" required
                    value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-border/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:border-primary/50 outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password" required
                    value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-border/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:border-primary/50 outline-none transition"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-400 leading-normal">{authError}</p>
                </div>
              )}

              <button
                disabled={authLoading}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/20"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {authMode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                {authMode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  className="text-primary font-semibold hover:underline"
                >
                  {authMode === "login" ? "Sign up now" : "Login instead"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────
          SECTION 8 — FOOTER
          ────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
            {/* Left */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Logo className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-lg">Career.io</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                AI-powered resume analysis to help you land more interviews. Built with Next.js, FastAPI, and Supabase.
              </p>
            </div>

            {/* Right — Links */}
            <div className="flex gap-12">
              <div>
                <h4 className="text-sm font-semibold mb-3">Links</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="https://github.com" className="hover:text-foreground transition flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /> GitHub</a></li>
                  <li><a href="#" className="hover:text-foreground transition flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Portfolio</a></li>
                  <li><a href="https://linkedin.com" className="hover:text-foreground transition flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</a></li>
                  <li><a href="#" className="hover:text-foreground transition flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Documentation</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="section-divider my-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>© 2026 Career.io. Built with Next.js, FastAPI, and OpenRouter AI.</span>
            <span>A Portfolio Project</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
