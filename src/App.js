import React, { useEffect, useRef } from "react";

// Live PayPal details
const PAYPAL_CLIENT_ID = "AWvh-pVfzIMo3m0Ytldu84rILL-zeqqTvJZIsVJxERE5yD_bTh71I3iJ2NfRoac4BCz0ophJnMxN1fJC";
const PAYPAL_PRO_PLAN_ID = "P-6RK10973X0630022SNDOG65A";
const PAYPAL_TEAM_PLAN_ID = "P-2XM652161B094711GNDOHBBY";

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

  useEffect(() => {
    let cancelled = false;
    loadPayPalScript(PAYPAL_CLIENT_ID)
      .then((paypal) => {
        if (cancelled) return;
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
      })
      .catch((e) => {
        console.error(e);
        alert("Could not load PayPal. Please refresh.");
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{marginBottom: 24}}>
        <h1>Briefly Legal</h1>
        <p>Generate clean, customizable legal-style letters and business docs in minutes.</p>
      </header>

      <section style={{display:'grid', gap:'16px'}}>
        <div style={{border:'1px solid #ddd', borderRadius:'12px', padding:'16px'}}>
          <h2>Starter (Free)</h2>
          <p>3 docs/month, basic templates.</p>
          <button onClick={() => alert("Free signup coming soon!")}>Sign Up Free</button>
        </div>

        <div style={{border:'1px solid #ddd', borderRadius:'12px', padding:'16px'}}>
          <h2>Pro ($9/mo)</h2>
          <p>Unlimited docs, template library, saved profiles.</p>
          <div ref={proRef}></div>
        </div>

        <div style={{border:'1px solid #ddd', borderRadius:'12px', padding:'16px'}}>
          <h2>Team ($19/mo)</h2>
          <p>3 seats included, shared library, priority support.</p>
          <div ref={teamRef}></div>
        </div>
      </section>

      <footer style={{marginTop:'32px', fontSize:'14px', color:'#666', textAlign:'center'}}>
        © {new Date().getFullYear()} Briefly Legal — Not legal advice.
      </footer>
    </div>
  );
}
