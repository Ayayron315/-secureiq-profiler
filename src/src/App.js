import { useState, useEffect } from "react";

const INDUSTRIES = [
  "Property Management",
  "Marina / Waterfront",
  "Construction / Project Site",
  "School / Education",
  "Bank / Financial",
  "Retail",
  "Warehouse / Industrial",
  "Other",
];

const industryIcons = {
  "Property Management": "🏢",
  "Marina / Waterfront": "⚓",
  "Construction / Project Site": "🏗️",
  "School / Education": "🎓",
  "Bank / Financial": "🏦",
  "Retail": "🛍️",
  "Warehouse / Industrial": "📦",
  "Other": "🔍",
};

const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;

export default function App() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("Property Management");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState({});
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("secureiq-notes");
      if (saved) setNotes(JSON.parse(saved));
      const savedHistory = localStorage.getItem("secureiq-history");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {}
  }, []);

  function saveNote(key, text) {
    const updated = { ...notes, [key]: text };
    setNotes(updated);
    try {
      localStorage.setItem("secureiq-notes", JSON.stringify(updated));
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (e) {}
  }

  function getNoteKey(p) {
    return p?.businessName?.toLowerCase().replace(/\s+/g, "-") || "unknown";
  }

  async function handleResearch() {
    if (!businessName.trim()) return;
    setLoading(true);
    setError("");
    setProfile(null);

    const prompt = `You are an expert commercial security and surveillance sales consultant. Research and analyze the following business for a sales rep who sells commercial camera and surveillance systems.

Business Name: ${businessName}
Industry: ${industry}

Using web search, find real information about this business. Then provide a structured sales profile in this EXACT JSON format (no markdown, no backticks, just raw JSON):

{
  "businessName": "Official business name",
  "industry": "${industry}",
  "overview": "2-3 sentence summary of what this business does, how many locations, size, and relevant facts",
  "locations": "Estimated number of locations or properties they manage",
  "securityPainPoints": [
    "Specific pain point 1 relevant to their industry",
    "Specific pain point 2",
    "Specific pain point 3"
  ],
  "recommendedSolutions": [
    "Specific camera/surveillance solution 1 for this business type",
    "Specific solution 2",
    "Specific solution 3"
  ],
  "pitchAngle": "The single strongest angle to lead with when pitching this specific business — be specific to their industry and size",
  "openingLine": "A natural, confident opening line the sales rep can actually say when calling or visiting this business",
  "hotButtons": ["Key word or concern 1", "Key word or concern 2", "Key word or concern 3"],
  "redFlags": "Any known challenges, budget constraints, or competitive considerations to be aware of",
  "confidenceScore": 85
}

Be specific, realistic, and actionable. Base everything on what you know about this industry and any real information you find about this business.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const allText = data.content
        .map((item) => (item.type === "text" ? item.text : ""))
        .filter(Boolean)
        .join("\n");

      const jsonMatch = allText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse profile data.");

      const parsed = JSON.parse(jsonMatch[0]);
      const newEntry = { ...parsed, timestamp: new Date().toLocaleTimeString() };
      setProfile(parsed);

      const updatedHistory = [newEntry, ...history.filter(h => h.businessName !== parsed.businessName).slice(0, 9)];
      setHistory(updatedHistory);
      try { localStorage.setItem("secureiq-history", JSON.stringify(updatedHistory)); } catch (e) {}
    } catch (err) {
      setError("Something went wrong. Check your API key or try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleResearch();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#e8eaf0", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0d1b2e 0%, #0a0e1a 100%)", borderBottom: "1px solid #1e2d45", padding: "24px 32px", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #00d4ff, #0077ff)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📡</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", color: "#fff" }}>SecureIQ Profiler</div>
          <div style={{ fontSize: 12, color: "#5a7a9a", letterSpacing: "0.5px", textTransform: "uppercase" }}>Surveillance Sales Intelligence</div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ background: "#0f1825", border: "1px solid #1e2d45", borderRadius: 16, padding: "28px", marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: "#5a7a9a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 18 }}>Research a Prospect</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#7a9abf", display: "block", marginBottom: 8 }}>Business Name</label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Greystar Real Estate Partners"
              style={{ width: "100%", boxSizing: "border-box", background: "#0a0e1a", border: "1px solid #1e2d45", borderRadius: 10, padding: "14px 16px", color: "#e8eaf0", fontSize: 15, outline: "none" }}
              onFocus={e => e.target.style.borderColor = "#00d4ff"}
              onBlur={e => e.target.style.borderColor = "#1e2d45"}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#7a9abf", display: "block", marginBottom: 8 }}>Industry</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {INDUSTRIES.map((ind) => (
                <button key={ind} onClick={() => setIndustry(ind)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: industry === ind ? "1px solid #00d4ff" : "1px solid #1e2d45", background: industry === ind ? "rgba(0,212,255,0.1)" : "#0a0e1a", color: industry === ind ? "#00d4ff" : "#7a9abf" }}>
                  {industryIcons[ind]} {ind}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleResearch} disabled={loading || !businessName.trim()} style={{ width: "100%", padding: "15px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#1e2d45" : "linear-gradient(135deg, #00d4ff, #0077ff)", color: loading ? "#5a7a9a" : "#fff", fontWeight: 700, fontSize: 15 }}>
            {loading ? "🔍 Researching..." : "Run Prospect Profile →"}
          </button>

          {error && <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)", borderRadius: 8, color: "#ff6b6b", fontSize: 13 }}>{error}</div>}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "#0f1825", border: "1px solid #1e2d45", borderRadius: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🔎</div>
            <div style={{ fontSize: 16, color: "#7a9abf", marginBottom: 8 }}>Researching {businessName}...</div>
            <div style={{ fontSize: 13, color: "#3a5a7a" }}>Pulling intel, pain points & your best pitch angle</div>
          </div>
        )}

        {profile && !loading && (
          <div style={{ background: "#0f1825", border: "1px solid #1e2d45", borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
            <div style={{ background: "linear-gradient(135deg, #0d1b2e, #0f2240)", padding: "24px 28px", borderBottom: "1px solid #1e2d45" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{profile.businessName}</div>
                  <div style={{ fontSize: 13, color: "#00d4ff" }}>{industryIcons[profile.industry]} {profile.industry} · {profile.locations} location(s)</div>
                </div>
                <div style={{ textAlign: "center", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 10, padding: "10px 18px" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#00d4ff" }}>{profile.confidenceScore}%</div>
                  <div style={{ fontSize: 10, color: "#5a7a9a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Confidence</div>
                </div>
              </div>
              <div style={{ marginTop: 16, fontSize: 14, color: "#8aaccc", lineHeight: 1.6 }}>{profile.overview}</div>
            </div>

            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 11, color: "#00d4ff", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>💬 Your Opening Line</div>
                <div style={{ fontSize: 15, color: "#e8eaf0", lineHeight: 1.6, fontStyle: "italic" }}>"{profile.openingLine}"</div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#5a7a9a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>🎯 Lead Pitch Angle</div>
                <div style={{ fontSize: 14, color: "#c8dff0", lineHeight: 1.6 }}>{profile.pitchAngle}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#5a7a9a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>⚠️ Pain Points</div>
                  {profile.securityPainPoints.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff6b35", marginTop: 6, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: "#8aaccc", lineHeight: 1.5 }}>{p}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#5a7a9a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>✅ Solutions</div>
                  {profile.recommendedSolutions.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", marginTop: 6, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: "#8aaccc", lineHeight: 1.5 }}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#5a7a9a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>🔑 Hot Buttons</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {profile.hotButtons.map((h, i) => (
                    <span key={i} style={{ padding: "6px 14px", background: "rgba(0,119,255,0.15)", border: "1px solid rgba(0,119,255,0.3)", borderRadius: 20, fontSize: 12, color: "#7ab0ff", fontWeight: 600 }}>{h}</span>
                  ))}
                </div>
              </div>

              {profile.redFlags && (
                <div style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: "#ff6b35", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>🚩 Watch Out</div>
                  <div style={{ fontSize: 13, color: "#8aaccc", lineHeight: 1.5 }}>{profile.redFlags}</div>
                </div>
              )}

              <div style={{ background: "rgba(255,210,0,0.04)", border: "1px solid rgba(255,210,0,0.2)", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#ffd200", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>📝 My Notes</div>
                  {noteSaved && <div style={{ fontSize: 11, color: "#00d4ff", fontWeight: 600 }}>✓ Saved</div>}
                </div>
                <textarea
                  value={notes[getNoteKey(profile)] || ""}
                  onChange={(e) => saveNote(getNoteKey(profile), e.target.value)}
                  placeholder="Who you spoke to, when you called, what they said, next steps..."
                  rows={4}
                  style={{ width: "100%", boxSizing: "border-box", background: "#0a0e1a", border: "1px solid rgba(255,210,0,0.15)", borderRadius: 8, padding: "12px 14px", color: "#e8eaf0", fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "rgba(255,210,0,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,210,0,0.15)"}
                />
              </div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: "#3a5a7a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Recent Searches</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {history.map((h, i) => (
                <div key={i} onClick={() => setProfile(h)} style={{ padding: "12px 16px", background: "#0f1825", border: "1px solid #1e2d45", borderRadius: 10, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 13, color: "#c8dff0", fontWeight: 600 }}>{h.businessName}</span>
                      <span style={{ fontSize: 12, color: "#3a5a7a", marginLeft: 10 }}>{h.industry}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#3a5a7a" }}>{h.timestamp}</span>
                  </div>
                  {notes[h.businessName?.toLowerCase().replace(/\s+/g, "-")] && (
                    <div style={{ marginTop: 6, fontSize: 12, color: "#7a9a5a", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      📝 {notes[h.businessName?.toLowerCase().replace(/\s+/g, "-")]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
