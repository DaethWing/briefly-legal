"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // ===== STATE =====
  const [tier, setTier] = useState("Free");
  const [category, setCategory] = useState("Business");
  const [template, setTemplate] = useState("");
  const [doc, setDoc] = useState("");
  const [company, setCompany] = useState("");
  const [audience, setAudience] = useState("");
  const [goals, setGoals] = useState("");
  const [tone, setTone] = useState("Professional");
  const [clauses, setClauses] = useState([]);

  // ===== LIBRARY =====
  const LIBRARY = {
    Business: [
      "Standard Operating Procedure (SOP)","Policy","Employee Handbook Section","Project Brief","Job Description",
      "Contract Draft","Meeting Agenda","Onboarding Checklist","Marketing Brief","Content Style Guide",
      "Incident Report","Customer Support Playbook","Sales Playbook Page","Security Policy","Expense Policy"
    ],
    Legal: [
      "NDA (Mutual)","NDA (Unilateral)","Residential Lease","Commercial Lease","Employment Agreement",
      "LLC Operating Agreement","Last Will and Testament","Power of Attorney","Privacy Policy","Terms of Service",
      "Data Processing Addendum (DPA)","Promissory Note","Bill of Sale (General)","Vehicle Bill of Sale",
      "Consulting Agreement","SaaS Agreement"
    ]
  };

  const CLAUSE_LIBRARY = [
    "Governing Law","Arbitration","Severability","Entire Agreement","Notices","Force Majeure",
    "IP Ownership","License Grant","Non-Solicitation","Confidentiality","Indemnification","Limitation of Liability"
  ];

  // ===== PAYPAL =====
  useEffect(() => {
    const stored = localStorage.getItem("tier") || "Free";
    setTier(stored);

    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=AWvh-pVfzIMo3m0Ytldu84rILL-zeqqTvJZIsVJxERE5yD_bTh71I3iJ2NfRoac4BCz0ophJnMxN1fJC&vault=true&intent=subscription";
    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          createSubscription: (d, a) =>
            a.subscription.create({ plan_id: "P-6RK10973X0630022SNDOG65A" }),
          onApprove: () => {
            setTier("Pro");
            localStorage.setItem("tier", "Pro");
          },
        }).render("#paypal-pro");

        window.paypal.Buttons({
          createSubscription: (d, a) =>
            a.subscription.create({ plan_id: "P-2XM652161B094711GNDOHBBY" }),
          onApprove: () => {
            setTier("Team");
            localStorage.setItem("tier", "Team");
          },
        }).render("#paypal-team");
      }
    };
    document.body.appendChild(script);
  }, []);

  // ===== GENERATOR =====
  function generateDoc() {
    if (category === "Legal" && tier === "Free") {
      alert("Upgrade to Pro for legal templates!");
      return;
    }
    let content = "";

    switch (template) {
      case "NDA (Mutual)":
        content = `# NDA (Mutual)
**Parties:** ${audience}
**Company:** ${company}
**Purpose:** ${goals}

1. Confidential Information
2. Obligations
3. Exclusions
4. Term
5. Remedies

${clauseText()}`;
        break;

      case "Residential Lease":
        content = `# Residential Lease
**Landlord & Tenant:** ${audience}
**Company:** ${company}
**Tone:** ${tone}

1. Premises & Term
2. Rent & Deposits
3. Utilities
4. Maintenance
5. Use & Occupancy
6. Default
7. Termination

${clauseText()}`;
        break;

      case "LLC Operating Agreement":
        content = `# LLC Operating Agreement
**Company:** ${company}
**Members:** ${audience}
**Tone:** ${tone}

1. Formation & Purpose
2. Members & Capital
3. Allocations & Distributions
4. Management
5. Transfers & Buy-Outs
6. Records & Accounting
7. Dissolution

${clauseText()}`;
        break;

      default:
        content = `# ${template}
**Company:** ${company}
**Audience/Parties:** ${audience}
**Tone:** ${tone}

Purpose: ${goals}

${clauseText()}`;
    }

    setDoc(content);
  }

  function clauseText() {
    if (tier === "Pro" || tier === "Team") {
      return (
        "\n## Clause Pack\n" +
        clauses.map((c, i) => `${i + 1}. ${c}`).join("\n")
      );
    }
    return "";
  }

  function copyDoc() {
    navigator.clipboard.writeText(doc);
    alert("Copied to clipboard!");
  }

  function downloadDoc() {
    const blob = new Blob([doc], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "document.md";
    a.click();
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#e9eefc", background: "#0b1020", minHeight: "100vh" }}>
      <div style={{ background: "#131a2b", padding: "16px", borderRadius: "10px", marginBottom: "20px" }}>
        <h1>All-in-One DocGen</h1>
        <p>Current Tier: <strong>{tier}</strong></p>
        <div style={{ display: "flex", gap: "10px" }}>
          <div id="paypal-pro"></div>
          <div id="paypal-team"></div>
        </div>
      </div>

      <div style={{ background: "#131a2b", padding: "16px", borderRadius: "10px" }}>
        <h2>Create a Document</h2>

        <label>Category</label>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setTemplate(""); }}>
          <option>Business</option>
          <option>Legal</option>
        </select>

        <label>Template</label>
        <select value={template} onChange={(e) => setTemplate(e.target.value)}>
          <option value="">Select template</option>
          {LIBRARY[category].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label>Company</label>
        <input value={company} onChange={(e) => setCompany(e.target.value)} />

        <label>Audience/Parties</label>
        <input value={audience} onChange={(e) => setAudience(e.target.value)} />

        <label>Tone</label>
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option>Professional</option>
          <option>Friendly</option>
          <option>Formal</option>
          <option>Concise</option>
        </select>

        <label>Goals</label>
        <textarea value={goals} onChange={(e) => setGoals(e.target.value)} />

        {tier !== "Free" && (
          <>
            <h3>Clause Library</h3>
            {CLAUSE_LIBRARY.map((c) => (
              <label key={c} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  value={c}
                  checked={clauses.includes(c)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setClauses([...clauses, c]);
                    } else {
                      setClauses(clauses.filter((x) => x !== c));
                    }
                  }}
                />{" "}
                {c}
              </label>
            ))}
          </>
        )}

        <button onClick={generateDoc} style={{ marginTop: "10px", padding: "10px", background: "#2a6bff", border: "none", borderRadius: "8px", color: "white" }}>Generate</button>

        {doc && (
          <div>
            <pre style={{ whiteSpace: "pre-wrap", background: "#0f1627", padding: "14px", marginTop: "14px", borderRadius: "8px" }}>
              {doc}
            </pre>
            <button onClick={copyDoc} style={{ marginRight: "10px" }}>Copy</button>
            <button onClick={downloadDoc}>Download</button>
          </div>
        )}
      </div>
    </div>
  );
}
