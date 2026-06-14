import{useState,useEffect}from”react”;
var IND=[“Property Management”,“Marina / Waterfront”,“Construction / Project Site”,“School / Education”,“Bank / Financial”,“Retail”,“Warehouse / Industrial”,“Other”];
var ICO={“Property Management”:“🏢”,“Marina / Waterfront”:“⚓”,“Construction / Project Site”:“🏗️”,“School / Education”:“🎓”,“Bank / Financial”:“🏦”,“Retail”:“🛍️”,“Warehouse / Industrial”:“📦”,“Other”:“🔍”};
var KEY=process.env.REACT_APP_ANTHROPIC_API_KEY;
export default function App(){
var[bn,setBn]=useState(””);
var[ind,setInd]=useState(“Property Management”);
var[load,setLoad]=useState(false);
var[prof,setProf]=useState(null);
var[err,setErr]=useState(””);
var[hist,setHist]=useState([]);
var[notes,setNotes]=useState({});
var[saved,setSaved]=useState(false);
useEffect(function(){
try{
var n=localStorage.getItem(“siq-notes”);
if(n)setNotes(JSON.parse(n));
var h=localStorage.getItem(“siq-hist”);
if(h)setHist(JSON.parse(h));
}catch(e){}
},[]);
function saveNote(k,v){
var u=Object.assign({},notes);
u[k]=v;
setNotes(u);
try{localStorage.setItem(“siq-notes”,JSON.stringify(u));setSaved(true);setTimeout(function(){setSaved(false);},2000);}catch(e){}
}
function nk(p){return p&&p.businessName?p.businessName.toLowerCase().replace(/\s+/g,”-”):“x”;}
async function go(){
if(!bn.trim())return;
setLoad(true);setErr(””);setProf(null);
var prompt=“You are a commercial surveillance sales expert. Research this business and return ONLY raw JSON, no markdown, no backticks:\n\nBusiness: “+bn+”\nIndustry: “+ind+”\n\n{"businessName":"name","industry":"”+ind+”","overview":"2-3 sentences about the business","locations":"number of locations","securityPainPoints":["pain1","pain2","pain3"],"recommendedSolutions":["solution1","solution2","solution3"],"pitchAngle":"best pitch angle","openingLine":"opening line to say","hotButtons":["word1","word2","word3"],"redFlags":"watch out for this","confidenceScore":85}”;
try{
var r=await fetch(“https://api.anthropic.com/v1/messages”,{method:“POST”,headers:{“Content-Type”:“application/json”,“x-api-key”:KEY,“anthropic-version”:“2023-06-01”,“anthropic-dangerous-direct-browser-access”:“true”},body:JSON.stringify({model:“claude-sonnet-4-6”,max_tokens:1000,tools:[{type:“web_search_20250305”,name:“web_search”}],messages:[{role:“user”,content:prompt}]})});
var d=await r.json();
var txt=d.content.map(function(i){return i.type===“text”?i.text:””;}).filter(Boolean).join(”\n”);
var m=txt.match(/{[\s\S]*}/);
if(!m)throw new Error(“no json”);
var p=JSON.parse(m[0]);
setProf(p);
var nh=[Object.assign({},p,{timestamp:new Date().toLocaleTimeString()})].concat(hist.filter(function(h){return h.businessName!==p.businessName;}).slice(0,9));
setHist(nh);
try{localStorage.setItem(“siq-hist”,JSON.stringify(nh));}catch(e){}
}catch(e){setErr(“Something went wrong. Try again.”);}
setLoad(false);
}
var s={page:{minHeight:“100vh”,background:”#0a0e1a”,color:”#e8eaf0”,fontFamily:“sans-serif”},header:{background:”#0d1b2e”,borderBottom:“1px solid #1e2d45”,padding:“20px 24px”,display:“flex”,alignItems:“center”,gap:“14px”},logo:{width:40,height:40,background:“linear-gradient(135deg,#00d4ff,#0077ff)”,borderRadius:10,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:20},card:{background:”#0f1825”,border:“1px solid #1e2d45”,borderRadius:14,padding:“24px”,marginBottom:20},input:{width:“100%”,boxSizing:“border-box”,background:”#0a0e1a”,border:“1px solid #1e2d45”,borderRadius:8,padding:“12px 14px”,color:”#e8eaf0”,fontSize:14,outline:“none”},btn:{width:“100%”,padding:“14px”,borderRadius:8,border:“none”,fontWeight:700,fontSize:14,cursor:“pointer”}};
return(
React.createElement(“div”,{style:s.page},
React.createElement(“div”,{style:s.header},
React.createElement(“div”,{style:s.logo},“📡”),
React.createElement(“div”,null,
React.createElement(“div”,{style:{fontSize:18,fontWeight:700,color:”#fff”}},“SecureIQ Profiler”),
React.createElement(“div”,{style:{fontSize:11,color:”#5a7a9a”,textTransform:“uppercase”,letterSpacing:“0.5px”}},“Surveillance Sales Intelligence”)
)
),
React.createElement(“div”,{style:{maxWidth:760,margin:“0 auto”,padding:“24px 16px”}},
React.createElement(“div”,{style:s.card},
React.createElement(“div”,{style:{fontSize:12,color:”#5a7a9a”,fontWeight:600,textTransform:“uppercase”,letterSpacing:“0.8px”,marginBottom:16}},“Research a Prospect”),
React.createElement(“div”,{style:{marginBottom:14}},
React.createElement(“label”,{style:{fontSize:12,color:”#7a9abf”,display:“block”,marginBottom:6}},“Business Name”),
React.createElement(“input”,{value:bn,onChange:function(e){setBn(e.target.value);},onKeyDown:function(e){if(e.key===“Enter”)go();},placeholder:“e.g. Greystar Real Estate”,style:s.input})
),
React.createElement(“div”,{style:{marginBottom:18}},
React.createElement(“label”,{style:{fontSize:12,color:”#7a9abf”,display:“block”,marginBottom:8}},“Industry”),
React.createElement(“div”,{style:{display:“flex”,flexWrap:“wrap”,gap:6}},
IND.map(function(i){return React.createElement(“button”,{key:i,onClick:function(){setInd(i);},style:{padding:“7px 12px”,borderRadius:6,fontSize:12,cursor:“pointer”,border:ind===i?“1px solid #00d4ff”:“1px solid #1e2d45”,background:ind===i?“rgba(0,212,255,0.1)”:”#0a0e1a”,color:ind===i?”#00d4ff”:”#7a9abf”}},ICO[i]+” “+i);})
)
),
React.createElement(“button”,{onClick:go,disabled:load||!bn.trim(),style:Object.assign({},s.btn,{background:load||!bn.trim()?”#1e2d45”:“linear-gradient(135deg,#00d4ff,#0077ff)”,color:load||!bn.trim()?”#5a7a9a”:”#fff”})},load?“Researching…”:“Run Prospect Profile”),
err?React.createElement(“div”,{style:{marginTop:12,padding:“10px 14px”,background:“rgba(255,60,60,0.1)”,border:“1px solid rgba(255,60,60,0.3)”,borderRadius:6,color:”#ff6b6b”,fontSize:12}},err):null
),
load?React.createElement(“div”,{style:Object.assign({},s.card,{textAlign:“center”,padding:“40px”})},
React.createElement(“div”,{style:{fontSize:32,marginBottom:12}},“🔎”),
React.createElement(“div”,{style:{fontSize:14,color:”#7a9abf”}},“Researching “+bn+”…”),
React.createElement(“div”,{style:{fontSize:12,color:”#3a5a7a”,marginTop:6}},“Pulling intel and your best pitch angle”)
):null,
prof&&!load?React.createElement(“div”,{style:Object.assign({},s.card,{padding:0,overflow:“hidden”})},
React.createElement(“div”,{style:{background:“linear-gradient(135deg,#0d1b2e,#0f2240)”,padding:“20px 24px”,borderBottom:“1px solid #1e2d45”}},
React.createElement(“div”,{style:{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,flexWrap:“wrap”,gap:10}},
React.createElement(“div”,null,
React.createElement(“div”,{style:{fontSize:20,fontWeight:700,color:”#fff”,marginBottom:4}},prof.businessName),
React.createElement(“div”,{style:{fontSize:12,color:”#00d4ff”}},ICO[prof.industry]+” “+prof.industry+” · “+prof.locations+” location(s)”)
),
React.createElement(“div”,{style:{textAlign:“center”,background:“rgba(0,212,255,0.1)”,border:“1px solid rgba(0,212,255,0.3)”,borderRadius:8,padding:“8px 16px”}},
React.createElement(“div”,{style:{fontSize:22,fontWeight:800,color:”#00d4ff”}},prof.confidenceScore+”%”),
React.createElement(“div”,{style:{fontSize:10,color:”#5a7a9a”,textTransform:“uppercase”}},“Confidence”)
)
),
React.createElement(“div”,{style:{marginTop:12,fontSize:13,color:”#8aaccc”,lineHeight:1.6}},prof.overview)
),
React.createElement(“div”,{style:{padding:“20px 24px”,display:“flex”,flexDirection:“column”,gap:20}},
React.createElement(“div”,{style:{background:“rgba(0,212,255,0.05)”,border:“1px solid rgba(0,212,255,0.2)”,borderRadius:10,padding:“16px”}},
React.createElement(“div”,{style:{fontSize:11,color:”#00d4ff”,fontWeight:700,textTransform:“uppercase”,letterSpacing:“0.8px”,marginBottom:8}},“💬 Opening Line”),
React.createElement(“div”,{style:{fontSize:14,color:”#e8eaf0”,lineHeight:1.6,fontStyle:“italic”}},’”’+prof.openingLine+’”’)
),
React.createElement(“div”,null,
React.createElement(“div”,{style:{fontSize:11,color:”#5a7a9a”,fontWeight:700,textTransform:“uppercase”,letterSpacing:“0.8px”,marginBottom:8}},“🎯 Pitch Angle”),
React.createElement(“div”,{style:{fontSize:13,color:”#c8dff0”,lineHeight:1.6}},prof.pitchAngle)
),
React.createElement(“div”,{style:{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:16}},
React.createElement(“div”,null,
React.createElement(“div”,{style:{fontSize:11,color:”#5a7a9a”,fontWeight:700,textTransform:“uppercase”,letterSpacing:“0.8px”,marginBottom:10}},“⚠️ Pain Points”),
prof.securityPainPoints.map(function(p,i){return React.createElement(“div”,{key:i,style:{display:“flex”,gap:8,marginBottom:8}},React.createElement(“div”,{style:{width:5,height:5,borderRadius:“50%”,background:”#ff6b35”,marginTop:5,flexShrink:0}}),React.createElement(“div”,{style:{fontSize:12,color:”#8aaccc”,lineHeight:1.5}},p));})
),
React.createElement(“div”,null,
React.createElement(“div”,{style:{fontSize:11,color:”#5a7a9a”,fontWeight:700,textTransform:“uppercase”,letterSpacing:“0.8px”,marginBottom:10}},“✅ Solutions”),
prof.recommendedSolutions.map(function(s,i){return React.createElement(“div”,{key:i,style:{display:“flex”,gap:8,marginBottom:8}},React.createElement(“div”,{style:{width:5,height:5,borderRadius:“50%”,background:”#00d4ff”,marginTop:5,flexShrink:0}}),React.createElement(“div”,{style:{fontSize:12,color:”#8aaccc”,lineHeight:1.5}},s));})
)
),
React.createElement(“div”,null,
React.createElement(“div”,{style:{fontSize:11,color:”#5a7a9a”,fontWeight:700,textTransform:“uppercase”,letterSpacing:“0.8px”,marginBottom:8}},“🔑 Hot Buttons”),
React.createElement(“div”,{style:{display:“flex”,gap:6,flexWrap:“wrap”}},
prof.hotButtons.map(function(h,i){return React.createElement(“span”,{key:i,style:{padding:“5px 12px”,background:“rgba(0,119,255,0.15)”,border:“1px solid rgba(0,119,255,0.3)”,borderRadius:16,fontSize:11,color:”#7ab0ff”,fontWeight:600}},h);})
)
),
prof.redFlags?React.createElement(“div”,{style:{background:“rgba(255,107,53,0.05)”,border:“1px solid rgba(255,107,53,0.2)”,borderRadius:8,padding:“12px 14px”}},
React.createElement(“div”,{style:{fontSize:11,color:”#ff6b35”,fontWeight:700,textTransform:“uppercase”,letterSpacing:“0.8px”,marginBottom:6}},“🚩 Watch Out”),
React.createElement(“div”,{style:{fontSize:12,color:”#8aaccc”,lineHeight:1.5}},prof.redFlags)
):null,
React.createElement(“div”,{style:{background:“rgba(255,210,0,0.04)”,border:“1px solid rgba(255,210,0,0.2)”,borderRadius:10,padding:“16px”}},
React.createElement(“div”,{style:{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:8}},
React.createElement(“div”,{style:{fontSize:11,color:”#ffd200”,fontWeight:700,textTransform:“uppercase”,letterSpacing:“0.8px”}},“📝 My Notes”),
saved?React.createElement(“div”,{style:{fontSize:11,color:”#00d4ff”,fontWeight:600}},“Saved”):null
),
React.createElement(“textarea”,{value:notes[nk(prof)]||””,onChange:function(e){saveNote(nk(prof),e.target.value);},placeholder:“Who you spoke to, next steps, what they said…”,rows:4,style:{width:“100%”,boxSizing:“border-box”,background:”#0a0e1a”,border:“1px solid rgba(255,210,0,0.15)”,borderRadius:6,padding:“10px 12px”,color:”#e8eaf0”,fontSize:12,lineHeight:1.6,resize:“vertical”,outline:“none”,fontFamily:“sans-serif”}})
)
)
):null,
hist.length>0?React.createElement(“div”,null,
React.createElement(“div”,{style:{fontSize:11,color:”#3a5a7a”,fontWeight:700,textTransform:“uppercase”,letterSpacing:“0.8px”,marginBottom:10}},“Recent Searches”),
hist.map(function(h,i){return React.createElement(“div”,{key:i,onClick:function(){setProf(h);},style:{padding:“10px 14px”,background:”#0f1825”,border:“1px solid #1e2d45”,borderRadius:8,cursor:“pointer”,marginBottom:6}},
React.createElement(“div”,{style:{display:“flex”,justifyContent:“space-between”,alignItems:“center”}},
React.createElement(“div”,null,
React.createElement(“span”,{style:{fontSize:12,color:”#c8dff0”,fontWeight:600}},h.businessName),
React.createElement(“span”,{style:{fontSize:11,color:”#3a5a7a”,marginLeft:8}},h.industry)
),
React.createElement(“span”,{style:{fontSize:10,color:”#3a5a7a”}},h.timestamp)
),
notes[h.businessName?h.businessName.toLowerCase().replace(/\s+/g,”-”):“x”]?React.createElement(“div”,{style:{marginTop:4,fontSize:11,color:”#7a9a5a”,fontStyle:“italic”,overflow:“hidden”,textOverflow:“ellipsis”,whiteSpace:“nowrap”}},“📝 “+notes[h.businessName.toLowerCase().replace(/\s+/g,”-”)]):null
);})
):null
)
)
);
}
