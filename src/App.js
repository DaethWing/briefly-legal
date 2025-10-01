import React, { useEffect, useRef, useState } from "react";

// PayPal config
const PAYPAL_CLIENT_ID = "AWvh-pVfzIMo3m0Ytldu84rILL-zeqqTvJZIsVJxERE5yD_bTh71I3iJ2NfRoac4BCz0ophJnMxN1fJC";
const PAYPAL_PRO_PLAN_ID = "P-6RK10973X0630022SNDOG65A";
const PAYPAL_TEAM_PLAN_ID = "P-2XM652161B094711GNDOHBBY";

// ✅ Your live working Google Script URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXY6m7cRGb9sMKJPUxW9R1-09fWfXX-iLpWredA7j1jsabQcLtIDmexMbjfuF8qm36/exec";

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
  const [modalSuccess, setModalSuccess] = useState(false);

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
        setForm({ name: "", email: "" });
        setSignedUp(true);
        setModalSuccess(true); // show success state
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
        <p style={{ fontSize: "0.9rem", marginTop: "10px", color: "#444" }}>Try the editor now — signup only required to save/export</p>
      </section>

      {/* Document Editor (open to all, but gated features) */}
      <section style={{ padding: "60px 20px", background: "#fdfdfd" }}>
        <h2 style={{ textAlign: "center", color: "darkred" }}>Document Editor</h2>
        <p style={{ textAlign: "center" }}>Select a template, try editing it live. Signup required to copy/export.</p>
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
          {signedUp ? (
            <button onClick={() => navigator.clipboard.writeText(docText)} style={{ marginTop: "12px", padding: "10px 20px", background: "darkred", color: "white", border: "none", borderRadius: "6px" }}>
              Copy to Clipboard
            </button>
          ) : (
            <button onClick={() => setModalOpen(true)} style={{ marginTop: "12px", padding: "10px 20px", background: "gray", color: "white", border: "none", borderRadius: "6px" }}>
              Sign Up to Copy/Export
            </button>
          )}
        </div>
      </section>

      {/* Signup Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }} onClick={() => setModalOpen(false)}>
          <div style={{ background: "white", padding: "30px", borderRadius: "10px", maxWidth: "400px", width: "90%", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            {!modalSuccess ? (
              <>
                <h3 style={{ marginBottom: "20px", textAlign: "center", color: "darkred" }}>Join Briefly Legal Free</h3>
                <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <input type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  <button type="submit" disabled={loading} style={{ padding: "10px", background: "darkred", color: "white", border: "none", borderRadius: "6px" }}>
                    {loading ? "Signing up..." : "Sign Up Free"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <h3 style={{ color: "darkred" }}>✅ Signup Successful!</h3>
                <p>Thanks for joining Briefly Legal. You can now save and export documents.</p>
                <button onClick={() => setModalOpen(false)} style={{ marginTop: "20px", padding: "10px 20px", background: "darkred", color: "white", border: "none", borderRadius: "6px" }}>
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
