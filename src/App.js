import{useState}from"react";
var K=process.env.REACT_APP_ANTHROPIC_API_KEY;
var I=["Property Management","Marina / Waterfront","Construction / Project Site","School / Education","Bank / Financial","Retail","Warehouse / Industrial","Other"];
export default function App(){
var[bn,setBn]=useState("");
var[ind,setInd]=useState("Property Management");
var[load,setLoad]=useState(false);
var[prof,setProf]=useState(null);
var[err,setErr]=useState("");
var[note,setNote]=useState("");
async function go(){
if(!bn.trim())return;
setLoad(true);setErr("");setProf(null);
try{
var r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":K,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:"You are a surveillance sales expert. Research "+bn+" in the "+ind+" industry. Return ONLY raw JSON with these fields: businessName, overview, locations, securityPainPoints (array of 3), recommendedSolutions (array of 3), pitchAngle, openingLine, hotButtons (array of 3), redFlags, confidenceScore"}]})});
var d=await r.json();
var t=d.content.map(function(i){return i.type==="text"?i.text:"";}).join("");
var m=t.match(/\{[\s\S]*\}/);
if(!m)throw new Error("no json");
setProf(JSON.parse(m[0]));
}catch(e){setErr("Error. Try again.");}
setLoad(false);
}
return React.createElement("div",{style:{minHeight:"100vh",background:"#0a0e1a",color:"#e8eaf0",fontFamily:"sans-serif",padding:"20px"}},
React.createElement("h1",{style:{color:"#00d4ff",marginBottom:"20px"}},"📡 SecureIQ Profiler"),
React.createElement("input",{value:bn,onChange:function(e){setBn(e.target.value);},placeholder:"Business name...",style:{width:"100%",padding:"12px",marginBottom:"10px",background:"#0f1825",border:"1px solid #1e2d45",borderRadius:"8px",color:"#fff",fontSize:"14px",boxSizing:"border-box"}}),
React.createElement("select",{value:ind,onChange:function(e){setInd(e.target.value);},style:{width:"100%",padding:"12px",marginBottom:"10px",background:"#0f1825",border:"1px solid #1e2d45",borderRadius:"8px",color:"#fff",fontSize:"14px",boxSizing:"border-box"}},
I.map(function(i){return React.createElement("option",{key:i,value:i},i);})),
React.createElement("button",{onClick:go,disabled:load,style:{width:"100%",padding:"14px",background:"#00d4ff",border:"none",borderRadius:"8px",color:"#000",fontWeight:"700",fontSize:"14px",cursor:"pointer",marginBottom:"20px"}},load?"Researching...":"Run Prospect Profile"),
err?React.createElement("p",{style:{color:"red"}},err):null,
prof?React.createElement("div",{style:{background:"#0f1825",border:"1px solid #1e2d45",borderRadius:"12px",padding:"20px"}},
React.createElement("h2",{style:{color:"#fff",marginBottom:"8px"}},prof.businessName),
React.createElement("p",{style:{color:"#8aaccc",marginBottom:"16px"}},prof.overview),
React.createElement("h3",{style:{color:"#00d4ff"}},"Opening Line"),
React.createElement("p",{style:{color:"#e8eaf0",fontStyle:"italic",marginBottom:"16px"}},prof.openingLine),
React.createElement("h3",{style:{color:"#00d4ff"}},"Pitch Angle"),
React.createElement("p",{style:{color:"#e8eaf0",marginBottom:"16px"}},prof.pitchAngle),
React.createElement("h3",{style:{color:"#00d4ff"}},"Pain Points"),
React.createElement("ul",{style:{color:"#8aaccc",marginBottom:"16px"}},prof.securityPainPoints&&prof.securityPainPoints.map(function(p,i){return React.createElement("li",{key:i},p);})),
React.createElement("h3",{style:{color:"#00d4ff"}},"Solutions"),
React.createElement("ul",{style:{color:"#8aaccc",marginBottom:"16px"}},prof.recommendedSolutions&&prof.recommendedSolutions.map(function(s,i){return React.createElement("li",{key:i},s);})),
React.createElement("h3",{style:{color:"#ffd200"}},"My Notes"),
React.createElement("textarea",{value:note,onChange:function(e){setNote(e.target.value);},placeholder:"Notes...",rows:4,style:{width:"100%",background:"#0a0e1a",border:"1px solid #ffd200",borderRadius:"6px",padding:"10px",color:"#fff",fontSize:"13px",boxSizing:"border-box"}})
):null
);
}