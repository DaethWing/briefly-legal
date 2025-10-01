/* =========================================================================
   All-in-One DocGen — Single-file Express app for Vercel or local Node
   - Business + Legal document generator (no external AI / no API keys)
   - PayPal subscriptions: Free / Pro ($9) / Team ($19)
   - Clause Library, Team saved docs, Branding (client-side)
   - Large, data-driven template catalog + specific generators
   ========================================================================= */

const express = require("express");
const app = express();
app.use(express.json());

// Serve the App (inline HTML/JS/CSS)
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>All-in-One DocGen</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- PayPal SDK (live client id provided) -->
  <script src="https://www.paypal.com/sdk/js?client-id=AWvh-pVfzIMo3m0Ytldu84rILL-zeqqTvJZIsVJxERE5yD_bTh71I3iJ2NfRoac4BCz0ophJnMxN1fJC&vault=true&intent=subscription"></script>
  <style>
    :root{--bg:#0b1020;--card:#131a2b;--muted:#92a1bb;--accent:#7ca7ff}
    *{box-sizing:border-box}
    html,body{margin:0;background:var(--bg);color:#e9eefc;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
    .wrap{max-width:1160px;margin:32px auto;padding:0 16px}
    .card{background:#131a2b;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:16px;margin:0 0 16px}
    .header{display:flex;justify-content:space-between;align-items:center;gap:12px}
    .pill{display:inline-block;background:#112044;color:#b9cbff;border:1px solid #1f3a7a;border-radius:999px;padding:4px 10px;font-size:12px}
    h1{margin:6px 0 10px}
    .muted{color:var(--muted);font-size:12px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    label{display:block;color:var(--muted);font-size:13px;margin:6px 0}
    input,select,textarea{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:#0f1627;color:#e9eefc}
    textarea{min-height:120px;grid-column:1 / -1}
    .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
    .btn{cursor:pointer;border:1px solid rgba(255,255,255,.12);padding:10px 14px;border-radius:10px;background:#111a2e;color:#e9eefc;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
    .btn.primary{background:linear-gradient(180deg,#2a6bff,#234ed8);border-color:transparent}
    .doc{white-space:pre-wrap;background:#0f1627;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;margin-top:10px}
    .tierbox{display:flex;gap:10px;flex-wrap:wrap}
    .tier{flex:1 1 260px;background:#0e1730;border:1px dashed #28428f;padding:12px;border-radius:12px}
    .logo{max-height:28px}
    .saved-card{background:#0f1627;border:1px solid rgba(255,255,255,.08);padding:10px;border-radius:10px;margin:6px 0}
    .notice{font-size:12px;color:#b6c6ff;margin-top:6px}
    .kbd{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-size:12px;background:#0f1627;border:1px solid rgba(255,255,255,.08);padding:2px 6px;border-radius:6px}
  </style>
</head>
<body>
<div class="wrap">
  <!-- HEADER / TIERS -->
  <div class="card">
    <div class="header">
      <div>
        <span class="pill">Free preview • Pro ($9) • Team ($19)</span>
        <h1>All-in-One DocGen</h1>
        <div class="muted">Waybook-style business speed + LegalTemplates-style breadth — all client-side (no API).</div>
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
      <span class="muted">These are client-side subscriptions. Entitlements are stored in your browser (<span class="kbd">localStorage</span>) in this one-file version.</span>
    </div>
  </div>

  <!-- CREATOR -->
  <div class="card">
    <h3 style="margin:6px 0">Create a Document</h3>
    <form id="genForm" class="grid" autocomplete="off">
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
        <input name="company" id="company" placeholder="Acme Co." />
      </div>
      <div>
        <label>Industry</label>
        <input name="industry" id="industry" placeholder="SaaS, Retail, Manufacturing…" />
      </div>
      <div>
        <label>Audience/Parties</label>
        <input name="audience" id="audience" placeholder="Ops team / Landlord & Tenant / Discloser & Recipient" />
      </div>
      <div>
        <label>Tone</label>
        <select name="tone" id="tone">
          <option>Professional</option>
          <option>Friendly</option>
          <option>Formal</option>
          <option>Concise</option>
        </select>
      </div>

      <textarea name="goals" id="goals" placeholder="Purpose, KPIs, special terms, timeline, governing law, deliverables…"></textarea>

      <div style="grid-column:1 / -1">
        <div id="clausesCard">
          <div style="display:flex;align-items:center;gap:8px;">
            <strong>Clause Library</strong>
            <span class="muted">(Pro/Team) Toggle extra clauses to append to legal docs</span>
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
    <div class="notice">Drafts are composed programmatically. For legal enforceability, have a qualified attorney review the final document.</div>
  </div>

  <!-- TEAM -->
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
/* =========================
   ENTITLEMENT (client-only)
   ========================= */
const Entitlement = {
  get tier() { return localStorage.getItem("docgen_tier") || "Free"; },
  set tier(v) {
    localStorage.setItem("docgen_tier", v);
    document.getElementById("tierLabel").textContent = v;
    document.getElementById("saveBtn").style.display = (v === "Team") ? "" : "none";
    document.getElementById("teamCard").style.display = (v === "Team") ? "" : "none";
    renderClauses(); populateTemplates(); renderSaved();
  },
  isPro()  { return this.tier === "Pro" || this.tier === "Team"; },
  isTeam() { return this.tier === "Team"; }
};
document.getElementById("tierLabel").textContent = Entitlement.tier;

/* =========================
   CATALOG (Business + Legal)
   ========================= */
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

/* =========================
   CLAUSE LIBRARY (Pro/Team)
   ========================= */
const CLAUSE_LIBRARY = {
  general: ["Governing Law","Arbitration","Venue","Severability","Entire Agreement","Notices","Amendments","Assignment","Force Majeure"],
  ip: ["IP Ownership","License Grant","Work-Made-for-Hire","Open-Source Compliance"],
  risk: ["Warranty Disclaimer","Limitation of Liability","Indemnification","Insurance Requirements"],
  people: ["Confidentiality","Non-Disclosure","Non-Solicitation","Non-Compete (where permitted)"],
  privacy: ["Data Processing Addendum","GDPR/CCPA Disclosures","HIPAA Rider","FERPA Rider"]
};

/* =========================
   UI refs
   ========================= */
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

/* =========================
   helpers
   ========================= */
const cap = s => (s||"").charAt(0).toUpperCase() + (s||"").slice(1);
const bullet = items => (items||[]).map(x=>"- "+x).join("\\n");
const numbered = items => (items||[]).map((x,i)=>(i+1)+". "+x).join("\\n");
function hdr(i,legal=false){
  return [
    \`**Company:** \${i.company||"Your Company"}  \`,
    \`**Industry:** \${i.industry||"General"}  \`,
    \`\${legal? "**Parties:**":"**Audience/Parties:**"} \${i.audience|| (legal?"Define parties":"General")}  \`,
    \`**Tone:** \${i.tone||"Professional"}  \`
  ].join("\\n");
}
function stdClauses(picks, enable){
  if(!enable) return "";
  const chosen = picks?.length ? picks : ["Governing Law","Severability","Entire Agreement","Notices","Assignment","Force Majeure"];
  return "## Clause Pack (Pro)\\n" + chosen.map((c,i)=>\`**\${i+1}. \${c}.** Standard \${c.toLowerCase()} language.\`).join("\\n");
}

/* =========================
   SPECIFIC GENERATORS (TG)
   (Curated explicit content for high-value templates)
   ========================= */
const TG = {
  // NDA — Mutual
  "NDA (Mutual)": (i) => [
    hdr(i,true),
    "## Mutual Non-Disclosure Agreement",
    "### 1. Parties", i.audience || "Discloser and Recipient (each a “Party”).",
    "### 2. Purpose", i.goals || "Evaluate a potential business relationship.",
    "### 3. Confidential Information", "Nonpublic information including technical, financial, and business data.",
    "### 4. Exclusions", bullet(["Already known","Independently developed","Publicly available","Rightfully received from third party"]),
    "### 5. Obligations", bullet(["Use only for the Purpose","Protect with reasonable care","Limit access to need-to-know","No reverse engineering"]),
    "### 6. Term & Return", "Obligations survive 3–5 years; return/destroy on request.",
    "### 7. Remedies", "Injunctive relief; all other remedies preserved.",
    "### 8. Miscellaneous", bullet(["No license granted","Assignment limits","Governing law/venue"]),
    stdClauses(i.selectedClauses, Entitlement.isPro())
  ].join("\\n\\n"),

  // NDA — Unilateral
  "NDA (Unilateral)": (i) => [
    hdr(i,true),
    "## Unilateral Non-Disclosure Agreement",
    "### 1. Parties", i.audience || "Discloser and Recipient.",
    "### 2. Purpose", i.goals || "Evaluation of Discloser’s offerings or collaboration.",
    "### 3. Confidential Information", "All nonpublic data disclosed by Discloser.",
    "### 4. Recipient Obligations", bullet(["Maintain confidentiality","Use solely for Purpose","Limit access","No reverse engineering"]),
    "### 5. Exclusions", bullet(["Previously known","Independently developed","Public domain","Third-party source"]),
    "### 6. Term & Return", "3–5 years; return/destroy upon request.",
    "### 7. Remedies", "Equitable relief; damages.",
    "### 8. Miscellaneous", bullet(["No license","Assignment","Governing law"]),
    stdClauses(i.selectedClauses, Entitlement.isPro())
  ].join("\\n\\n"),

  // Residential Lease
  "Residential Lease": (i) => [
    hdr(i,true),
    "## Residential Lease Agreement",
    "### 1. Parties", i.audience || "Landlord and Tenant",
    "### 2. Premises", "Address/unit; parking; storage.",
    "### 3. Term", "Fixed term or month-to-month.",
    "### 4. Rent & Deposits", bullet(["Monthly rent & due date","Security deposit","Late/NSF fees"]),
    "### 5. Utilities & Services", "Responsibility assignment.",
    "### 6. Maintenance", "Tenant vs. Landlord duties; habitability.",
    "### 7. Use & Occupancy", "Occupant limits; pets; smoking rules.",
    "### 8. Entry", "Notice for entry; emergency access.",
    "### 9. Default & Remedies", "Cure periods; eviction; costs.",
    "### 10. Termination & Move-Out", "Condition; deposit return timeline.",
    "### 11. Miscellaneous", bullet(["Subletting rules","Governing law","Entire agreement"]),
    stdClauses(i.selectedClauses, Entitlement.isPro())
  ].join("\\n\\n"),

  // Commercial Lease
  "Commercial Lease": (i) => [
    hdr(i,true),
    "## Commercial Lease Agreement",
    "### 1. Parties & Premises", i.audience || "Landlord and Tenant; legal descriptions; common areas.",
    "### 2. Term & Possession", "Commencement date; early access; holdover.",
    "### 3. Base Rent & Additional Rent", bullet(["Base rent schedule","CAM/NNN charges","Percentage rent (if any)"]),
    "### 4. Use; Exclusivity", "Permitted use; exclusive use protection; compliance with laws.",
    "### 5. Improvements & Maintenance", "Build-out; repairs; ADA; signage.",
    "### 6. Insurance & Indemnity", "CGL; property; waivers of subrogation.",
    "### 7. Assignment & Subletting", "Landlord consent; recapture rights.",
    "### 8. Defaults & Remedies", "Cure periods; termination; damages.",
    "### 9. Miscellaneous", "Estoppel; SNDA; guaranty (if any).",
    stdClauses(i.selectedClauses, Entitlement.isPro())
  ].join("\\n\\n"),

  // Employment Agreement
  "Employment Agreement": (i) => [
    hdr(i,true),
    "## Employment Agreement",
    "### 1. Position & Duties", i.goals || "Title, responsibilities, reporting line, work location.",
    "### 2. Term", "At-will or fixed term; probation (if any).",
    "### 3. Compensation", bullet(["Base salary","Bonus/commission","Equity (if any)","Benefits & time off"]),
    "### 4. Confidentiality & IP", "NDA obligations; inventions assignment; policies.",
    "### 5. Restrictive Covenants", "Non-solicitation; limited non-compete (where permitted).",
    "### 6. Termination", bullet(["For cause","Without cause","Resignation","Severance (if any)"]),
    "### 7. Miscellaneous", "Governing law; dispute resolution; entire agreement.",
    stdClauses(i.selectedClauses, Entitlement.isPro())
  ].join("\\n\\n"),

  // LLC Operating Agreement
  "LLC Operating Agreement": (i) => [
    hdr(i,true),
    "## LLC Operating Agreement",
    "### 1. Formation & Purpose", "State, date, and business purpose.",
    "### 2. Members & Capital", "Members; contributions; capital accounts.",
    "### 3. Allocations & Distributions", "Profits/losses; distributions; tax matters.",
    "### 4. Management", "Member- or Manager-managed; authority; voting.",
    "### 5. Transfers & Buy-Outs", "Restrictions; ROFR; buy-sell triggers.",
    "### 6. Records & Accounting", "Fiscal year; books; reports.",
    "### 7. Dissolution", "Events; winding up; liquidation priorities.",
    "### 8. Miscellaneous", bullet(["Indemnification","Amendments","Governing law"]),
    stdClauses(i.selectedClauses, Entitlement.isPro())
  ].join("\\n\\n"),

  // Last Will and Testament
  "Last Will and Testament": (i) => [
    hdr(i,true),
    "## Last Will and Testament",
    "### 1. Declaration", "Intent; revocation of prior wills.",
    "### 2. Family & Beneficiaries", "Spouse/children; contingent beneficiaries.",
    "### 3. Dispositions", bullet(["Specific gifts","Residuary estate","Per stirpes/per capita rules"]),
    "### 4. Executor", "Appointment; powers; successor executor.",
    "### 5. Guardianship", "Minor children guardianship.",
    "### 6. Taxes & Debts", "Payment instructions.",
    "### 7. Signatures & Witnesses", "Execution requirements per law."
  ].join("\\n\\n"),

  // Power of Attorney
  "Power of Attorney": (i) => [
    hdr(i,true),
    "## Power of Attorney",
    "### 1. Principal & Agent", i.audience || "Principal appoints Agent (Attorney-in-Fact).",
    "### 2. Powers Granted", bullet(["Financial accounts","Real estate","Tax matters","Personal property"]),
    "### 3. Effective Date & Durability", "Immediate or springing; durable if desired.",
    "### 4. Revocation", "Revocable by Principal; automatic upon death.",
    "### 5. Governing Law", "Specify state law.",
    "### 6. Signatures & Notarization", "Execution requirements."
  ].join("\\n\\n"),

  // Privacy Policy
  "Privacy Policy": (i) => [
    hdr(i,false),
    "## Privacy Policy",
    "### 1. Scope", "Personal data processed by the services.",
    "### 2. Data Collected", bullet(["Identifiers","Usage data","Cookies","Payments (via processor)"]),
    "### 3. Use of Data", bullet(["Service delivery","Security","Analytics","Compliance"]),
    "### 4. Disclosures", bullet(["Vendors/processors","Legal requests","Business transfers"]),
    "### 5. Your Rights", bullet(["Access/Correction/Deletion","Opt-outs","Appeals"]),
    "### 6. International Transfers", "Mechanisms and safeguards.",
    "### 7. Security & Retention", "Controls and retention periods.",
    "### 8. Contact", "How to reach us."
  ].join("\\n\\n"),

  // Terms of Service
  "Terms of Service": (i) => [
    hdr(i,false),
    "## Terms of Service",
    "### 1. Acceptance", "By using the service, you agree to these terms.",
    "### 2. Use Rules", "Prohibited activities; acceptable use.",
    "### 3. Accounts", "Registration; security; eligibility.",
    "### 4. IP", "Ownership; license; DMCA process.",
    "### 5. Payment & Billing", "Fees; renewals; taxes.",
    "### 6. Disclaimers & Liability", "As-is; limitation of liability.",
    "### 7. Disputes", "Arbitration/venue; governing law.",
    "### 8. Changes", "We may update terms; notice."
  ].join("\\n\\n"),

  // DPA
  "Data Processing Addendum (DPA)": (i) => [
    hdr(i,true),
    "## Data Processing Addendum",
    "### 1. Roles", "Controller vs. Processor.",
    "### 2. Processing Details", bullet(["Subject-matter","Duration","Nature/Purpose","Data types","Data subjects"]),
    "### 3. Processor Obligations", bullet(["Instructions","Confidentiality","Security","Subprocessors"]),
    "### 4. Data Subject Rights", "Assist Controller.",
    "### 5. Transfers", "SCCs or other safeguards.",
    "### 6. Audits & Reports", "Certificates; audit rights.",
    "### 7. Return/Deletion", "Upon termination.",
    "### 8. Liability", "Allocation per main agreement."
  ].join("\\n\\n"),

  // Promissory Note
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

  // Bill of Sale (General)
  "Bill of Sale (General)": (i) => [
    hdr(i,true),
    "## Bill of Sale",
    "### 1. Parties", i.audience || "Seller and Buyer",
    "### 2. Property", "Description, ID/serial, condition.",
    "### 3. Price & Payment", "Amount, method, date.",
    "### 4. Warranties", "As-is or limited warranty.",
    "### 5. Title & Risk of Loss", "Transfer upon delivery/acceptance.",
    "### 6. Signatures", "Execution by both parties."
  ].join("\\n\\n"),

  // Vehicle Bill of Sale
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

  // Consulting Agreement
  "Consulting Agreement": (i) => [
    hdr(i,true),
    "## Consulting Agreement",
    "### 1. Scope", i.goals || "Services, milestones, deliverables.",
    "### 2. Compensation", bullet(["Rate/fixed fee","Expenses","Invoicing & terms"]),
    "### 3. IP & Work Product", "Ownership; license back; background IP.",
    "### 4. Confidentiality", "NDA obligations; exceptions.",
    "### 5. Term & Termination", "For cause/without cause; effects.",
    "### 6. Warranties & Liability", "Limited warranties; caps/exclusions.",
    "### 7. Miscellaneous", "Assignment; notices; governing law.",
    stdClauses(i.selectedClauses, Entitlement.isPro())
  ].join("\\n\\n"),

  // SaaS Agreement
  "SaaS Agreement": (i) => [
    hdr(i,true),
    "## SaaS Agreement",
    "### 1. Access & License", "Non-exclusive access to hosted services.",
    "### 2. Service Levels", bullet(["Availability/SLA","Support response","Maintenance windows"]),
    "### 3. Fees & Billing", "Subscription fees; upgrades; taxes.",
    "### 4. Data & Security", "Customer data rights; security controls; backups.",
    "### 5. Privacy & DPA", "Attach DPA.",
    "### 6. IP & Restrictions", "Ownership; acceptable use; no reverse engineering.",
    "### 7. Warranties & Liability", "Disclaimers; liability caps; exclusions.",
    "### 8. Term & Termination", "Renewal; suspension; termination.",
    stdClauses(i.selectedClauses, Entitlement.isPro())
  ].join("\\n\\n"),
};

/* =========================
   FALLBACKS (Category-aware)
   ========================= */
function genBusiness(i) {
  return [
    hdr(i,false),
    "## Purpose", i.goals || "State the objective clearly.",
    "## Scope", bullet(["Teams/roles","Locations/systems","In/Out of scope"]),
    "## Responsibilities", bullet(["Leadership: set direction","Managers: implement & monitor","Team: execute & report"]),
    "## Procedure", numbered(["Preparation","Execution","Quality Review","Recordkeeping"]),
    "## KPIs", bullet(["SLA adherence","Error rate","Cycle time"]),
    "## Review & Updates", "Review quarterly or upon material change."
  ].join("\\n\\n");
}
function genLegal(i) {
  const t = i.docType || "Legal Document";
  const ndaish = /NDA|Confidential|Non-Disclosure/i.test(t);
  const base = [
    hdr(i,true),
    \`## \${t}\`,
    "### 1. Parties", i.audience || "Define parties and roles.",
    "### 2. Purpose", i.goals || "Describe the transaction or relationship.",
    "### 3. Term & Termination", "Duration; renewal; termination for cause/without cause.",
    "### 4. Fees & Payment (if applicable)", bullet(["Rates/fees","Invoicing","Taxes"]),
    "### 5. Confidentiality", "Definition; obligations; exclusions.",
    ndaish ? "### 6. Permitted Disclosures (NDA-specific)" : "### 6. Deliverables/Services",
    "### 7. IP & Ownership", "Work-made-for-hire; license; background IP.",
    "### 8. Compliance", "Laws; anti-bribery; sanctions; data protection.",
    "### 9. Representations & Warranties", "Limited warranties; authority.",
    "### 10. Liability & Indemnity", "Liability caps; exclusions; indemnities.",
    "### 11. Miscellaneous", "Notices; assignment; governing law; entire agreement."
  ].join("\\n\\n");
  const add = stdClauses(i.selectedClauses, Entitlement.isPro());
  return add ? (base + "\\n\\n" + add) : base;
}

/* =========================
   UI: categories, templates, clauses
   ========================= */
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
      const o = document.createElement("option");
      o.textContent = t; docTypeSel.appendChild(o);
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

/* =========================
   GENERATE
   ========================= */
document.getElementById("genForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  statusEl.textContent = "Generating…";
  const form = e.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  data.selectedClauses = Array.from(document.querySelectorAll("#clauseGrid input[type=checkbox]:checked")).map(x => x.value);

  const rawType = (data.docType || docTypeSel.value || "").replace(/^\\[[^\\]]+\\]\\s*/, "");
  if (categorySel.value === "Legal" && !Entitlement.isPro()) {
    statusEl.textContent = "Please upgrade to Pro to generate legal templates.";
    return;
  }

  // Flatten legal to detect category
  const legalFlat = Object.values(LIBRARY.Legal).flat();
  const isLegal = legalFlat.includes(rawType);
  const specific = TG[rawType];

  const body = specific
    ? specific(data)
    : (isLegal ? genLegal({ ...data, docType: rawType }) : genBusiness({ ...data, docType: rawType }));

  lastDoc = "# " + rawType + ": " + (data.company || "Your Company") + "\\n\\n" + body;
  output.textContent = lastDoc;
  output.style.display = "block";
  statusEl.textContent = "Done";
  copyBtn.disabled = false; downloadBtn.disabled = false;
});

/* =========================
   COPY / DOWNLOAD
   ========================= */
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

/* =========================
   TEAM: saved docs & branding
   ========================= */
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

saveBtn.addEventListener("click", ()=>{
  if (!Entitlement.isTeam()) { statusEl.textContent = "Team required to save."; return; }
  if (!lastDoc) { statusEl.textContent = "Generate a document first."; return; }
  const arr = JSON.parse(localStorage.getItem("docgen_saved") || "[]");
  arr.unshift({ id: Date.now(), title: (lastDoc.split("\\n")[0]||"").replace(/^#\\s*/,""), content: lastDoc });
  localStorage.setItem("docgen_saved", JSON.stringify(arr.slice(0, 200)));
  statusEl.textContent = "Saved to Team Library.";
  renderSaved();
});

brandSave.addEventListener("click", (e)=>{
  e.preventDefault();
  if (!Entitlement.isTeam()) { statusEl.textContent = "Team required for branding."; return; }
  const url = (brandUrl.value || "").trim();
  localStorage.setItem("docgen_brand_logo", url);
  brandLogo.src = url;
  statusEl.textContent = "Branding saved.";
});
brandLogo.src = localStorage.getItem("docgen_brand_logo") || "";

/* =========================
   INIT
   ========================= */
(function init(){
  // Categories/templates
  (function populateCategories(){
    categorySel.innerHTML = "";
    const optB = document.createElement("option"); optB.textContent = "Business";
    const optL = document.createElement("option"); optL.textContent = "Legal";
    categorySel.appendChild(optB); categorySel.appendChild(optL);
  })();
  populateTemplates();
  renderSaved();

  // Entitlement (local)
  document.getElementById("tierLabel").textContent = Entitlement.tier;

  // PayPal client-side subs → store to localStorage
  paypal.Buttons({
    style: { shape: "pill", color: "blue", layout: "horizontal", label: "subscribe" },
    createSubscription: (data, actions) => actions.subscription.create({ plan_id: "P-6RK10973X0630022SNDOG65A" }), // Pro $9
    onApprove: () => { Entitlement.tier = "Pro"; alert("✅ Pro subscription activated!"); }
  }).render("#paypal-pro");

  paypal.Buttons({
    style: { shape: "pill", color: "gold", layout: "horizontal", label: "subscribe" },
    createSubscription: (data, actions) => actions.subscription.create({ plan_id: "P-2XM652161B094711GNDOHBBY" }), // Team $19
    onApprove: () => { Entitlement.tier = "Team"; alert("✅ Team subscription activated!"); }
  }).render("#paypal-team");
})();
</script>
</body>
</html>
  `);
});

// Local run OR Vercel serverless export
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log("🚀 DocGen running at http://localhost:" + PORT));
}
module.exports = app;
