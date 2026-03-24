export default function Home() {
  return (
    <main>

      {/* NAV */}
      <nav className="nav">
        <div className="logo">GolfGives</div>

        <div className="nav-links">
          <a href="#">Charities</a>
          <a href="#">How it works</a>
          <a href="#" className="nav-cta">Get started</a>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="badge">⛳ Golf meets giving</div>

        <h1>
          Play golf.<br />
          <span>Change lives.</span>
        </h1>

        <p>
          Subscribe, track your scores, win monthly prizes — and automatically support the charity you care about most.
        </p>

        <div className="hero-btns">
          <button className="btn-primary">Start for free →</button>
          <button className="btn-secondary">How it works</button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat">
          <div className="stat-val">£12,400</div>
          <div className="stat-label">Raised for charity</div>
        </div>

        <div className="stat">
          <div className="stat-val">340+</div>
          <div className="stat-label">Active subscribers</div>
        </div>

        <div className="stat">
          <div className="stat-val">28</div>
          <div className="stat-label">Charities supported</div>
        </div>

        <div className="stat">
          <div className="stat-val">£2,800</div>
          <div className="stat-label">Prizes paid out</div>
        </div>
      </div>

      {/* STEPS */}
      <div className="steps">
        <h2>How it works</h2>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>Subscribe</h3>
            <p>
              Choose monthly or yearly. A portion of every payment goes directly to your chosen charity.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">02</div>
            <h3>Enter your scores</h3>
            <p>
              Log your last 5 Stableford scores after each round. Your scores become your draw entries.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">03</div>
            <h3>Win & give</h3>
            <p>
              Every month we draw 5 numbers. Match them to win cash prizes — your charity gets funded regardless.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-box">
        <h2>Ready to make your round count?</h2>
        <p>Join hundreds of golfers already making a difference.</p>
        <button className="btn-primary">Join GolfGives today →</button>
      </div>

    </main>
  )
}