/**
 * app.js — All-in-One Business + Legal Document Generator (No API keys)
 * --------------------------------------------------------------------
 * One file to paste & run with Node.js:
 *   npm install express body-parser sqlite3 sqlite
 *   node app.js
 *
 * Features:
 * - Free ($0), Pro ($9), Team ($19) with your PayPal plan IDs
 * - Combined catalog (Waybook-style Business + LegalTemplates-style categories)
 * - Built-in “AI-like” generator: rule-based structured drafting (NO external API)
 * - Team extras: saved docs + branding
 * - Entitlement stored in SQLite via webhook
 *
 * NOTE: Drafts are generated programmatically. For legal enforceability, have counsel review.
 */

import express from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// =============================
// CONFIG — YOUR PAYPAL DETAILS
// =============================
const CONFIG = {
  BRAND: "All-in-One DocGen",
  PORT: 3000,
  PAYPAL: {
    CLIENT_ID: "AWvh-pVfzIMo3m0Ytldu84rILL-zeqqTvJZIsVJxERE5yD_bTh71I3iJ2NfRoac4BCz0ophJnMxN1fJC",
    PRO_PLAN_ID: "P-6RK10973X0630022SNDOG65A",   // $9
    TEAM_PLAN_ID: "P-2XM652161B094711GNDOHBBY"    // $19
  }
};

