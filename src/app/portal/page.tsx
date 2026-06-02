import Link from "next/link";
import Logo from "@/presentation/components/Logo";

export default function PortalLandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e8edf4",
        padding: "0 32px",
        height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Logo size={34} variant="full" />
        <Link
          href="/login"
          style={{
            fontSize: "13px", fontWeight: 600, color: "#64748b",
            textDecoration: "none", padding: "7px 16px", borderRadius: "8px",
            border: "1px solid #e2e8f0", background: "#fff", transition: "all 0.2s",
          }}
        >
          Staff Login →
        </Link>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #f0fdf4 100%)",
        padding: "80px 32px 72px",
        textAlign: "center",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "#eff6ff", color: "#2563eb",
          border: "1px solid #bfdbfe", borderRadius: "99px",
          padding: "5px 14px", fontSize: "12.5px", fontWeight: 700,
          marginBottom: "28px",
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          Now accepting online bookings
        </div>

        <h1 style={{
          fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 900, color: "#0f172a",
          margin: "0 0 20px", letterSpacing: "-1.5px", lineHeight: 1.1,
          maxWidth: "700px", marginLeft: "auto", marginRight: "auto",
        }}>
          Book Your Clinic{" "}
          <span style={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Appointment
          </span>
          {" "}Online
        </h1>

        <p style={{
          fontSize: "17px", color: "#475569", maxWidth: "520px",
          margin: "0 auto 36px", lineHeight: 1.7,
        }}>
          Fill in your details, choose a schedule, and get confirmed — all in under 3 minutes.
          No phone calls needed.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/portal/book"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "14px 32px", borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "#fff", fontWeight: 800, fontSize: "15px",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(59,130,246,0.4)",
              transition: "all 0.2s",
            }}
          >
            <svg fill="none" height="18" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="18">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Book Appointment Now
          </Link>
          <a
            href="#how-it-works"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "14px 28px", borderRadius: "12px",
              border: "1.5px solid #e2e8f0", background: "#fff",
              color: "#475569", fontWeight: 700, fontSize: "15px",
              textDecoration: "none", transition: "all 0.2s",
            }}
          >
            Learn more ↓
          </a>
        </div>

        {/* Trust badges */}
        <div style={{
          marginTop: "48px", display: "flex", gap: "28px",
          justifyContent: "center", flexWrap: "wrap",
        }}>
          {[
            { icon: "🔒", text: "Secure & Private" },
            { icon: "⚡", text: "Instant Confirmation" },
            { icon: "📱", text: "Mobile Friendly" },
          ].map((b) => (
            <div key={b.text} style={{
              display: "flex", alignItems: "center", gap: "7px",
              fontSize: "13.5px", color: "#64748b", fontWeight: 600,
            }}>
              <span style={{ fontSize: "16px" }}>{b.icon}</span>
              {b.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "80px 32px", background: "#fff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <div style={{
              fontSize: "12px", fontWeight: 800, color: "#3b82f6",
              textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px",
            }}>
              How It Works
            </div>
            <h2 style={{
              fontSize: "32px", fontWeight: 900, color: "#0f172a",
              margin: 0, letterSpacing: "-0.8px",
            }}>
              3 simple steps to your appointment
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
            {[
              {
                step: "01",
                title: "Fill Your Information",
                desc: "Enter your personal details — name, birthday, contact, and address.",
                color: "#3b82f6",
                bg: "#eff6ff",
                icon: (
                  <svg fill="none" height="28" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="28">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Choose a Schedule",
                desc: "Pick your preferred date, time slot, and appointment type.",
                color: "#8b5cf6",
                bg: "#faf5ff",
                icon: (
                  <svg fill="none" height="28" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="28">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01"/>
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Get Confirmed",
                desc: "Receive your booking reference instantly. Your appointment is set!",
                color: "#10b981",
                bg: "#f0fdf4",
                icon: (
                  <svg fill="none" height="28" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="28">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="M22 4 12 14.01l-3-3"/>
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  background: "#fafbff",
                  borderRadius: "16px",
                  padding: "28px 24px",
                  border: "1px solid #e8edf4",
                  position: "relative",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <div style={{
                  position: "absolute", top: "20px", right: "20px",
                  fontSize: "11px", fontWeight: 900, color: `${item.color}40`,
                  letterSpacing: "1px",
                }}>
                  {item.step}
                </div>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "14px",
                  background: item.bg, color: item.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "18px",
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  margin: "0 0 8px", fontSize: "16px", fontWeight: 800,
                  color: "#1e293b",
                }}>
                  {item.title}
                </h3>
                <p style={{
                  margin: 0, fontSize: "13.5px", color: "#64748b", lineHeight: 1.65,
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link
              href="/portal/book"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "14px 36px", borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "#fff", fontWeight: 800, fontSize: "15px",
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(59,130,246,0.35)",
                transition: "all 0.2s",
              }}
            >
              Start Booking →
            </Link>
          </div>
        </div>
      </section>

      {/* ── What to expect ────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 32px", background: "#f8fafc" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(135deg, #1e40af, #3b82f6)",
            borderRadius: "20px",
            padding: "48px",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "32px",
            flexWrap: "wrap",
          }}>
            <div>
              <h2 style={{ margin: "0 0 10px", fontSize: "26px", fontWeight: 900, letterSpacing: "-0.5px" }}>
                Ready to schedule your visit?
              </h2>
              <p style={{ margin: 0, fontSize: "14.5px", opacity: 0.85, lineHeight: 1.6 }}>
                It only takes a few minutes. Our team will be ready for you.
              </p>
            </div>
            <Link
              href="/portal/book"
              style={{
                flexShrink: 0,
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "13px 28px", borderRadius: "12px",
                background: "#fff", color: "#1d4ed8",
                fontWeight: 800, fontSize: "14px", textDecoration: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "all 0.2s",
              }}
            >
              Book Now →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        background: "#0f172a", color: "#94a3b8",
        padding: "32px", textAlign: "center",
        fontSize: "13px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <Logo size={26} variant="full" dark />
        </div>
        <div>© {new Date().getFullYear()} PatientCare. All rights reserved.</div>
        <div style={{ marginTop: "6px" }}>
          <Link href="/login" style={{ color: "#64748b", textDecoration: "none", fontSize: "12px" }}>
            Staff Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
