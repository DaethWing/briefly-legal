import React, { useEffect, useRef, useState } from "react";

// PayPal config
const PAYPAL_CLIENT_ID = "AWvh-pVfzIMo3m0Ytldu84rILL-zeqqTvJZIsVJxERE5yD_bTh71I3iJ2NfRoac4BCz0ophJnMxN1fJC";
const PAYPAL_PRO_PLAN_ID = "P-6RK10973X0630022SNDOG65A";
const PAYPAL_TEAM_PLAN_ID = "P-2XM652161B094711GNDOHBBY";

// Your Google Script /exec endpoint
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwx1JlxJFlWe3uDYHYZ75xkgqCEPNw5nFvA-i25B7SpwIK_NRN2_b3k4xs8k_moPA2v4A/exec";

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
      const text = await res.text();
      if (text.includes("Success")) {
        alert("Signup successful — we got your info!");
        setForm({ name: "", email: "" });
      } else {
        alert("Unexpected response: " + text);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting. Try again later.");
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: "#222", padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'darkred' }}>Briefly Legal</h1>
        <p>Generate legal & business documents in minutes — no lawyer needed.</p>
      </header>

      <section style={{ display: 'grid', gap: '24px' }}>
        {/* Starter Form */}
        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '24px' }}>
          <h2>Starter (Free)</h2>
          <p>3 docs per month, limited templates</p>
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up Free"}
            </button>
          </form>
        </div>

        {/* Pro */}
        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '24px' }}>
          <h2>Pro ($9 / mo)</h2>
          <p>Unlimited documents, full template library, saved profiles</p>
          <div ref={proRef} style={{ marginTop: '12px' }}></div>
        </div>

        {/* Team */}
        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '24px' }}>
          <h2>Team ($19 / mo)</h2>
          <p>3 users, shared library, priority support</p>
          <div ref={teamRef} style={{ marginTop: '12px' }}></div>
        </div>
      </section>

      <footer style={{ marginTop: '40px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
        <a href="#">Terms</a> · <a href="#">Privacy</a> · <a href="#">Disclaimer</a><br />
        © {new Date().getFullYear()} Briefly Legal — This is not legal advice.
      </footer>
    </div>
  );
}
