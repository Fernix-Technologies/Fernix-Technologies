import { useState, useEffect, useRef, useCallback } from "react";
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER;

// ── Responsive hook ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

// ── Particle canvas ───────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.3, alpha: Math.random() * 0.45 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,179,237,${p.alpha})`; ctx.fill();
      });
      particles.forEach((a, i) => particles.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(139,92,246,${0.13 * (1 - d / 110)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// ── Typing effect ─────────────────────────────────────────────────────────────
function TypingText({ texts }) {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const cur = texts[index];
    const delay = deleting ? 40 : 80;
    const t = setTimeout(() => {
      if (!deleting && display.length < cur.length) setDisplay(cur.slice(0, display.length + 1));
      else if (!deleting && display.length === cur.length) setTimeout(() => setDeleting(true), 1800);
      else if (deleting && display.length > 0) setDisplay(cur.slice(0, display.length - 1));
      else { setDeleting(false); setIndex((index + 1) % texts.length); }
    }, delay);
    return () => clearTimeout(t);
  }, [display, deleting, index, texts]);
  return (
    <span style={{ color: "#63b3ed" }}>
      {display}
      <span style={{ borderRight: "2px solid #63b3ed", animation: "blink 1s infinite" }}>&nbsp;</span>
    </span>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ end, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = end / (duration / 16);
        const t = setInterval(() => {
          start += step;
          if (start >= end) { setVal(end); clearInterval(t); }
          else setVal(Math.floor(start));
        }, 16);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(36px)",
      transition: `opacity 0.65s ${delay}s ease, transform 0.65s ${delay}s ease`,
    }}>
      {children}
    </div>
  );
}

// ── Glass card ────────────────────────────────────────────────────────────────
function GlassCard({ children, style = {} }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${hover ? "rgba(99,179,237,0.45)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 16,
        padding: "1.8rem",
        boxShadow: hover ? "0 0 30px rgba(99,179,237,0.18), 0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.3)",
        transform: hover ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.3s ease",
        height: "100%",
        ...style,
      }}
    >{children}</div>
  );
}

