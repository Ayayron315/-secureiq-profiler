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
      <div style={{ background​​​​​​​​​​​​​​​​

