<!-- app.js -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>All-in-One DocGen</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://www.paypal.com/sdk/js?client-id=AWvh-pVfzIMo3m0Ytldu84rILL-zeqqTvJZIsVJxERE5yD_bTh71I3iJ2NfRoac4BCz0ophJnMxN1fJC&vault=true&intent=subscription"></script>
  <style>
    body { margin:0; background:#0b1020; color:#e9eefc; font-family:Inter,system-ui,sans-serif }
    .wrap{max-width:1100px;margin:30px auto;padding:0 16px}
    .card{background:#131a2b;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:16px;margin-bottom:16px}
    h1{margin:0 0 10px}
    label{display:block;font-size:13px;color:#92a1bb;margin:6px 0}
    input,select,textarea{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:#0f1627;color:#e9eefc}
    textarea{min-height:100px}
    .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
    .btn{cursor:pointer;border:1px solid rgba(255,255,255,.12);padding:10px 14px;border-radius:10px;background:#111a2e;color:#e9eefc}
    .btn.primary{background:linear-gradient(180deg,#2a6bff,#234ed8)}
    .doc{white-space:pre-wrap;background:#0f1627;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;margin-top:10px}
  </style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <h1>All-in-One DocGen</h1>
    <p>Current tier: <span id="tier">Free</span></p>
    <div class="actions">
      <div id="paypal-pro"></div>
      <div id="paypal-team"></div>
    </div>
  </div>

  <div class="card">
    <form id="form">
      <label>Category</label>
      <select id="category"><option>Business</option><option>Legal</option></select>
      <label>Template</label>
      <select id="template"></select>
      <label>Company</label>
      <input id="company" placeholder="Acme Co." />
      <label>Audience/Parties</label>
      <input id="audience" placeholder="Ops team / Landlord & Tenant" />
      <label>Goals</label>
      <textarea id="goals"></textarea>
      <div class="actions">
        <button type="submit" class="btn primary">Generate</button>
        <button type="button" id="copy" class="btn" disabled>Copy</button>
      </div>
    </form>
    <div id="output" class="doc" style="display:none"></div>
  </div>
</div>

<script>
let tier = localStorage.getItem("tier") || "Free";
document.getElementById("tier").textContent = tier;

const LIBRARY = {
  Business: ["SOP","Policy","Project Brief","Job Description"],
  Legal: ["NDA (Mutual)","Residential Lease","Last Will and Testament","Bill of Sale (General)"]
};

const categorySel = document.getElementById("category");
const templateSel = document.getElementById("template");
function populateTemplates(){
  templateSel.innerHTML="";
  const cat=categorySel.value;
  if(cat==="Legal" && tier==="Free"){
    templateSel.innerHTML="<option>Upgrade to Pro for legal templates</option>";
  } else {
    LIBRARY[cat].forEach(t=>{
      const o=document.createElement("option");o.textContent=t;templateSel.appendChild(o);
    });
  }
}
populateTemplates();
categorySel.addEventListener("change",populateTemplates);

function generate(type,data){
  if(/NDA/i.test(type)){
    return \`# NDA\\nParties: \${data.audience}\\nCompany: \${data.company}\\nPurpose: \${data.goals}\\n...\`;
  }
  if(/Lease/i.test(type)){
    return \`# Lease Agreement\\nLandlord & Tenant: \${data.audience}\\nProperty: [describe]\\nRent: [amount]\\n...\`;
  }
  if(/Will/i.test(type)){
    return \`# Last Will\\nTestator: \${data.audience}\\nBeneficiaries: [names]\\n...\`;
  }
  return \`# \${type}\\nCompany: \${data.company}\\nAudience: \${data.audience}\\nGoals: \${data.goals}\\n...\`;
}

const form=document.getElementById("form");
const output=document.getElementById("output");
const copy=document.getElementById("copy");
form.addEventListener("submit",e=>{
  e.preventDefault();
  const type=templateSel.value;
  if(type.includes("Upgrade")){alert("Upgrade to Pro!");return;}
  const doc=generate(type,{
    company:company.value,audience:audience.value,goals:goals.value
  });
  output.textContent=doc;output.style.display="block";copy.disabled=false;
});
copy.addEventListener("click",()=>{navigator.clipboard.writeText(output.textContent);alert("Copied!");});

paypal.Buttons({
  createSubscription:(d,a)=>a.subscription.create({plan_id:"P-6RK10973X0630022SNDOG65A"}),
  onApprove:()=>{tier="Pro";localStorage.setItem("tier","Pro");document.getElementById("tier").textContent="Pro";populateTemplates();}
}).render("#paypal-pro");

paypal.Buttons({
  createSubscription:(d,a)=>a.subscription.create({plan_id:"P-2XM652161B094711GNDOHBBY"}),
  onApprove:()=>{tier="Team";localStorage.setItem("tier","Team");document.getElementById("tier").textContent="Team";populateTemplates();}
}).render("#paypal-team");
</script>
</body>
</html>
