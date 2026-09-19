import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    name: "Amara Patel",
    role: "Freelance Designer",
    text: "GreenTrack completely changed how I handle my finances. I finally know where every rupee goes.",
    avatar: "AP",
  },
  {
    name: "James Okafor",
    role: "Software Engineer",
    text: "The analytics dashboard is gorgeous. I check it every morning with my coffee.",
    avatar: "JO",
  },
  {
    name: "Selin Yıldız",
    role: "Small Business Owner",
    text: "I was drowning in spreadsheets. Now everything is in one place and it actually makes sense.",
    avatar: "SY",
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "$2.4B", label: "Expenses Tracked" },
  { value: "98%", label: "Uptime" },
  { value: "4.9★", label: "App Rating" },
];

const features = [
  {
    icon: "📊",
    title: "Real-time Analytics",
    desc: "Interactive charts break down your spending by category, day, and merchant — so you always know where your money actually went.",
  },
  {
    icon: "🔔",
    title: "Smart Budget Alerts",
    desc: "Set monthly limits and get notified before you overspend. GreenTrack learns your habits and nudges you at the right moment.",
  },
  {
    icon: "🔐",
    title: "Bank-grade Security",
    desc: "Your data is encrypted end-to-end with AES-256. We never sell your information. Your finances, your privacy.",
  },
  {
    icon: "🔄",
    title: "Auto-categorization",
    desc: "Transactions are sorted automatically into 30+ categories using AI. Manual sorting is a thing of the past.",
  },
  {
    icon: "📱",
    title: "Works Everywhere",
    desc: "Seamlessly synced across web, iOS, and Android. Start on your laptop, continue on your phone — no friction.",
  },
  {
    icon: "📥",
    title: "Export & Reports",
    desc: "Download monthly PDF reports or export raw CSVs for your accountant, tax return, or personal records.",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflowX: "hidden" }}
      className="bg-[#0a0f0d] text-white"
    >
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700&display=swap');
        html { scroll-behavior: smooth; }
        .playfair { font-family: 'Playfair Display', Georgia, serif; }
        .hero-glow { background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,197,94,0.18) 0%, transparent 70%); }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(34,197,94,0.1); }
        .btn-primary { background: linear-gradient(135deg, #16a34a, #22c55e); transition: filter 0.2s, transform 0.15s; }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .btn-outline { border: 1.5px solid rgba(34,197,94,0.4); transition: background 0.2s, border-color 0.2s; }
        .btn-outline:hover { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.7); }
        .noise::after { content:''; position:absolute; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E"); pointer-events:none; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        .float { animation: float 5s ease-in-out infinite; }
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.6; } 100% { transform: scale(1.3); opacity: 0; } }
        .pulse-dot::before { content:''; position:absolute; inset:-6px; border-radius:50%; border:2px solid #22c55e; animation: pulse-ring 1.8s ease-out infinite; }
      `}</style>

      
      

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="hero-glow noise relative min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ paddingTop: 120, paddingBottom: 80 }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: "20%", left: "8%", width: 320, height: 320,
          borderRadius: "50%", background: "rgba(34,197,94,0.06)", filter: "blur(80px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "6%", width: 260, height: 260,
          borderRadius: "50%", background: "rgba(16,163,74,0.07)", filter: "blur(60px)", pointerEvents: "none",
        }} />

        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "1px solid rgba(74,222,128,0.25)", borderRadius: 100,
            padding: "6px 16px", marginBottom: 28, fontSize: 13, color: "#4ade80",
            background: "rgba(74,222,128,0.06)",
          }}
        >
          <span style={{ position: "relative" }} className="pulse-dot">
            <span style={{
              display: "inline-block", width: 7, height: 7, borderRadius: "50%",
              background: "#4ade80", position: "relative",
            }} />
          </span>
          &nbsp;&nbsp;Now with AI-powered insights — free forever
        </div>

        <h1
          className="playfair"
          style={{
            fontSize: "clamp(42px, 7vw, 88px)", lineHeight: 1.08, fontWeight: 700,
            maxWidth: 820, marginBottom: 24, letterSpacing: "-1.5px",
          }}
        >
          Your money,{" "}
          <span style={{ color: "#4ade80" }}>finally</span>{" "}
          making sense.
        </h1>

        <p
          style={{
            fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.55)",
            maxWidth: 560, lineHeight: 1.7, marginBottom: 44, fontWeight: 300,
          }}
        >
          GreenTrack turns scattered transactions into clear insights. Understand your spending, hit your savings goals, and build wealth — one smart decision at a time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ marginBottom: 72 }}>
          <Link
            to="/register"
            className="btn-primary"
            style={{
              padding: "14px 32px", borderRadius: 12, fontSize: 16,
              fontWeight: 600, color: "#fff", display: "inline-block",
            }}
          >
            Start tracking for free →
          </Link>
          <Link
            to="/login"
            className="btn-outline"
            style={{
              padding: "14px 32px", borderRadius: 12, fontSize: 16,
              fontWeight: 500, color: "rgba(255,255,255,0.75)", display: "inline-block",
            }}
          >
            See live demo
          </Link>
        </div>

        {/* Dashboard mockup */}
        <div
          className="float"
          style={{
            width: "100%", maxWidth: 860,
            border: "1px solid rgba(74,222,128,0.15)", borderRadius: 20,
            background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)",
            overflow: "hidden", padding: "28px 28px 0",
            boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.08)",
          }}
        >
          {/* Mock top bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            {["#f87171", "#fbbf24", "#4ade80"].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
            <div style={{
              flex: 1, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.05)",
              marginLeft: 10, display: "flex", alignItems: "center", paddingLeft: 10,
            }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>app.greentrack.io/dashboard</span>
            </div>
          </div>

          {/* Mock dashboard content */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Balance", value: "$12,480", change: "+4.2%", up: true },
              { label: "Monthly Spend", value: "$3,245", change: "-12%", up: false },
              { label: "Savings Goal", value: "68%", change: "on track", up: true },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: "rgba(255,255,255,0.05)", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.07)", padding: "14px 16px",
                }}
              >
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{card.label}</p>
                <p style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{card.value}</p>
                <span style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 6,
                  background: card.up ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
                  color: card.up ? "#4ade80" : "#f87171",
                }}>{card.change}</span>
              </div>
            ))}
          </div>

          {/* Mock bar chart */}
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: "12px 12px 0 0",
            border: "1px solid rgba(255,255,255,0.06)", borderBottom: "none",
            padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10,
          }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Spending this month</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
              {[55, 80, 40, 95, 60, 75, 50, 88, 65, 70, 45, 90].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, borderRadius: "4px 4px 0 0",
                    height: `${h}%`,
                    background: i === 9 ? "linear-gradient(180deg,#4ade80,#16a34a)" : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 24px", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 32, textAlign: "center" }}>
          {stats.map(({ value, label }, i) => (
            <FadeIn key={label} delay={i * 0.1}>
              <p style={{ fontSize: 38, fontWeight: 700, color: "#4ade80", letterSpacing: "-1px", lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>{label}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{
              fontSize: 12, textTransform: "uppercase", letterSpacing: "3px",
              color: "#4ade80", fontWeight: 600, display: "block", marginBottom: 16,
            }}>Everything you need</span>
            <h2 className="playfair" style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.1 }}>
              Built for people who care<br />about their financial future
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div
                className="card-hover"
                style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16, padding: "28px 28px 32px",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, fontSize: 20,
                  background: "rgba(74,222,128,0.1)", display: "flex",
                  alignItems: "center", justifyContent: "center", marginBottom: 18,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", background: "rgba(74,222,128,0.03)", borderTop: "1px solid rgba(74,222,128,0.08)", borderBottom: "1px solid rgba(74,222,128,0.08)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "3px", color: "#4ade80", fontWeight: 600, display: "block", marginBottom: 16 }}>Simple setup</span>
              <h2 className="playfair" style={{ fontSize: "clamp(30px,5vw,48px)", fontWeight: 700, letterSpacing: "-1px" }}>
                Up and running in 3 minutes
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {[
              { num: "01", title: "Create your account", desc: "Sign up free in seconds — no credit card, no catch." },
              { num: "02", title: "Add your transactions", desc: "Import from CSV, connect your bank, or log manually." },
              { num: "03", title: "Watch the insights roll in", desc: "Your dashboard updates instantly with charts, trends, and alerts." },
            ].map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.12}>
                <div style={{ padding: "32px 28px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: 40, fontWeight: 700, color: "rgba(74,222,128,0.2)", display: "block", marginBottom: 16 }}>{step.num}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "3px", color: "#4ade80", fontWeight: 600, display: "block", marginBottom: 16 }}>Real users, real results</span>
              <h2 className="playfair" style={{ fontSize: "clamp(30px,5vw,48px)", fontWeight: 700, letterSpacing: "-1px" }}>
                People love GreenTrack
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div
                  className="card-hover"
                  style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16, padding: "28px",
                  }}
                >
                  <p style={{ fontSize: 24, marginBottom: 16, color: "#4ade80" }}>"</p>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, marginBottom: 24 }}>{t.text}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "linear-gradient(135deg,#16a34a,#4ade80)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
                    }}>{t.avatar}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing CTA ──────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "80px 24px" }}>
        <FadeIn>
          <div style={{
            maxWidth: 700, margin: "0 auto", textAlign: "center",
            border: "1px solid rgba(74,222,128,0.2)", borderRadius: 24,
            padding: "60px 40px",
            background: "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(34,197,94,0.1), transparent 70%)",
          }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "3px", color: "#4ade80", fontWeight: 600, display: "block", marginBottom: 20 }}>Free forever</span>
            <h2 className="playfair" style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 700, letterSpacing: "-1px", marginBottom: 18 }}>
              Start free. Upgrade when you're ready.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 36 }}>
              The core of GreenTrack — expense tracking, analytics, and budgets — is completely free. No trial period, no credit card required. Upgrade to Pro for advanced reports and multi-currency support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "#fff" }}
              >
                Create free account
              </Link>
              <Link
                to="/pricing"
                className="btn-outline"
                style={{ padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}
              >
                Compare plans
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      
    </div>
  );
}
