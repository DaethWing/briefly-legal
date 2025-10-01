import React, { useEffect, useRef, useState } from "react";

// PayPal config
const PAYPAL_CLIENT_ID = "AWvh-pVfzIMo3m0Ytldu84rILL-zeqqTvJZIsVJxERE5yD_bTh71I3iJ2NfRoac4BCz0ophJnMxN1fJC";
const PAYPAL_PRO_PLAN_ID = "P-6RK10973X0630022SNDOG65A";
const PAYPAL_TEAM_PLAN_ID = "P-2XM652161B094711GNDOHBBY";

// ✅ Your live Google Script endpoint
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbziMpbvbtR4XAatEhWvQ207BwIOnrAS0Mm7W_3-aBI9Zb8kuKO1w3JvetWAfJDhJmk5wQ/exec";

function loadPayPalScript(clientId) {
  return new Promise((resolve, reject) => {
    if (window.paypal) return resolve(window.paypal);
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.body.appendChild(script);
  });
}

export default function App() {
  const proRef = useRef(null);
  const teamRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [docText, setDocText] = useState("");
  const [template, setTemplate] = useState("Letter of Complaint");
  const [openFAQ, setOpenFAQ] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Smooth scrolling
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadPayPalScript(PAYPAL_CLIENT_ID).then((paypal) => {
      if (proRef.current) {
        paypal.Buttons({
          createSubscription: (_, actions) => actions.subscription.create({ plan_id: PAYPAL_PRO_PLAN_ID }),
          onApprove: (data) => alert("Pro subscription created: " + data.subscriptionID),
        }).render(proRef.current);
      }
      if (teamRef.current) {
        paypal.Buttons({
          createSubscription: (_, actions) => actions.subscription.create({ plan_id: PAYPAL_TEAM_PLAN_ID }),
          onApprove: (data) => alert("Team subscription created: " + data.subscriptionID),
        }).render(teamRef.current);
      }
    }).catch((e) => {
      console.error(e);
      alert("Could not load PayPal. Please refresh.");
    });
  }, []);

  async function handleSignup(e) {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Please enter name and email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === "Success") {
        alert("Signup successful — welcome!");
        setForm({ name: "", email: "" });
        setSignedUp(true);
        setModalOpen(false); // close modal after signup
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting. Try again later.");
    }
    setLoading(false);
  }

  function handleGenerateDoc() {
    if (!signedUp) {
      setModalOpen(true);
      return;
    }
    let starterText = "";
    if (template === "Letter of Complaint") {
      starterText = "To whom it may concern,\n\nI am writing to formally raise a complaint regarding...";
    } else if (template === "Employment Contract") {
      starterText = "This Employment Agreement is made between [Employer] and [Employee]...";
    } else if (template === "NDA") {
      starterText = "This Non-Disclosure Agreement (NDA) is entered into on [Date] between...";
    }
    setDocText(starterText);
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: "#222" }}>
      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 1000, background: "white", borderBottom: "1px solid #eee", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: "darkred", cursor: "pointer" }} onClick={() => scrollToSection("hero")}>
          Briefly Legal
        </div>
        <div style={{ display: "flex", gap: "20px", fontSize: "0.95rem" }}>
          <span style={{ cursor: "pointer" }} onClick={() => scrollToSection("features")}>Features</span>
          <span style={{ cursor: "pointer" }} onClick={() => scrollToSection("pricing")}>Pricing</span>
          <span style={{ cursor: "pointer" }} onClick={() => scrollToSection("faq")}>FAQ</span>
          <button onClick={() => setModalOpen(true)} style={{ background: "darkred", color: "white", border: "none", borderRadius: "6px", padding: "8px 16px", cursor: "pointer" }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" style={{ padding: "80px 20px", textAlign: "center", background: "#ffe5e5" }}>
        <h1 style={{ fontSize: "2.8rem", color: "darkred" }}>Generate Legal & Business Documents in Minutes</h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "650px", margin: "20px auto" }}>
          Professional templates at your fingertips. Save time, reduce costs, and move faster — no lawyer needed.
        </p>
        <button onClick={handleGenerateDoc} style={{ marginTop: "20px", padding: "14px 28px", background: "darkred", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer" }}>
          Try It Free
        </button>
        <p style={{ fontSize: "0.9rem", marginTop: "10px", color: "#444" }}>No credit card required</p>
      </section>

      {/* Trust Logos */}
      <section style={{ padding: "40px 20px", textAlign: "center", background: "#fff" }}>
        <p style={{ fontSize: "1rem", color: "#666" }}>Trusted by entrepreneurs, freelancers, and small businesses worldwide</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap", marginTop: "20px" }}>
          <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#999" }}>Forbes</span>
          <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#999" }}>Inc.</span>
          <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#999" }}>TechCrunch</span>
          <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#999" }}>Fast Company</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: "#fff0f0", padding: "60px 20px" }}>
        <h2 style={{ textAlign: "center", color: "darkred", fontSize: "2rem" }}>Features & Benefits</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: "30px", marginTop: "40px" }}>
          <div><strong>✔ Customizable Templates</strong><p>Edit before finalizing.</p></div>
          <div><strong>✔ Export & Print</strong><p>Copy or download instantly.</p></div>
          <div><strong>✔ Save Profiles</strong><p>Reuse sender/recipient data.</p></div>
          <div><strong>✔ Instant Preview</strong><p>Real-time formatting as you type.</p></div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "60px 20px" }}>
        <h2 style={{ textAlign: "center", color: "darkred", fontSize: "2rem" }}>Pricing</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: "30px", marginTop: "40px" }}>
          {/* Starter */}
          <div style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "28px", background: "#fff" }}>
            <h3>Starter (Free)</h3>
            <p>3 docs / month · Basic templates</p>
            <button onClick={() => setModalOpen(true)} style={{ marginTop: "12px", padding: "10px", background: "darkred", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              Join Free
            </button>
          </div>

          {/* Pro */}
          <div style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "28px", background: "#fff" }}>
            <h3>Pro ($9 / mo)</h3>
            <p>Unlimited docs · Full library · Saved profiles</p>
            <div ref={proRef} style={{ marginTop: "12px" }}></div>
          </div>

          {/* Team */}
          <div style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "28px", background: "#fff" }}>
            <h3>Team ($19 / mo)</h3>
            <p>3 users · Shared library · Priority support</p>
            <div ref={teamRef} style={{ marginTop: "12px" }}></div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "60px 20px", background: "#fff" }}>
        <h2 style={{ textAlign: "center", color: "darkred", fontSize: "2rem" }}>What Our Users Say</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: "30px", marginTop: "40px", maxWidth: "900px", marginLeft: "auto", marginRight: "auto" }}>
          <div style={{ border: "1px solid #eee", borderRadius: "10px", padding: "20px", background: "#fafafa" }}>
            <p>"Briefly Legal saved me hours when I needed an NDA fast. Super easy to use!"</p>
            <strong>- Alex M., Startup Founder</strong>
          </div>
          <div style={{ border: "1px solid #eee", borderRadius: "10px", padding: "20px", background: "#fafafa" }}>
            <p>"I love the templates. Professional, clear, and I didn’t need to hire a lawyer."</p>
            <strong>- Jamie L., Freelancer</strong>
          </div>
          <div style={{ border: "1px solid #eee", borderRadius: "10px", padding: "20px", background: "#fafafa" }}>
            <p>"Our small business runs smoother thanks to Briefly Legal. Highly recommended."</p>
            <strong>- Priya R., Business Owner</strong>
          </div>
        </div>
      </section>

      {/* Document Editor */}
      {signedUp && (
        <section style={{ padding: "60px 20px", background: "#fdfdfd" }}>
          <h2 style={{ textAlign: "center", color: "darkred" }}>Document Editor</h2>
          <p style={{ textAlign: "center" }}>Select a template, edit live, then copy or download.</p>
          <div style={{ marginTop: "30px", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
            <label>
              Template:
              <select value={template} onChange={(e) => setTemplate(e.target.value)} style={{ marginLeft: "10px" }}>
                <option>Letter of Complaint</option>
                <option>Employment Contract</option>
                <option>NDA</option>
              </select>
            </label>
            <button onClick={handleGenerateDoc} style={{ marginLeft: "15px", padding: "8px 16px" }}>Load</button>
            <textarea value={docText} onChange={(e) => setDocText(e.target.value)} style={{ width: "100%", height: "300px", marginTop: "20px", padding: "12px", border: "1px solid #ccc", borderRadius: "6px" }} />
            <button onClick={() => navigator.clipboard.writeText(docText)} style={{ marginTop: "12px", padding: "10px 20px", background: "darkred", color: "white", border: "none", borderRadius: "6px" }}>
              Copy to Clipboard
            </button>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" style={{ padding: "60px 20px", background: "#fff0f0" }}>
        <h2 style={{ textAlign: "center", color: "darkred", fontSize: "2rem" }}>Frequently Asked Questions</h2>
        <div style={{ maxWidth: "700px", margin: "40px auto" }}>
          {[
            { q: "Is this legal advice?", a: "No. Briefly Legal provides ready-made templates but does not replace professional legal advice." },
            { q: "Do I need a credit card for the free plan?", a: "No. The Starter plan is 100% free — no credit card required." },
            { q: "Can I cancel anytime?", a: "Yes, Pro and Team subscriptions can be canceled anytime in your PayPal account." },
            { q: "What formats are supported?", a: "Currently you can copy text directly or print. Future updates will add Word/PDF export." },
          ].map((item, idx) => (
            <div key={idx} style={{ marginBottom: "20px" }}>
              <button onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)} style={{ width: "100%", textAlign: "left", padding: "12px", border: "1px solid #ccc", borderRadius: "6px", background: "white", cursor: "pointer" }}>
                {item.q}
              </button>
              {openFAQ === idx && (
                <div style={{ padding: "12px", background: "#fff", border: "1px solid #eee", borderTop: "none" }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#f3f3f3", padding: "20px", textAlign: "center", marginTop: "40px", fontSize: "14px" }}>
        <a href="#">Terms</a> · <a href="#">Privacy</a> · <a href="#">Disclaimer</a><br />
        © {new Date().getFullYear()} Briefly Legal — This is not legal advice.
      </footer>

      {/* Signup Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }} onClick={() => setModalOpen(false)}>
          <div style={{ background: "white", padding: "30px", borderRadius: "10px", maxWidth: "400px", width: "90%", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px", textAlign: "center", color: "darkred" }}>Join Briefly Legal Free</h3>
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <button type="submit" disabled={loading} style={{ padding: "10px", background: "darkred", color: "white", border: "none", borderRadius: "6px" }}>
                {loading ? "Signing up..." : "Sign Up Free"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