// =============================
// DB: ENTITLEMENTS (SQLite)
// =============================
let db;
(async () => {
  db = await open({ filename: "./entitlements.db", driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, tier TEXT)`);
})();

// =============================
// APP
// =============================
const app = express();
app.use(bodyParser.json({ limit: "2mb" }));

// --- PayPal webhook (basic; add signature verification in production) ---
app.post("/paypal/webhook", async (req, res) => {
  try {
    const ev = req.body;
    const planId = ev?.resource?.plan_id;
    const email  = ev?.resource?.subscriber?.email_address || ev?.resource?.billing_info?.last_payment?.payer?.email_address;
    if (!email) return res.sendStatus(200);

    if (ev.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
      let tier = "Free";
      if (planId === CONFIG.PAYPAL.PRO_PLAN_ID) tier = "Pro";
      if (planId === CONFIG.PAYPAL.TEAM_PLAN_ID) tier = "Team";
      await db.run("INSERT OR REPLACE INTO users (email, tier) VALUES (?,?)", [email.toLowerCase(), tier]);
    }
    if (ev.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
      await db.run("INSERT OR REPLACE INTO users (email, tier) VALUES (?,?)", [email.toLowerCase(), "Free"]);
    }
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// --- Entitlement check ---
app.get("/entitlement", async (req, res) => {
  const email = (req.query.email || "").toLowerCase().trim();
  if (!email) return res.json({ tier: "Free" });
  const row = await db.get("SELECT tier FROM users WHERE email = ?", [email]);
  res.json({ tier: row?.tier || "Free" });
});

// --- Serve the SPA (frontend + generator logic) ---
app.get("/", (req, res) => {
  res.set("Content-Type", "text/html").send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${CONFIG.BRAND}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://www.paypal.com/sdk/js?client-id=${CONFIG.PAYPAL.CLIENT_ID}&vault=true&intent=subscription"></script>
  <style>
    :root{--bg:#0b1020;--card:#131a2b;--muted:#92a1bb;--accent:#7ca7ff}
    html,body{margin:0;background:var(--bg);color:#e9eefc;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
    .wrap{max-width:1140px;margin:30px auto;padding:0 16px}
    .card{background:#131a2b;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:16px;margin:0 0 16px}
    .header{display:flex;justify-content:space-between;align-items:center;gap:12px}
    .badge{display:inline-block;background:#112044;color:#b9cbff;border:1px solid #1f3a7a;border-radius:999px;padding:4px 10px;font-size:12px}
    h1{margin:6px 0 10px}
    .muted{color:var(--muted);font-size:12px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    label{display:block;color:var(--muted);font-size:13px;margin:6px 0}
    input,select,textarea{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:#0f1627;color:#e9eefc}
    textarea{min-height:110px;grid-column:1 / -1}
    .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
    .btn{cursor:pointer;border:1px solid rgba(255,255,255,.12);padding:10px 14px;border-radius:10px;background:#111a2e;color:#e9eefc;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
    .btn.primary{background:linear-gradient(180deg,#2a6bff,#234ed8);border-color:transparent}
    .doc{white-space:pre-wrap;background:#0f1627;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;margin-top:10px}
    .tierbox{display:flex;gap:10px;flex-wrap:wrap}
    .tier{flex:1 1 260px;background:#0e1730;border:1px dashed #28428f;padding:12px;border-radius:12px}
    .logo{max-height:28px}
    .saved-card{background:#0f1627;border:1px solid rgba(255,255,255,.08);padding:10px;border-radius:10px;margin:6px 0}
    .notice{font-size:12px;color:#b6c6ff;margin-top:6px}
    .pill{display:inline-block;background:#112044;color:#b9cbff;border:1px solid #1f3a7a;border-radius:999px;padding:4px 10px;font-size:12px}
  </style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <div>
        <span class="pill">Free preview • Pro ($9) • Team ($19)</span>
        <h1>${CONFIG.BRAND}</h1>
        <div class="muted">Waybook-style speed + LegalTemplates-style breadth — locally generated (no API).</div>
        <div class="muted">Current tier: <strong id="tierLabel">Free</strong></div>
      </div>
      <img id="brandLogo" class="logo" src="" alt="" />
    </div>
    <div class="tierbox">
      <div class="tier"><strong>Free</strong><br>Business templates. Preview, copy, download.</div>
      <div class="tier"><strong>Pro ($9)</strong><br>All business + legal templates, clause library.</div>
      <div class="tier"><strong>Team ($19)</strong><br>Everything in Pro + team library, saved docs, branding.</div>
    </div>
    <div class="actions" id="paypalRow">
      <div id="paypal-pro"></div>
      <div id="paypal-team"></div>
      <span class="muted">Subscribe to unlock higher tiers.</span>
    </div>
  </div>

  <div class="card">
    <h3 style="margin:6px 0">Create a Document</h3>
    <form id="genForm" class="grid">
      <div>
        <label>Category</label>
        <select name="category" id="categorySel"></select>
      </div>
      <div>
        <label>Template</label>
        <select name="docType" id="docType"></select>
      </div>

      <div>
        <label>Company</label>
        <input name="company" placeholder="Acme Co." />
      </div>
      <div>
        <label>Industry</label>
        <input name="industry" placeholder="SaaS, Retail, Manufacturing…" />
      </div>
      <div>
        <label>Audience/Parties</label>
        <input name="audience" placeholder="Ops team / Landlord & Tenant / Discloser & Recipient" />
      </div>
      <div>
        <label>Tone</label>
        <select name="tone">
          <option>Professional</option>
          <option>Friendly</option>
          <option>Formal</option>
          <option>Concise</option>
        </select>
      </div>

      <textarea name="goals" placeholder="Purpose, KPIs, special terms, timeline, governing law, deliverables…"></textarea>

      <div style="grid-column:1 / -1">
        <div id="clausesCard">
          <div style="display:flex;align-items:center;gap:8px;">
            <strong>Clause Library</strong>
            <span class="muted">(Pro/Team) Add extra clauses to legal docs</span>
          </div>
          <div class="grid" id="clauseGrid"></div>
        </div>
      </div>

      <div class="actions" style="grid-column:1 / -1">
        <button type="submit" class="btn primary">Generate</button>
        <button type="button" id="copyBtn" class="btn" disabled>Copy</button>
        <button type="button" id="downloadBtn" class="btn" disabled>Download .md</button>
        <button type="button" id="saveBtn" class="btn" style="display:none">Save (Team)</button>
        <span id="status" class="muted"></span>
      </div>
    </form>
    <div id="output" class="doc" style="display:none"></div>
    <div class="notice">Drafts are generated programmatically (no external AI). For legal enforceability, have a qualified attorney review your final document.</div>
  </div>

  <div class="card" id="teamCard" style="display:none">
    <h3 style="margin:6px 0">Team Library & Branding</h3>
    <div class="grid">
      <div>
        <label>Brand logo URL (appears in header)</label>
        <input id="brandUrl" placeholder="https://example.com/logo.png" />
        <div class="actions"><button id="brandSave" class="btn">Save Branding</button></div>
      </div>
      <div>
        <label>Saved Documents</label>
        <div id="savedList"></div>
      </div>
    </div>
  </div>
</div>

<script>
// =========================
// ENTITLEMENT (client)
// =========================
const Entitlement = {
  tier: "Free",
  async refresh(email) {
    try {
      const r = await fetch("/entitlement?email=" + encodeURIComponent(email||""));
      const j = await r.json();
      this.tier = j.tier || "Free";
    } catch { this.tier = "Free"; }
    document.getElementById("tierLabel").textContent = this.tier;
    document.getElementById("saveBtn").style.display = (this.tier === "Team") ? "" : "none";
    document.getElementById("teamCard").style.display = (this.tier === "Team") ? "" : "none";
    renderClauses();
    populateTemplates();
    renderSaved();
  },
  isPro() { return this.tier === "Pro" || this.tier === "Team"; },
  isTeam() { return this.tier === "Team"; }
};

// =========================
// CATALOG (Waybook + LegalTemplates style)
// Large coverage; add/remove titles as needed.
// =========================
const LIBRARY = {
  Business: [
    "Standard Operating Procedure (SOP)","Policy","Employee Handbook Section","Project Brief","Job Description",
    "Contract Draft","Meeting Agenda","Onboarding Checklist","Marketing Brief","Content Style Guide",
    "Incident Report","Customer Support Playbook","Quality Management Procedure","Sales Playbook Page",
    "Security Policy","Privacy Program Overview","Expense Policy","Travel Policy","Procurement Policy",
    "Vendor Onboarding SOP","Change Management SOP","Code of Conduct","Social Media Policy"
  ],
  Legal: {
    "Contracts & Commercial": [
      "NDA (Mutual)","NDA (Unilateral)","Confidentiality Agreement","Independent Contractor Agreement",
      "Consulting Agreement","Service Agreement","Master Services Agreement","Sales Agreement","Purchase Agreement",
      "Distribution Agreement","Referral Agreement","Affiliate Agreement","Licensing Agreement","SaaS Agreement",
      "Website Development Agreement","Maintenance Agreement","Manufacturing Agreement","Supply Agreement",
      "Joint Venture Agreement","Franchise Agreement","Commission Agreement","Consignment Agreement",
      "Statement of Work (SOW)","Change Order","Work Order",
      "Loan Agreement","Promissory Note","Security Agreement","Guaranty"
    ],
    "Corporate & Governance": [
      "LLC Operating Agreement","Partnership Agreement","Shareholders’ Agreement","Bylaws (Corporation)",
      "Board Consent","Action by Written Consent","Founders’ Agreement","Stock Purchase Agreement",
      "Stock Option Grant","Incorporator Statement","Minutes of Meeting","Director Consent",
      "Conflict of Interest Policy"
    ],
    "Employment": [
      "Employment Offer Letter","Employment Agreement","At-Will Employment Agreement",
      "Non-Compete Agreement","Non-Solicitation Agreement","Severance Agreement",
      "Employee NDA","Independent Sales Rep Agreement","Employee Handbook Acknowledgment",
      "IP Assignment (Employee)","Invention Assignment (Employee)"
    ],
    "Real Estate": [
      "Residential Lease","Month-to-Month Lease","Room Rental Agreement","Commercial Lease",
      "Sublease Agreement","Lease Amendment","Lease Termination Notice",
      "Rental Application","Rent Receipt","Eviction Notice","Notice to Vacate",
      "Property Purchase Agreement","Real Estate Assignment","Land Contract"
    ],
    "Estate & Family": [
      "Last Will and Testament","Living Will (Advance Directive)","Power of Attorney","Medical Power of Attorney",
      "HIPAA Authorization","Child Travel Consent","Prenuptial Agreement","Postnuptial Agreement",
      "Guardianship Nomination","Child Custody Agreement","Divorce Agreement","Separation Agreement"
    ],
    "Finance & Debt": [
      "Debt Settlement Agreement","Payment Plan Agreement","Demand for Payment","Debt Validation Letter",
      "Debt Acknowledgment","Release of Debt","Lien Release"
    ],
    "IP & Privacy": [
      "IP Assignment Agreement","Invention Assignment","DMCA Takedown Notice","Privacy Policy",
      "Terms of Service","Cookie Policy","Data Processing Addendum (DPA)","Acceptable Use Policy"
    ],
    "Vehicles & Property": [
      "Bill of Sale (General)","Vehicle Bill of Sale","Boat Bill of Sale","Motorcycle Bill of Sale",
      "ATV Bill of Sale","Trailer Bill of Sale","Equipment Bill of Sale","Quitclaim Deed","Warranty Deed"
    ],
    "Notices & Letters": [
      "Cease & Desist Letter","Notice of Intent to Sue","Contract Termination Letter","Employment Verification Letter",
      "Letter of Recommendation","Letter of Intent","Offer to Purchase Letter","Demand for Performance"
    ]
  }
};

// =========================
// CLAUSE LIBRARY (Pro/Team)
// =========================
const CLAUSE_LIBRARY = {
  general: ["Governing Law","Arbitration","Venue","Severability","Entire Agreement","Notices","Amendments","Assignment","Force Majeure"],
  ip: ["IP Ownership","License Grant","Work-Made-for-Hire","Open-Source Compliance"],
  risk: ["Warranty Disclaimer","Limitation of Liability","Indemnification","Insurance Requirements"],
  people: ["Confidentiality","Non-Disclosure","Non-Solicitation","Non-Compete (where permitted)"],
  privacy: ["Data Processing Addendum","GDPR/CCPA Disclosures","HIPAA Rider","FERPA Rider"]
};

// =========================
// UI ELEMENTS
// =========================
const categorySel = document.getElementById("categorySel");
const docTypeSel  = document.getElementById("docType");
const clauseGrid  = document.getElementById("clauseGrid");
const output      = document.getElementById("output");
const statusEl    = document.getElementById("status");
const copyBtn     = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const saveBtn     = document.getElementById("saveBtn");
const teamCard    = document.getElementById("teamCard");
const brandUrl    = document.getElementById("brandUrl");
const brandSave   = document.getElementById("brandSave");
const brandLogo   = document.getElementById("brandLogo");

let lastDoc = "";

// =========================
// HELPERS
// =========================
function cap(s){ return (s||"").charAt(0).toUpperCase()+ (s||"").slice(1); }
function bullet(items){ return (items||[]).map(x=>"- "+x).join("\\n"); }
function numbered(items){ return (items||[]).map((x,i)=>(i+1)+". "+x).join("\\n"); }
function hdr(i,legal=false){
  return [
    \`**Company:** \${i.company||"Your Company"}  \`,
    \`**Industry:** \${i.industry||"General"}  \`,
    \`\${legal? "**Parties:**":"**Audience/Parties:**"} \${i.audience|| (legal?"Define parties":"General")}  \`,
    \`**Tone:** \${i.tone||"Professional"}  \`
  ].join("\\n");
}
function stdClauses(picks, enabled){
  const chosen = enabled
    ? (picks?.length ? picks : ["Governing Law","Severability","Entire Agreement","Notices","Assignment","Force Majeure"])
    : [];
  if (!chosen.length) return "";
  return "## Clause Pack (Pro)\\n" + chosen.map((c, idx)=>\`**\${idx+1}. \${c}.** Standard \${c.toLowerCase()} language.\`).join("\\n");
}

// =========================
// TEMPLATE-SPECIFIC GENERATORS
// (High-value templates explicitly defined;
// everything else falls back to category-aware composers.)
// =========================
const TG = {
  "NDA (Mutual)": (i) => [
    hdr(i,true),
    "## Mutual Non-Disclosure Agreement",
    "### 1. Parties", i.audience || "Discloser and Recipient (each a “Party” and together the “Parties”).",
    "### 2. Purpose", i.goals || "Evaluate a potential business relationship and/or exchange of information necessary to do so.",
    "### 3. Confidential Information", "All nonpublic information disclosed by either Party, whether written, oral, or visual, including business plans, technical data, trade secrets, and financials.",
    "### 4. Exclusions", bullet(["Information already known without obligation of confidentiality","Information independently developed","Publicly available information","Information rightfully received from a third party"]),
    "### 5. Obligations", bullet(["Use only for the Purpose","Limit access to need-to-know","Protect with reasonable care","No reverse engineering or decompiling"]),
    "### 6. Term & Return", "Obligations survive for 3–5 years after disclosure; promptly return or destroy materials upon request.",
    "### 7. Remedies", "Injunctive relief for breach; all other remedies preserved.",
    "### 8. Miscellaneous", bullet(["No license granted","No waiver by course of dealing","Assignment only with consent","Governing law and venue"]),
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),

  "NDA (Unilateral)": (i) => [
    hdr(i,true),
    "## Unilateral Non-Disclosure Agreement",
    "### 1. Parties", i.audience || "Discloser and Recipient.",
    "### 2. Purpose", i.goals || "Evaluation of Discloser’s products/services, or other legitimate business purpose.",
    "### 3. Confidential Information", "All nonpublic information disclosed by Discloser.",
    "### 4. Recipient Obligations", bullet(["Maintain confidentiality","Use only for the Purpose","Restrict access to need-to-know personnel","No reverse engineering"]),
    "### 5. Exclusions", bullet(["Previously known","Independently developed","Public domain","Third-party source with rights"]),
    "### 6. Term & Return", "Obligations survive for 3–5 years; return or destroy upon request.",
    "### 7. Remedies", "Equitable relief and damages.",
    "### 8. Miscellaneous", bullet(["No license","Assignment restrictions","Governing law"]),
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),

  "Residential Lease": (i) => [
    hdr(i,true),
    "## Residential Lease Agreement",
    "### 1. Parties", i.audience || "Landlord and Tenant",
    "### 2. Premises", "Street address, unit, parking, storage.",
    "### 3. Term", "Fixed term (dates) or month-to-month.",
    "### 4. Rent & Deposits", bullet(["Monthly rent and due date","Security deposit amount and conditions","Late fees and returned payment fees"]),
    "### 5. Utilities & Services", "Responsibility for electricity, gas, water, trash, internet.",
    "### 6. Maintenance", "Tenant duties (cleanliness, minor repairs); Landlord duties (habitability).",
    "### 7. Use & Occupancy", "Maximum occupants; no unlawful use; pets and smoking rules.",
    "### 8. Entry", "Landlord entry upon prior notice or emergency.",
    "### 9. Default & Remedies", "Cure periods; eviction; fees.",
    "### 10. Termination & Move-Out", "Surrender condition; deposit return timeline.",
    "### 11. Miscellaneous", bullet(["Assignment/sublet rules","Governing law","Entire agreement"]),
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),

  "Commercial Lease": (i) => [
    hdr(i,true),
    "## Commercial Lease Agreement",
    "### 1. Parties & Premises", i.audience || "Landlord and Tenant; legal descriptions; common areas.",
    "### 2. Term & Possession", "Commencement date; early access; holdover.",
    "### 3. Base Rent & Additional Rent", bullet(["Base rent schedule","CAM/NNN charges","Percentage rent (if any)"]),
    "### 4. Use; Exclusivity", "Permitted use; exclusive use protection; compliance with laws.",
    "### 5. Improvements & Maintenance", "Build-out; repairs; ADA; signage.",
    "### 6. Insurance & Indemnity", "Commercial general liability; property; waivers of subrogation.",
    "### 7. Assignment & Subletting", "Landlord consent; recapture rights.",
    "### 8. Defaults & Remedies", "Cure periods; termination; damages.",
    "### 9. Miscellaneous", "Estoppel; SNDA; personal guaranty (if any).",
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),

  "Employment Agreement": (i) => [
    hdr(i,true),
    "## Employment Agreement",
    "### 1. Position & Duties", i.goals || "Title, responsibilities, reporting line, location (hybrid/remote).",
    "### 2. Term & Start Date", "At-will or fixed term; probationary period if any.",
    "### 3. Compensation", bullet(["Base salary","Bonus/commission","Equity (if any)","Benefits and time off"]),
    "### 4. Confidentiality & IP", "NDA obligations; assignment of inventions; company policies.",
    "### 5. Restrictive Covenants", "Non-solicit; limited non-compete (where permitted by law).",
    "### 6. Termination", bullet(["For cause","Without cause","Resignation","Severance (if any)"]),
    "### 7. Miscellaneous", "Governing law; dispute resolution; entire agreement.",
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),

  "LLC Operating Agreement": (i) => [
    hdr(i,true),
    "## LLC Operating Agreement",
    "### 1. Formation & Purpose", "Date, state, business purpose.",
    "### 2. Members & Capital", "Members, contributions, additional capital, capital accounts.",
    "### 3. Allocations & Distributions", "Profits/losses; tax matters partner; distributions.",
    "### 4. Management", "Member-managed or manager-managed; authority and voting.",
    "### 5. Transfers & Buy-Outs", "Restrictions on transfer; right of first refusal; buy-sell triggers.",
    "### 6. Records & Accounting", "Fiscal year; books; reports.",
    "### 7. Dissolution", "Events; winding up; liquidation priorities.",
    "### 8. Miscellaneous", bullet(["Indemnification","Amendments","Governing law"]),
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),

  "Last Will and Testament": (i) => [
    hdr(i,true),
    "## Last Will and Testament",
    "### 1. Declaration", "Testator’s intent; revocation of prior wills.",
    "### 2. Family & Beneficiaries", "Spouse, children, contingent beneficiaries.",
    "### 3. Dispositions", bullet(["Specific gifts","Residuary estate","Per stirpes/per capita rules"]),
    "### 4. Executor", "Appointment; powers; successor executor.",
    "### 5. Guardianship", "Minor children guardians.",
    "### 6. Taxes & Debts", "Payment instructions.",
    "### 7. Signatures & Witnesses", "Execution formalities per governing law."
  ].join("\\n\\n"),

  "Power of Attorney": (i) => [
    hdr(i,true),
    "## Power of Attorney",
    "### 1. Principal & Agent", i.audience || "Principal appoints Agent (Attorney-in-Fact).",
    "### 2. Powers Granted", bullet(["Financial accounts","Real estate","Tax matters","Personal property"]),
    "### 3. Effective Date & Durability", "Immediate or springing; durable POA if desired.",
    "### 4. Revocation", "Revocable by Principal; automatic upon death.",
    "### 5. Governing Law", "Specify state law.",
    "### 6. Signatures & Notarization", "Execution requirements."
  ].join("\\n\\n"),

  "Privacy Policy": (i) => [
    hdr(i,false),
    "## Privacy Policy",
    "### 1. Scope", "Covers personal data processed by the company’s services.",
    "### 2. Data Collected", bullet(["Identifiers","Usage data","Cookies","Payment info (via processor)"]),
    "### 3. Use of Data", bullet(["Service delivery","Security","Analytics","Legal compliance"]),
    "### 4. Disclosure", bullet(["Vendors/processors","Legal requests","Business transfers"]),
    "### 5. Your Rights", bullet(["Access/Correction/Deletion","Opt-outs","Appeals"]),
    "### 6. International Transfers", "Mechanisms and safeguards.",
    "### 7. Data Security & Retention", "Controls; retention periods.",
    "### 8. Contact", "How to reach us.",
  ].join("\\n\\n"),

  "Terms of Service": (i) => [
    hdr(i,false),
    "## Terms of Service",
    "### 1. Acceptance", "By using the service, you agree to these terms.",
    "### 2. Use Rules", "Prohibited activities; acceptable use.",
    "### 3. Accounts", "Registration; security; age limits.",
    "### 4. IP", "Ownership of content; license to use service.",
    "### 5. Payment & Billing", "Fees, renewals, taxes.",
    "### 6. Disclaimers & Liability", "Services provided as-is; limitation of liability.",
    "### 7. Disputes", "Arbitration/venue; governing law.",
    "### 8. Changes", "We may update terms; notice.",
  ].join("\\n\\n"),

  "Data Processing Addendum (DPA)": (i) => [
    hdr(i,true),
    "## Data Processing Addendum",
    "### 1. Roles", "Customer as Controller; Company as Processor.",
    "### 2. Processing Details", bullet(["Subject-matter","Duration","Nature and purpose","Types of data","Categories of data subjects"]),
    "### 3. Processor Obligations", bullet(["Process on documented instructions","Confidentiality","Security measures","Subprocessors"]),
    "### 4. Data Subject Rights", "Assist Controller with requests.",
    "### 5. Transfers", "Cross-border safeguards; SCCs if applicable.",
    "### 6. Audits & Reports", "Certificates; audit rights.",
    "### 7. Return/Deletion", "Upon termination.",
    "### 8. Liability", "Allocation consistent with main agreement.",
  ].join("\\n\\n"),

  "Promissory Note": (i) => [
    hdr(i,true),
    "## Promissory Note",
    "### 1. Parties", i.audience || "Borrower promises to pay Lender.",
    "### 2. Principal & Interest", "Principal amount; interest rate; compounding.",
    "### 3. Repayment", bullet(["Installments schedule","Maturity date","Prepayment rules"]),
    "### 4. Default", "Late charges; acceleration; remedies.",
    "### 5. Security (if any)", "Reference Security Agreement.",
    "### 6. Miscellaneous", bullet(["Notices","Governing law","Severability"]),
  ].join("\\n\\n"),

  "Bill of Sale (General)": (i) => [
    hdr(i,true),
    "## Bill of Sale",
    "### 1. Parties", i.audience || "Seller and Buyer",
    "### 2. Property", "Description, condition, serial/ID numbers.",
    "### 3. Purchase Price & Payment", "Amount; method; date.",
    "### 4. Warranties", "As-is or limited warranty.",
    "### 5. Title & Risk of Loss", "Transfer on delivery/acceptance.",
    "### 6. Signatures", "Execution by both parties.",
  ].join("\\n\\n"),

  "Vehicle Bill of Sale": (i) => [
    hdr(i,true),
    "## Vehicle Bill of Sale",
    "### 1. Parties", "Seller and Buyer; addresses.",
    "### 2. Vehicle", "Year, make, model, VIN, mileage.",
    "### 3. Price & Payment", "Amount, method, taxes.",
    "### 4. Disclosures", "Known defects; odometer disclosure.",
    "### 5. Warranty", "As-is unless otherwise stated.",
    "### 6. Delivery & Title", "Title transfer at delivery.",
    "### 7. Signatures", "Seller and Buyer sign."
  ].join("\\n\\n"),

  "Consulting Agreement": (i) => [
    hdr(i,true),
    "## Consulting Agreement",
    "### 1. Scope", i.goals || "Describe services, milestones, deliverables.",
    "### 2. Compensation", bullet(["Rates or fixed fee","Expenses","Invoicing & payment terms"]),
    "### 3. IP & Work Product", "Ownership; license back; background IP.",
    "### 4. Confidentiality", "NDA obligations; exceptions.",
    "### 5. Term & Termination", "For cause/without cause; effects of termination.",
    "### 6. Warranties & Liability", "Limited warranties; caps and exclusions.",
    "### 7. Miscellaneous", "Assignment; notices; governing law.",
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),

  "Independent Contractor Agreement": (i) => [
    hdr(i,true),
    "## Independent Contractor Agreement",
    "### 1. Engagement", "Contractor provides services as independent business.",
    "### 2. Payment", bullet(["Rate or fixed fee","Expenses","Invoicing"]),
    "### 3. IP & Ownership", "Work-made-for-hire where applicable; assignment of inventions.",
    "### 4. Confidentiality", "NDA obligations.",
    "### 5. Compliance", "Taxes, insurance; legal compliance.",
    "### 6. Term & Termination", "Termination mechanics and effect.",
    "### 7. Liability", "Limitations; indemnities.",
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),

  "Partnership Agreement": (i) => [
    hdr(i,true),
    "## Partnership Agreement",
    "### 1. Formation & Purpose", "Business scope and goals.",
    "### 2. Contributions", "Cash, property, services; capital accounts.",
    "### 3. Profits & Losses", "Allocations; draws; tax reporting.",
    "### 4. Management & Voting", "Authority; consent thresholds.",
    "### 5. Transfers & Buyouts", "Restrictions; ROFR; buy-sell events.",
    "### 6. Dissolution", "Events; winding up.",
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),

  "Shareholders’ Agreement": (i) => [
    hdr(i,true),
    "## Shareholders’ Agreement",
    "### 1. Capitalization & Ownership", "Share classes; cap table.",
    "### 2. Governance", "Board composition; voting rights; protective provisions.",
    "### 3. Transfers", "Lock-up; ROFR; tag-along/drag-along.",
    "### 4. Dividends & Liquidity", "Distribution policy; exit treatment.",
    "### 5. Disputes & Deadlock", "Mechanisms to resolve.",
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),

  "Bylaws (Corporation)": (i) => [
    hdr(i,true),
    "## Bylaws",
    "### 1. Directors", "Election, removal, meetings, committees.",
    "### 2. Officers", "Appointment, roles, removal.",
    "### 3. Shareholders", "Meetings; quorum; voting.",
    "### 4. Records & Fiscal", "Books; fiscal year; audits.",
    "### 5. Indemnification", "Directors/officers protection.",
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),

  "Severance Agreement": (i) => [
    hdr(i,true),
    "## Severance Agreement & Release",
    "### 1. Separation", "Date; position; last day of employment.",
    "### 2. Consideration", "Severance pay; COBRA; outplacement.",
    "### 3. Release of Claims", "General release; carve-outs as required by law.",
    "### 4. Confidentiality & Non-Disparagement", "Mutual or one-way.",
    "### 5. Return of Property", "Devices, files, keys.",
    "### 6. Miscellaneous", "Governing law; execution; revocation period.",
  ].join("\\n\\n"),

  "Cease & Desist Letter": (i) => [
    hdr(i,true),
    "## Cease & Desist Letter",
    "### 1. Conduct at Issue", i.goals || "Describe infringing or harmful conduct.",
    "### 2. Demand", "Cease the conduct immediately and confirm in writing.",
    "### 3. Remedies", "We reserve all rights at law and in equity.",
    "### 4. Deadline", "Provide written assurance by [date].",
    "### 5. Contact", "Sender details."
  ].join("\\n\\n"),

  "Quitclaim Deed": (i) => [
    hdr(i,true),
    "## Quitclaim Deed",
    "### 1. Grantor & Grantee", i.audience || "Names and addresses.",
    "### 2. Property", "Legal description; parcel; APN.",
    "### 3. Conveyance", "Grantor conveys all right, title, interest without warranties.",
    "### 4. Consideration", "Amount (if any).",
    "### 5. Execution & Recording", "Signatures; notarization; record with county."
  ].join("\\n\\n"),

  "Warranty Deed": (i) => [
    hdr(i,true),
    "## Warranty Deed",
    "### 1. Parties", "Grantor and Grantee.",
    "### 2. Property", "Legal description; APN.",
    "### 3. Conveyance & Covenants", "Grantor warrants clear title, defending against claims.",
    "### 4. Consideration", "Purchase price.",
    "### 5. Execution & Recording", "Signatures; notarization; record."
  ].join("\\n\\n"),

  "SaaS Agreement": (i) => [
    hdr(i,true),
    "## SaaS Agreement",
    "### 1. Access & License", "Non-exclusive, revocable access to hosted services.",
    "### 2. Service Levels", bullet(["Availability/SLA","Support response","Maintenance windows"]),
    "### 3. Fees & Billing", "Subscription fees; upgrades; taxes.",
    "### 4. Data & Security", "Customer data rights; security controls; backups.",
    "### 5. Privacy & DPA", "Incorporate Data Processing Addendum.",
    "### 6. IP & Restrictions", "Ownership; no reverse engineering; acceptable use.",
    "### 7. Warranties & Liability", "Disclaimers; caps; exclusions.",
    "### 8. Term & Termination", "Renewal; suspension; termination effects.",
    stdClauses(i.selectedClauses, true)
  ].join("\\n\\n"),
};

// =========================
// FALLBACK GENERATORS (Category-aware)
// =========================
function genBusiness(i) {
  const type = i.docType || "Business Document";
  return [
    hdr(i,false),
    "## Purpose", i.goals || "State the objective clearly.",
    "## Sections", bullet([
      "Definition & Scope",
      "Responsibilities & Roles",
      "Process / Steps",
      "Quality & KPIs",
      "Review & Updates"
    ])
  ].join("\\n\\n");
}

function genLegal(i) {
  const t = i.docType || "Legal Document";
  const head = hdr(i,true);
  const ndaish = /NDA|Confidential|Non-Disclosure/i.test(t);
  const body = [
    head,
    \`## \${t}\`,
    "### 1. Parties", i.audience || "Define parties and roles.",
    "### 2. Purpose", i.goals || "Describe the transaction or purpose.",
    "### 3. Term & Termination","Duration, renewal, termination for cause/without cause.",
    "### 4. Fees & Payment (if applicable)", bullet(["Rates/fees","Invoicing","Taxes"]),
    "### 5. Confidentiality", "Definition, obligations, and exclusions.",
    ndaish ? "### 6. Permitted Disclosures (NDA-specific)" : "### 6. Deliverables/Services",
    "### 7. IP & Ownership","Work-made-for-hire; license; background IP.",
    "### 8. Compliance","Compliance with applicable laws; anti-bribery; sanctions.",
    "### 9. Representations & Warranties","Limited warranties; authority.",
    "### 10. Liability & Indemnity","Liability caps; exclusions; indemnities.",
    "### 11. Miscellaneous","Notices; assignment; governing law; entire agreement."
  ].join("\\n\\n");
  const add = stdClauses(i.selectedClauses, Entitlement.isPro());
  return add ? (body + "\\n\\n" + add) : body;
}

// =========================
// WIRING UI
// =========================
function populateCategories() {
  categorySel.innerHTML = "";
  const optB = document.createElement("option"); optB.textContent = "Business";
  const optL = document.createElement("option"); optL.textContent = "Legal";
  categorySel.appendChild(optB); categorySel.appendChild(optL);
}
populateCategories();

function populateTemplates() {
  docTypeSel.innerHTML = "";
  const cat = categorySel.value;
  if (cat === "Business") {
    (LIBRARY.Business || []).forEach(t => {
      const o = document.createElement("option"); o.textContent = t; docTypeSel.appendChild(o);
    });
    return;
  }
  if (!Entitlement.isPro()) {
    const o = document.createElement("option");
    o.textContent = "Upgrade to Pro to view all legal templates";
    docTypeSel.appendChild(o);
    return;
  }
  Object.keys(LIBRARY.Legal).forEach(group => {
    (LIBRARY.Legal[group] || []).forEach(t => {
      const o = document.createElement("option");
      o.textContent = "[" + group + "] " + t;
      o.value = t;
      docTypeSel.appendChild(o);
    });
  });
}
populateTemplates();
categorySel.addEventListener("change", populateTemplates);

function renderClauses() {
  clauseGrid.innerHTML = "";
  Object.keys(CLAUSE_LIBRARY).forEach(group => {
    const list = CLAUSE_LIBRARY[group];
    const box = document.createElement("div");
    box.className = "card";
    box.style.padding = "10px";
    box.innerHTML = '<strong style="text-transform:capitalize">'+group+'</strong>';
    list.forEach(c => {
      const row = document.createElement("div");
      row.innerHTML = '<label><input type="checkbox" value="'+c+'" '+(Entitlement.isPro()?'':'disabled')+'> '+c+'</label>';
      box.appendChild(row);
    });
    clauseGrid.appendChild(box);
  });
}
renderClauses();

// Generate handler
document.getElementById("genForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  statusEl.textContent = "Generating…";
  const data = Object.fromEntries(new FormData(e.target).entries());

  if (categorySel.value === "Legal" && !Entitlement.isPro()) {
    statusEl.textContent = "Please upgrade to Pro to generate legal templates.";
    return;
  }
  data.selectedClauses = Array.from(document.querySelectorAll("#clauseGrid input[type=checkbox]:checked")).map(x => x.value);

  const chosen = (docTypeSel.value || data.docType || "").replace(/^\\[[^\\]]+\\]\\s*/, "");
  const legalFlat = Object.values(LIBRARY.Legal).flat();
  const isLegal = legalFlat.includes(chosen);

  // Prefer specific template generator if available
  const doc = TG[chosen]
    ? TG[chosen](data)
    : (isLegal ? genLegal({ ...data, docType: chosen }) : genBusiness({ ...data, docType: chosen }));

  lastDoc = "# " + chosen + ": " + (data.company || "Your Company") + "\\n\\n" + doc;
  output.textContent = lastDoc;
  output.style.display = "block";
  statusEl.textContent = "Done";
  copyBtn.disabled = false; downloadBtn.disabled = false;
});

// Copy/Download
copyBtn.addEventListener("click", async ()=>{
  try { await navigator.clipboard.writeText(lastDoc); statusEl.textContent = "Copied"; }
  catch { statusEl.textContent = "Copy failed"; }
});
downloadBtn.addEventListener("click", ()=>{
  const blob = new Blob([lastDoc || ""], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "document.md"; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),800);
});

// Team saved docs & branding
function renderSaved() {
  const savedList = document.getElementById("savedList");
  if (!savedList) return;
  savedList.innerHTML = "";
  const arr = JSON.parse(localStorage.getItem("docgen_saved") || "[]");
  if (!arr.length) { savedList.innerHTML = '<div class="muted">No saved docs yet.</div>'; return; }
  arr.forEach(d => {
    const card = document.createElement("div");
    card.className = "saved-card";
    card.innerHTML = \`
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div><strong>\${d.title}</strong><br><span class="muted">#\${d.id}</span></div>
        <div class="actions">
          <button class="btn" data-id="\${d.id}" data-act="load">Load</button>
          <button class="btn" data-id="\${d.id}" data-act="delete">Delete</button>
        </div>
      </div>\`;
    savedList.appendChild(card);
  });
  savedList.addEventListener("click", (e) => {
    const btn = e.target.closest("button"); if (!btn) return;
    const id = Number(btn.dataset.id); const act = btn.dataset.act;
    const arr2 = JSON.parse(localStorage.getItem("docgen_saved") || "[]");
    if (act === "delete") {
      localStorage.setItem("docgen_saved", JSON.stringify(arr2.filter(x => x.id !== id)));
      renderSaved();
    } else if (act === "load") {
      const item = arr2.find(x => x.id === id);
      if (item) { output.textContent = item.content; output.style.display = "block"; }
    }
  }, { once: true });
}

document.getElementById("saveBtn").addEventListener("click", ()=>{
  if (!Entitlement.isTeam()) { statusEl.textContent = "Team required to save."; return; }
  if (!lastDoc) { statusEl.textContent = "Generate a document first."; return; }
  const arr = JSON.parse(localStorage.getItem("docgen_saved") || "[]");
  arr.unshift({ id: Date.now(), title: (lastDoc.split("\\n")[0]||"").replace(/^#\\s*/,""), content: lastDoc });
  localStorage.setItem("docgen_saved", JSON.stringify(arr.slice(0, 100)));
  statusEl.textContent = "Saved to Team Library.";
  renderSaved();
});

document.getElementById("brandSave").addEventListener("click", (e)=>{
  e.preventDefault();
  if (!Entitlement.isTeam()) { statusEl.textContent = "Team required for branding."; return; }
  const url = (document.getElementById("brandUrl").value || "").trim();
  localStorage.setItem("docgen_brand_logo", url);
  document.getElementById("brandLogo").src = url;
  statusEl.textContent = "Branding saved.";
});

// Initialize
document.getElementById("brandLogo").src = localStorage.getItem("docgen_brand_logo") || "";
function init(){ populateTemplates(); renderSaved(); }
init();

// Ask for email to sync entitlement (optional; Free by default)
Entitlement.refresh("");

// PayPal buttons
paypal.Buttons({
  style: { shape: "pill", color: "blue", layout: "horizontal", label: "subscribe" },
  createSubscription: (data, actions) => actions.subscription.create({ plan_id: "${CONFIG.PAYPAL.PRO_PLAN_ID}" }),
  onApprove: () => {
    const email = prompt("Enter your subscription email to sync entitlement:");
    Entitlement.refresh(email||"");
    alert("✅ Pro subscription approved! Entitlement will reflect after webhook or email sync.");
  }
}).render("#paypal-pro");

paypal.Buttons({
  style: { shape: "pill", color: "gold", layout: "horizontal", label: "subscribe" },
  createSubscription: (data, actions) => actions.subscription.create({ plan_id: "${CONFIG.PAYPAL.TEAM_PLAN_ID}" }),
  onApprove: () => {
    const email = prompt("Enter your subscription email to sync entitlement:");
    Entitlement.refresh(email||"");
    alert("✅ Team subscription approved! Entitlement will reflect after webhook or email sync.");
  }
}).render("#paypal-team");
</script>
</body>
</html>
  `);
});

// =============================
// START SERVER
// =============================
app.listen(CONFIG.PORT, () => {
  console.log("🚀 Running on http://localhost:"+CONFIG.PORT);
  console.log("   Webhook endpoint (set in PayPal dashboard): POST /paypal/webhook");
});
