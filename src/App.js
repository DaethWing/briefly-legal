"use client";

import { useState } from "react";
import Script from "next/script";

export default function Home() {
  const [tier, setTier] = useState("Free");
  const [category, setCategory] = useState("Business");
  const [template, setTemplate] = useState("");
  const [doc, setDoc] = useState("");
  const [company, setCompany] = useState("");
  const [audience, setAudience] = useState("");
  const [goals, setGoals] = useState("");

  const LIBRARY = {
    Business: ["SOP", "Policy", "Project Brief", "Job Description"],
    Legal: ["NDA (Mutual)", "Residential Lease", "Last Will and Testament", "Bill of Sale (General)"],
  };

  function generate() {
    if (category === "Legal" && tier === "Free") {
      alert("Upgrade to Pro to use legal templates!");
      return;
    }
    setDoc(`# ${template}\nCompany: ${company}\nAudience: ${audience}\nGoals: ${goals}\n...`);
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", background: "#0b1020", color: "#fff", minHeight: "100vh" }}>
      {/* PayPal SDK */}
      <Script
        src="https://www.paypal.com/sdk/js?client-id=AWvh-pVfzIMo3m0Ytldu84rILL-zeqqTvJZIsVJxERE5yD_bTh71I3iJ2NfRoac4BCz0ophJnMxN1fJC&vault=true&intent=subscription"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.paypal) {
            window.paypal.Buttons({
              createSubscription: (d, a) => a.subscription.create({ plan_id: "P-6RK10973X0630022SNDOG65A" }),
              onApprove: () => { setTier("Pro"); localStorage.setItem("tier", "Pro"); },
            }).render("#paypal-pro");

            window.paypal.Buttons({
              createSubscription: (d, a) => a.subscription.create({ plan_id: "P-2XM652161B094711GNDOHBBY" }),
              onApprove: () => { setTier("Team"); localStorage.setItem("tier", "Team"); },
            }).render("#paypal-team");
          }
        }}
      />

      <h1>All-in-One DocGen</h1>
      <p>Current Tier: {tier}</p>
      <div style={{ display: "flex", gap: "10px" }}>
        <div id="paypal-pro"></div>
        <div id="paypal-team"></div>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h2>Create a Document</h2>
      <label>Category</label>
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option>Business</option>
        <option>Legal</option>
      </select>

      <label>Template</label>
      <select value={template} onChange={e => setTemplate(e.target.value)}>
        <option value="">Select template</option>
        {LIBRARY[category].map(t => <option key={t}>{t}</option>)}
      </select>

      <label>Company</label>
      <input value={company} onChange={e => setCompany(e.target.value)} />

      <label>Audience/Parties</label>
      <input value={audience} onChange={e => setAudience(e.target.value)} />

      <label>Goals</label>
      <textarea value={goals} onChange={e => setGoals(e.target.value)} />

      <button onClick={generate} style={{ marginTop: "10px", padding: "10px", background: "#2a6bff", color: "#fff", border: "none" }}>
        Generate
      </button>

      {doc && (
        <pre style={{ whiteSpace: "pre-wrap", background: "#111", padding: "14px", marginTop: "14px", borderRadius: "8px" }}>
          {doc}
        </pre>
      )}
    </div>
  );
}