// ── Fernix Logo (actual image) ────────────────────────────────────────────────
function FernixLogo({ size = 40 }) {
  return (
    <img
      src="logo.jpg"
      alt="Fernix Technologies"
      style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(249,115,22,0.35))" }}
    />
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, highlight, color = "#63b3ed", gradient = "135deg, #63b3ed, #8b5cf6", subtitle }) {
  return (
    <Reveal>
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={{ color, fontSize: 12, letterSpacing: 3, marginBottom: 10, textTransform: "uppercase", fontWeight: 600 }}>{eyebrow}</div>
        <h2 style={{ fontSize: "clamp(1.7rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.2 }}>
          {title}{" "}
          <span style={{ background: `linear-gradient(${gradient})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {highlight}
          </span>
        </h2>
        {subtitle && <p style={{ color: "#94a3b8", maxWidth: 560, margin: "1rem auto 0", lineHeight: 1.7, fontSize: 15 }}>{subtitle}</p>}
      </div>
    </Reveal>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// NAV
// ────────────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = ["Services", "AI Media", "Portfolio", "About", "Contact"];
  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase().replace(" ", "-"))?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };
  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? "rgba(5,5,20,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(99,179,237,0.12)" : "none",
        transition: "all 0.3s",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => scrollTo("hero")}>
            <FernixLogo size={40} />
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 3, background: "linear-gradient(90deg,#f97316,#63b3ed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FERNIX</div>
              <div style={{ fontSize: 8, letterSpacing: 4, color: "#94a3b8", marginTop: -2 }}>TECHNOLOGIES</div>
            </div>
          </div>
          {/* Desktop links */}
          {!isMobile && (
            <div style={{ display: "flex", gap: "1.8rem", alignItems: "center" }}>
              {links.map(l => (
                <button key={l} onClick={() => scrollTo(l)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14, fontFamily: "inherit", letterSpacing: 0.5, fontWeight: 500, transition: "color 0.2s", padding: "4px 0" }}
                  onMouseEnter={e => e.target.style.color = "#63b3ed"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>{l}</button>
              ))}
              <button onClick={() => scrollTo("Contact")} style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", border: "none", color: "white", padding: "9px 22px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, transition: "opacity 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Get Started
              </button>
            </div>
          )}
          {/* Hamburger */}
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#63b3ed", cursor: "pointer", fontSize: 20, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {menuOpen ? "✕" : "☰"}
            </button>
          )}
        </div>
        {/* Mobile menu */}
        {isMobile && menuOpen && (
          <div style={{ background: "rgba(5,5,20,0.97)", borderTop: "1px solid rgba(99,179,237,0.1)", padding: "1rem 1.5rem 1.5rem" }}>
            {links.map(l => (
              <div key={l} onClick={() => scrollTo(l)} style={{ padding: "13px 0", color: "#cbd5e1", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 15, fontWeight: 500 }}>{l}</div>
            ))}
            <button onClick={() => scrollTo("Contact")} style={{ marginTop: "1rem", width: "100%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", border: "none", color: "white", padding: "13px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 15 }}>
              Get Started 🚀
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// HERO
// ────────────────────────────────────────────────────────────────────────────
function Hero() {
  const isMobile = useIsMobile();
  return (
    <section id="hero" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", paddingTop: 80, paddingBottom: 40 }}>
      {/* Glow orbs */}
      <div style={{ position: "absolute", width: isMobile ? 300 : 560, height: isMobile ? 300 : 560, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.13) 0%,transparent 70%)", top: "5%", left: "-8%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: isMobile ? 250 : 440, height: isMobile ? 250 : 440, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)", bottom: "5%", right: "-5%", pointerEvents: "none" }} />

      <div style={{ textAlign: "center", maxWidth: 860, padding: "0 1.2rem", position: "relative", zIndex: 1, width: "100%" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 100, padding: "6px 16px", marginBottom: "1.8rem", fontSize: 12, color: "#63b3ed", letterSpacing: 1 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
          NOW AVAILABLE FOR PROJECTS
        </div>

        <h1 style={{ fontSize: "clamp(1.9rem, 5vw, 3.8rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.2rem", fontFamily: "'Space Grotesk', sans-serif" }}>
          Transforming Business Ideas Into<br />
          <span style={{ background: "linear-gradient(135deg,#63b3ed,#8b5cf6,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Powerful Digital Solutions
          </span>
        </h1>

        <div style={{ fontSize: "clamp(0.95rem, 2vw, 1.15rem)", color: "#94a3b8", marginBottom: "2rem", lineHeight: 1.7, minHeight: 52 }}>
          We build{" "}
          <TypingText texts={["Custom Applications", "AI Automations", "Modern Websites", "AI Video Content", "Business Solutions"]} />
          <br />A young team of experienced professionals delivering innovative, high-quality technology solutions with speed, reliability, and a customer-first approach.
        </div>

        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { label: "Get Started 🚀", grad: "linear-gradient(135deg,#3b82f6,#8b5cf6)", href: "contact" },
            { label: "View Our Work", grad: "transparent", border: "1px solid rgba(99,179,237,0.4)", color: "#63b3ed", href: "portfolio" },
            { label: "Contact Us", grad: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", href: "contact" },
          ].map(btn => (
            <button key={btn.label} onClick={() => document.getElementById(btn.href)?.scrollIntoView({ behavior: "smooth" })}
              style={{ background: btn.grad, border: btn.border || "none", color: btn.color || "white", padding: "13px 26px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(59,130,246,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "1rem", marginTop: "3.5rem", maxWidth: 600, margin: "3.5rem auto 0" }}>
          {[ { v: 5, s: "+", l: "Years Exp" }, { v: 100, s: "%", l: "Satisfaction" }].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "0.9rem 0.5rem", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#63b3ed,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                <Counter end={s.v} suffix={s.s} />
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SERVICES
// ────────────────────────────────────────────────────────────────────────────
const SERVICES_DATA = [
  { icon: "⚙️", title: "Custom Application Development", stars: 5, items: ["Java & Spring Boot", "REST APIs & Microservices", "Backend Architecture", "Database Design", "AWS Deployment"], clients: "Startups · SMEs · Enterprises", color: "#3b82f6" },
  { icon: "🌐", title: "Website Development", stars: 5, items: ["Business Websites", "Portfolio Websites", "Landing Pages", "E-Commerce Platforms"], clients: "All Business Sizes", color: "#8b5cf6" },
  { icon: "🤖", title: "AI & Business Automation", stars: 5, items: ["WhatsApp Automation", "AI Chatbots", "Lead Management", "Appointment Booking"], clients: "Growing Businesses", color: "#06b6d4" },
  { icon: "📍", title: "Google Business & Local SEO", stars: 4, items: ["Profile Setup & Optimization", "Review Management", "Local SEO Strategy", "Visibility Boost"], clients: "Local Businesses", color: "#f97316" },
];

function Services() {
  return (
    <section id="services" style={{ padding: "5rem 1.2rem", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader eyebrow="What We Do" title="Our" highlight="Services" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "1.2rem" }}>
          {SERVICES_DATA.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <GlassCard>
                <div style={{ fontSize: 38, marginBottom: 14 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 6, lineHeight: 1.35 }}>{s.title}</div>
                <div style={{ color: "gold", fontSize: 13, marginBottom: 12 }}>{"★".repeat(s.stars)}{"☆".repeat(5 - s.stars)}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px", color: "#94a3b8", fontSize: 13.5 }}>
                  {s.items.map(item => (
                    <li key={item} style={{ padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: s.color, fontSize: 9 }}>◆</span>{item}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: 11, color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, letterSpacing: 0.3 }}>{s.clients}</div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// AI MEDIA
// ────────────────────────────────────────────────────────────────────────────
const AI_ITEMS = [
  { icon: "🎬", label: "AI Realistic Video Generation" },
  { icon: "🖼️", label: "AI Image Generation" },
  { icon: "🛍️", label: "AI Product Visualization" },
  { icon: "📱", label: "AI Social Media Creatives" },
  { icon: "📢", label: "AI Promotional Videos" },
  { icon: "🧑‍💻", label: "AI Avatars & Talking Characters" },
  { icon: "📣", label: "AI Marketing Content" },
  { icon: "🎥", label: "Cinematic Business Videos" },
];

function AiMedia() {
  return (
    <section id="ai-media" style={{ padding: "5rem 1.2rem", position: "relative", zIndex: 1, background: "linear-gradient(180deg,transparent,rgba(139,92,246,0.04) 50%,transparent)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader eyebrow="Creative AI" title="AI Video &" highlight="Image Generation ⭐⭐⭐⭐⭐" gradient="135deg,#8b5cf6,#f97316"
          subtitle="Cinematic AI-generated videos, realistic visuals, promotional content, AI avatars, and futuristic business storytelling." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem" }}>
          {AI_ITEMS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: "1.2rem 1rem", display: "flex", alignItems: "center", gap: 12, transition: "all 0.3s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)"; e.currentTarget.style.transform = "scale(1)"; }}>
                <span style={{ fontSize: 26 }}>{s.icon}</span>
                <span style={{ color: "#cbd5e1", fontSize: 13.5, fontWeight: 500 }}>{s.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// TECH STACK
// ────────────────────────────────────────────────────────────────────────────
const TECHS = [
  { name: "Java", color: "#f97316", emoji: "☕" }, { name: "Spring Boot", color: "#22c55e", emoji: "🍃" },
  { name: "React", color: "#63b3ed", emoji: "⚛️" }, { name: "Next.js", color: "#e2e8f0", emoji: "▲" },
  { name: "Node.js", color: "#86efac", emoji: "🟢" }, { name: "AWS", color: "#f59e0b", emoji: "☁️" },
  { name: "Docker", color: "#3b82f6", emoji: "🐳" }, { name: "MongoDB", color: "#22c55e", emoji: "🗄️" },
  { name: "MySQL", color: "#06b6d4", emoji: "💾" }, { name: "OpenAI", color: "#10b981", emoji: "🤖" },
  { name: "Python", color: "#facc15", emoji: "🐍" }, { name: "TensorFlow", color: "#f97316", emoji: "🧠" },
];

function TechStack() {
  const [offset, setOffset] = useState(0);
  const cardW = 130;
  const total = TECHS.length * cardW;
  useEffect(() => {
    const t = setInterval(() => setOffset(o => (o + 0.5) % total), 20);
    return () => clearInterval(t);
  }, [total]);
  return (
    <section style={{ padding: "5rem 0", overflow: "hidden", position: "relative", zIndex: 1 }}>
      <div style={{ textAlign: "center", marginBottom: "3rem", padding: "0 1.2rem" }}>
        <SectionHeader eyebrow="Our Arsenal" title="Technology" highlight="Stack" gradient="135deg,#63b3ed,#22c55e" />
      </div>
      <div style={{ display: "flex", gap: "1rem", transform: `translateX(-${offset}px)`, willChange: "transform" }}>
        {[...TECHS, ...TECHS, ...TECHS].map((t, i) => (
          <div key={i} style={{ minWidth: 118, background: "rgba(255,255,255,0.04)", border: `1px solid ${t.color}25`, borderRadius: 12, padding: "1rem 0.5rem", textAlign: "center", flexShrink: 0, transition: "box-shadow 0.3s, transform 0.3s", cursor: "default" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 18px ${t.color}55`; e.currentTarget.style.transform = "scale(1.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}>
            <div style={{ fontSize: 28 }}>{t.emoji}</div>
            <div style={{ color: t.color, fontSize: 12, fontWeight: 600, marginTop: 6 }}>{t.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// PORTFOLIO
// ────────────────────────────────────────────────────────────────────────────
const PROJECTS = [
  { title: "Telecom IVR Platform", desc: "Enterprise AI-powered IVR handling millions of daily calls for a major telecom operator.", tags: ["Java", "Spring Boot", "Cisco CVP"], cat: "Enterprise Telecom", gradient: "135deg,#3b82f6,#1d4ed8", emoji: "📞" },
  { title: "E-Commerce Platform", desc: "Full-stack store with real-time inventory, AI recommendations, and integrated payments.", tags: ["React", "Node.js", "MongoDB"], cat: "Retail", gradient: "135deg,#8b5cf6,#6d28d9", emoji: "🛒" },
  { title: "AI WhatsApp Bot", desc: "Automated lead capture and 24/7 customer support bot with CRM integration.", tags: ["Python", "OpenAI", "WhatsApp API"], cat: "AI Automation", gradient: "135deg,#06b6d4,#0891b2", emoji: "💬" },
  { title: "Healthcare Appointments", desc: "Real-time scheduling with SMS reminders, doctor portals, and live analytics.", tags: ["React", "Spring Boot", "MySQL"], cat: "Healthcare", gradient: "135deg,#22c55e,#15803d", emoji: "🏥" },
  { title: "AI Video Marketing Suite", desc: "Cinematic AI-generated promotional videos, product visuals, and social creatives.", tags: ["AI", "Video Gen", "Runway ML"], cat: "AI Media", gradient: "135deg,#f97316,#c2410c", emoji: "🎬" },
  { title: "Business Analytics Dashboard", desc: "Real-time BI with predictive analytics, KPI tracking, and automated reports.", tags: ["React", "AWS", "Python"], cat: "Analytics", gradient: "135deg,#ec4899,#9d174d", emoji: "📊" },
];

function Portfolio() {
  return (
    <section id="portfolio" style={{ padding: "5rem 1.2rem", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader eyebrow="Our Work" title="Projects We've" highlight="Delivered" gradient="135deg,#f97316,#8b5cf6" color="#f97316" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: "1.2rem" }}>
          {PROJECTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.07}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", transition: "all 0.3s", cursor: "pointer", height: "100%" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-7px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ height: 150, background: `linear-gradient(${p.gradient})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
                  <span style={{ position: "relative", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}>{p.emoji}</span>
                </div>
                <div style={{ padding: "1.3rem" }}>
                  <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>{p.cat}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "white", marginBottom: 7, lineHeight: 1.3 }}>{p.title}</h3>
                  <p style={{ color: "#94a3b8", fontSize: 13.5, lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                    {p.tags.map(t => (
                      <span key={t} style={{ background: "rgba(99,179,237,0.1)", border: "1px solid rgba(99,179,237,0.2)", borderRadius: 6, padding: "2px 9px", fontSize: 11, color: "#63b3ed" }}>{t}</span>
                    ))}
                  </div>
                  <button style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", border: "none", color: "white", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>
                    View Project →
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// WHY CHOOSE US
// ────────────────────────────────────────────────────────────────────────────
const WHY = [
  { icon: "⚡", title: "Fast Delivery", desc: "Sprint-based delivery with clear milestones. Most MVPs launched in 4–8 weeks." },
  { icon: "📈", title: "Scalable Architecture", desc: "Built to handle millions of users. Cloud-ready microservices from day one." },
  { icon: "🧠", title: "AI-Driven Solutions", desc: "Every product we build can leverage AI to automate, predict, and personalize." },
  { icon: "🔒", title: "Secure Systems", desc: "Security-first engineering. Encrypted data, compliant APIs, zero-trust design." },
  { icon: "✨", title: "Modern UI/UX", desc: "Award-worthy interfaces that convert visitors into loyal customers." },
  { icon: "☁️", title: "Cloud-Ready Apps", desc: "AWS, Docker, CI/CD pipelines — enterprise-grade infra for any scale." },
  { icon: "🔍", title: "SEO Optimized", desc: "Performance-tuned, semantically structured, ranking-ready from launch." },
  { icon: "🤝", title: "End-to-End Support", desc: "We stay with you post-launch — monitoring, updates, and feature growth." },
];

function WhyUs() {
  return (
    <section id="about" style={{ padding: "5rem 1.2rem", position: "relative", zIndex: 1, background: "linear-gradient(180deg,transparent,rgba(59,130,246,0.03) 50%,transparent)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader eyebrow="Why Fernix" title="Why" highlight="Choose Us" gradient="135deg,#22c55e,#63b3ed" color="#22c55e" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1.2rem" }}>
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.06}>
              <GlassCard>
                <div style={{ fontSize: 34, marginBottom: 10 }}>{w.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 7 }}>{w.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: 13.5, lineHeight: 1.65 }}>{w.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS
// ────────────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Rajesh Kumar", company: "RetailMax India", text: "Fernix built our entire e-commerce platform in 6 weeks. Sales went up 3x in the first month. Exceptional team!", rating: 5, avatar: "RK", color: "#3b82f6" },
  { name: "Priya Sharma", company: "HealthFirst Clinics", text: "Their appointment booking system saves us 2 hours daily. Clean code, great support, and truly professional.", rating: 5, avatar: "PS", color: "#8b5cf6" },
  { name: "Arjun Nair", company: "GrowthLab Digital", text: "The WhatsApp AI bot handles 80% of our customer queries automatically. ROI was visible in week 2.", rating: 5, avatar: "AN", color: "#06b6d4" },
  { name: "Sneha Patel", company: "FashionForward", text: "The AI product videos Fernix created went viral on Instagram. Cinematic quality at a fraction of agency cost.", rating: 5, avatar: "SP", color: "#f97316" },
];

function Testimonials() {
  const [active, setActive] = useState(0);
  useEffect(() => { const t = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 5000); return () => clearInterval(t); }, []);
  const t = TESTIMONIALS[active];
  return (
    <section style={{ padding: "5rem 1.2rem", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <SectionHeader eyebrow="Client Stories" title="What Our" highlight="Clients Say" gradient="135deg,#f59e0b,#f97316" color="#f59e0b" />
        <div key={active} style={{ animation: "fadeIn 0.5s ease" }}>
          <GlassCard style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
            <div style={{ fontSize: 22, color: "#f59e0b", marginBottom: "1.2rem" }}>{"★".repeat(t.rating)}</div>
            <p style={{ color: "#cbd5e1", fontSize: "clamp(0.95rem,2vw,1.1rem)", lineHeight: 1.8, marginBottom: "1.8rem", fontStyle: "italic" }}>
              "{t.text}"
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg,${t.color},${t.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: 15, flexShrink: 0 }}>{t.avatar}</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, color: "white", fontSize: 15 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{t.company}</div>
              </div>
            </div>
          </GlassCard>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "1.5rem" }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} style={{ width: i === active ? 22 : 8, height: 8, borderRadius: 4, background: i === active ? "#63b3ed" : "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// CONTACT — fully rebuilt, responsive
// ────────────────────────────────────────────────────────────────────────────
const SERVICE_OPTIONS = [
  "Custom Application Development",
  "Website Development",
  "AI & Business Automation",
  "Google Business & Local SEO",
  "AI Video & Image Generation",
  "Other / Not Sure Yet",
];


function Contact() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", service: "", desc: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("idle"); // idle | loading | sent | error

  const upd = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\+?[\d\s\-()]{8,15}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (!form.service) e.service = "Please select a service";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep("loading");
    const msg = encodeURIComponent(
      `🚀 *New Project Inquiry from Fernix Website*\n\n` +
      `👤 *Name:* ${form.name}\n` +
      `🏢 *Company:* ${form.company || "Not specified"}\n` +
      `📧 *Email:* ${form.email}\n` +
      `📱 *Phone:* ${form.phone}\n` +
      `🛠️ *Service Interested In:*\n${form.service}\n` +
      `📋 *Project Description:*\n${form.desc || "Not provided"}\n\n` +
      `Looking forward to connecting with your AI innovation team! 🤝`
    );
    setTimeout(() => {
      try {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
        setStep("sent");
      } catch {
        setStep("error");
      }
    }, 2200);
  };

  const inputBase = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,179,237,0.2)",
    borderRadius: 10, padding: "13px 15px", color: "white", fontFamily: "inherit", fontSize: 14,
    outline: "none", boxSizing: "border-box", transition: "border-color 0.25s, box-shadow 0.25s",
    appearance: "none",
  };
  const errStyle = { color: "#f87171", fontSize: 11, marginTop: 4 };
  const field = (k, placeholder, type = "text", extra = {}) => (
    <div>
      <input type={type} placeholder={placeholder} value={form[k]} onChange={upd(k)} style={{ ...inputBase, borderColor: errors[k] ? "rgba(248,113,113,0.5)" : "rgba(99,179,237,0.2)", ...extra }}
        onFocus={e => { e.target.style.borderColor = "rgba(99,179,237,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,179,237,0.08)"; }}
        onBlur={e => { e.target.style.borderColor = errors[k] ? "rgba(248,113,113,0.5)" : "rgba(99,179,237,0.2)"; e.target.style.boxShadow = "none"; }} />
      {errors[k] && <div style={errStyle}>⚠ {errors[k]}</div>}
    </div>
  );

  return (
    <section id="contact" style={{ padding: "5rem 1.2rem", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader eyebrow="Start a Project" title="Let's Build the" highlight="Future Together" gradient="135deg,#8b5cf6,#63b3ed" color="#8b5cf6"
          subtitle="Tell us about your project and our team will reach out within 2 hours via WhatsApp." />

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: "2.5rem", alignItems: "start" }}>

          {/* ── Left panel ── */}
          <Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Orb + counters */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, padding: "2rem", textAlign: "center" }}>
                <div style={{ width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.5) 0%,rgba(59,130,246,0.2) 60%,transparent 80%)", margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, animation: "float 4s ease-in-out infinite" }}>
                  🤖
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                  {[{ v: 50, s: "+", l: "Projects Delivered" }, { v: 30, s: "+", l: "Happy Clients" }, { v: 5, s: "+", l: "Years Experience" }, { v: 15, s: "+", l: "AI Solutions" }].map(s => (
                    <div key={s.l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.9rem 0.5rem" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#8b5cf6,#63b3ed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        <Counter end={s.v} suffix={s.s} />
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact info cards */}
              {[
                { icon: "💬", label: "WhatsApp", val: "+91 8807240999", color: "#22c55e", href: `https://wa.me/${WHATSAPP_NUMBER}` },
                { icon: "📧", label: "Email", val: "fernixtechnologies@gmail.com", color: "#63b3ed", href: "mailto:fernixtechnologies@gmail.com" },
                { icon: "📍", label: "Location", val: "India, Chennai", color: "#f97316", href: "https://maps.app.goo.gl/VPksUBjgx2JSjAb97?g_st=ac" },
                { icon: "💼", label: "LinkedIn", val: "Fernix Technologies", color: "#0ea5e9", href: "https://www.linkedin.com/company/fernix-technologies/" },
              ].map(c => (
                <a key={c.label} href={c.href || "#"} target={c.href && c.href !== "#" ? "_blank" : "_self"} rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}22`, borderRadius: 12, padding: "14px 16px", textDecoration: "none", transition: "all 0.25s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${c.color}14`; e.currentTarget.style.borderColor = `${c.color}55`; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = `${c.color}22`; e.currentTarget.style.transform = "translateX(0)"; }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{c.label}</div>
                    <div style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 500 }}>{c.val}</div>
                  </div>
                  <span style={{ marginLeft: "auto", color: c.color, fontSize: 16, opacity: 0.6 }}>→</span>
                </a>
              ))}
            </div>
          </Reveal>

          {/* ── Right: form ── */}
          <Reveal delay={0.12}>
            <GlassCard style={{ padding: "2rem" }}>
              {step === "sent" ? (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                  <div style={{ fontSize: 72, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🚀</div>
                  <h3 style={{ color: "#22c55e", fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Message Sent!</h3>
                  <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: 24 }}>WhatsApp opened with your inquiry. Our team will respond within 2 hours.</p>
                  <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => { setStep("idle"); setForm({ name: "", company: "", email: "", phone: "", service: "", desc: "" }); setErrors({}); }}
                      style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", border: "none", color: "white", padding: "11px 22px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14 }}>
                      Send Another Inquiry
                    </button>
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"
                      style={{ background: "#22c55e", border: "none", color: "white", padding: "11px 22px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      💬 Open WhatsApp
                    </a>
                  </div>
                </div>
              ) : step === "loading" ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <div style={{ fontSize: 60, marginBottom: 20, animation: "pulse 1s infinite" }}>🔗</div>
                  <div style={{ color: "#63b3ed", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>AI Connecting To Team...</div>
                  <div style={{ color: "#64748b", fontSize: 14 }}>Formatting your inquiry and opening WhatsApp</div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 20 }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#63b3ed", animation: `pulse 1.2s ${i * 0.2}s infinite` }} />)}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "white", marginBottom: 4 }}>Tell us about your project</div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                    {field("name", "Full Name *")}
                    {field("company", "Company / Brand Name")}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                    {field("email", "Email Address *", "email")}
                    {field("phone", "Phone / WhatsApp *", "tel")}
                  </div>

                  {/* Service dropdown */}
                  <div>
                    <select value={form.service} onChange={upd("service")}
                      style={{ ...inputBase, borderColor: errors.service ? "rgba(248,113,113,0.5)" : "rgba(99,179,237,0.2)", cursor: "pointer", color: form.service ? "white" : "#64748b" }}
                      onFocus={e => { e.target.style.borderColor = "rgba(99,179,237,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,179,237,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = errors.service ? "rgba(248,113,113,0.5)" : "rgba(99,179,237,0.2)"; e.target.style.boxShadow = "none"; }}>
                      <option value="" disabled style={{ background: "#0d0d24", color: "#64748b" }}>Select a Service *</option>
                      {SERVICE_OPTIONS.map(s => <option key={s} value={s} style={{ background: "#0d0d24", color: "white" }}>{s}</option>)}
                    </select>
                    {errors.service && <div style={errStyle}>⚠ {errors.service}</div>}
                  </div>

                  {/* Description */}
                  <div>
                    <textarea placeholder="Describe your project... (budget, timeline, features you need)" value={form.desc} onChange={upd("desc")} rows={4}
                      style={{ ...inputBase, resize: "vertical", minHeight: 100 }}
                      onFocus={e => { e.target.style.borderColor = "rgba(99,179,237,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,179,237,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(99,179,237,0.2)"; e.target.style.boxShadow = "none"; }} />
                  </div>

                  {/* Submit */}
                  <button onClick={handleSubmit}
                    style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", border: "none", color: "white", padding: "15px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 15, transition: "all 0.3s", boxShadow: "0 0 24px rgba(99,179,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(99,179,237,0.35)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(99,179,237,0.25)"; }}>
                    <span>💬</span> Connect With Our AI Team via WhatsApp
                  </button>

                  <p style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 4 }}>
                    🔒 Your information is private and will only be shared via WhatsApp
                  </p>
                </div>
              )}
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// FOOTER
// ────────────────────────────────────────────────────────────────────────────
function Footer() {
  const isMobile = useIsMobile();
  const footerLinks = {
    Company: ["About Us", "Services", "Portfolio", "Careers"],
    Services: ["App Development", "Website Dev", "AI Automation", "SEO & Google"],
    Connect: ["WhatsApp", "Email", "LinkedIn", "Instagram"],
  };
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "3.5rem 1.2rem 1.8rem", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? "2rem" : "2.5rem", marginBottom: "2.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
              <FernixLogo size={42} />
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: 3, background: "linear-gradient(90deg,#f97316,#63b3ed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FERNIX</div>
                <div style={{ fontSize: 8, letterSpacing: 4, color: "#475569" }}>TECHNOLOGIES</div>
              </div>
            </div>
            <p style={{ color: "#64748b", fontSize: 13.5, lineHeight: 1.75, maxWidth: 270 }}>
              We build intelligent digital experiences that transform business ideas into powerful, scalable solutions.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: "1.2rem" }}>
              {["💼", "📸", "▶️", "💬"].map((icon, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,179,237,0.1)"; e.currentTarget.style.borderColor = "rgba(99,179,237,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([heading, items]) => (
            <div key={heading}>
              <div style={{ color: "white", fontWeight: 700, marginBottom: "0.9rem", fontSize: 14 }}>{heading}</div>
              {items.map(item => (
                <div key={item} style={{ color: "#64748b", fontSize: 13.5, marginBottom: 8, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#63b3ed"} onMouseLeave={e => e.target.style.color = "#64748b"}>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ color: "#475569", fontSize: 12 }}>© 2025 Fernix Technologies. All rights reserved.</div>
          <div style={{ color: "#475569", fontSize: 12 }}>Built with ❤️ for visionary businesses</div>
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// APP
// ────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ background: "#050510", color: "white", minHeight: "100vh", fontFamily: "'Inter','Space Grotesk',system-ui,sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050510; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(#3b82f6,#8b5cf6); border-radius: 2px; }
        input::placeholder, textarea::placeholder { color: #475569; }
        select option { color: white; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.88)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <ParticleCanvas />
      <Nav />
      <Hero />
      <Services />
      <AiMedia />
      <TechStack />
      <Portfolio />
      <WhyUs />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}