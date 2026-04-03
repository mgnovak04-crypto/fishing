export function LicenseInfo() {
  return (
    <div className="card license-card">
      <h3>Norwegian Fishing License Guide</h3>

      <div className="license-section">
        <div className="license-item">
          <div className="license-header">
            <span className="license-icon">🌊</span>
            <h4>Saltwater Fishing</h4>
            <span className="license-badge free">FREE</span>
          </div>
          <p>No license required for recreational saltwater fishing with handheld gear (rod & reel) along the entire Norwegian coast, fjords, and in the sea.</p>
          <div className="license-rules">
            <p><strong>Export limit:</strong> 18 kg of fish fillets per tourist leaving Norway</p>
            <p><strong>Equipment:</strong> Handheld gear only. Nets, traps, and longlines require permits.</p>
            <p><strong>Protected species:</strong> Check current regulations for catch-and-release or closed seasons on specific species.</p>
          </div>
        </div>

        <div className="license-item">
          <div className="license-header">
            <span className="license-icon">🏞️</span>
            <h4>Freshwater Fishing</h4>
            <span className="license-badge required">LICENSE REQUIRED</span>
          </div>
          <p>Fishing in rivers, lakes, and other freshwater requires two things:</p>
          <div className="license-rules">
            <p><strong>1. National fishing license (Fiskeravgift):</strong> Required for anyone over 18 fishing for salmon, sea trout, or Arctic char. Purchase online at the Norwegian Environment Agency.</p>
            <p><strong>2. Local fishing card (Fiskekort):</strong> Required for most freshwater bodies. Purchase locally or online. Rights are owned by local landowners/associations.</p>
            <p><strong>Children under 16:</strong> Can fish free in most freshwater with simple tackle.</p>
          </div>
        </div>

        <div className="license-item">
          <div className="license-header">
            <span className="license-icon">🐟</span>
            <h4>Salmon Rivers</h4>
            <span className="license-badge required">SPECIAL RULES</span>
          </div>
          <p>Salmon fishing is heavily regulated in Norway:</p>
          <div className="license-rules">
            <p><strong>Season:</strong> Typically June 1 - August 31, varies by river</p>
            <p><strong>National license + local river card</strong> both required</p>
            <p><strong>Disinfection:</strong> All gear must be disinfected before use in a new river (to prevent Gyrodactylus parasite spread)</p>
            <p><strong>Quotas:</strong> Many rivers have daily/seasonal catch limits</p>
            <p><strong>Catch & release:</strong> Encouraged and sometimes mandatory for large fish</p>
          </div>
        </div>
      </div>

      <div className="license-tips">
        <h4>Quick Tips</h4>
        <ul>
          <li>Always check local regulations before fishing — rules vary by water body</li>
          <li>Carry your license and local fishing card at all times</li>
          <li>Respect allemannsretten (right to roam) — you can fish from public land but not private shores without permission</li>
          <li>Bag limits and minimum sizes must be followed — fines are significant</li>
          <li>Report your salmon and sea trout catches as required by local authorities</li>
          <li>When in doubt, ask local fishing shops — they're the best source of up-to-date regulations</li>
        </ul>
      </div>
    </div>
  );
}
