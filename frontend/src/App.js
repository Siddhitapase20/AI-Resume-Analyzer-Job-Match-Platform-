import React, { useState,useEffect } from "react";
import axios from "axios";
import {Pie} from "react-chartjs-2";
import jsPDF from "jspdf";


import{
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function App() {

  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [skills, setSkills] = useState([]);
  const [jobDesc, setJobDesc] = useState("");
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [atsScore, setAtsScore] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [loading,setLoading]=useState(false);
  const [aiResponse,setAiResponse]=useState("");
  const leftMargin = 15;
  const rightWidth=180;
  const [theme,setTheme]=useState("light");
  const [displayScore, setDisplayScore] = useState(0);
  const chartData={
    labels:["Matched Skills","Missing Skills"],
    datasets:[
      {
        label:"Skills",
        data:[matchedSkills.length,missingSkills.length],
        backgroundColor:["green","red"],
        borderWidth:1
      }
    ]
  };
  useEffect(()=>{
    document.documentElement.setAttribute("data-theme",theme);
  },[]);
  useEffect(()  => {
    if(atsScore===0)return;
    let start=0;
    const duration=1000;
    const increment=atsScore/(duration/16);
    const timer=setInterval(()=>{
      start+=increment;
      if(start>=atsScore){
        setDisplayScore(atsScore);
        clearInterval(timer);
      }else{
        setDisplayScore(Math.floor(start));
      }
      },16);
      return()=>clearInterval(timer);
  },[atsScore]);

  const toggleTheme=()=>{
    const next=theme==='light'?'dark':'light';
    setTheme(next);
    document.documentElement.setAttribute("data-theme",next);
  };
  const handleUpload = async () => {
    if(!file){
      alert("Please upload a reusme");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    
    formData.append("resume", file);
    formData.append("jobDescription", jobDesc);
    try {

      const response = await axios.post("http://localhost:5000/upload", formData);

      setText(response.data.extractedText);
      setSkills(response.data.skills);
      setMatchedSkills(response.data.matchedSkills || []);
      setMissingSkills(response.data.missingSkills || []);
      setAtsScore(response.data.atsScore || 0);
      setSuggestions(response.data.suggestions || []);
      setAiResponse(response.data.aiResponse);

    } catch (error) {

      console.error("Error uploading file:", error);
    }finally{
      setLoading(false);
    }
  };

  // Download pdf 
  const downloadPDF=()=>{
    if(!aiResponse){
      alert("No analysis available");
      return;
    }
    const doc=new jsPDF({
      orientation:"portrait",
      unit:"mm",
      format:"a4"
    });
    let y=20;
    const pageHeight=280;

    // TITTLE
    doc.setFont("helvetica","bold");
    doc.setFontSize(24);
    doc.setTextColor(40,40,40);
    doc.text("AI Resume Analysis Report",20,y);
    y+=15;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Date: ${new Date().toLocaleDateString()}`,leftMargin,y);

    y+=10;

    //LINE 
    doc.setDrawColor(200);
    doc.line(20,y,190,y);
    y+=15;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204); 
    doc.text("ATS Score",leftMargin, y);


    doc.setFont("helvetica", "normal"); 
    doc.setTextColor(0, 0, 0); 
    doc.text(`${atsScore}%`,60,y);
    y += 15;

    doc.setFontSize(14);
    doc.text("Matched Skills:",leftMargin, y);
    y+=10;
    const matched=doc.splitTextToSize(matchedSkills.join(", "),170);
    doc.text(matched,leftMargin, y);
    y+=matched.length*8+10;
    doc.text("Missing Skills:",leftMargin, y);
    y+=10;
    const missing=doc.splitTextToSize(missingSkills.join(", "),170);
    doc.text(missing,leftMargin,y);
    y+=missing.length*8+10;
    
    //SUGGESTIONS
    doc.setFont("helvetica", "bold"); 
    doc.setTextColor(255, 140, 0); 
    doc.text("Suggestions", leftMargin, y); 
    y += 10;
    doc.setFont("helvetica", "normal"); 
    doc.setTextColor(40, 40, 40); 
    suggestions.forEach((item) => { 
      const lines = doc.splitTextToSize( `• ${item}`, 165 ); 
      if (y > pageHeight) { 
        doc.addPage(); 
        y = 20; } 
        doc.text(lines, leftMargin, y); 
    y += lines.length * 7 + 5; }); 
    y += 10;

      // AI ANALYSIS
      doc.setFont("helvetica", "bold"); 
      doc.setFontSize(15);
      doc.setTextColor(102, 51, 153); 
      doc.text("Complete AI Analysis", leftMargin, y); 
      y += 10; 
      
      doc.setFont("helvetica", "normal");
doc.setTextColor(30, 30, 30);
doc.setFontSize(12);

const analysisLines = aiResponse.split("\n");

const headings = [
  "summary",
  "match to job description",
  "important missing skills",
  "weaknesses",
  "improvement suggestions",
  "best projects",
  "technical interview questions",
  "final hiring recommendation"
];

analysisLines.forEach((line) => {

  const cleanLine = line.replace(/\*\*/g, "").replace(/^#+/g, "").trim();

  const isHeading = headings.some((heading) =>
    cleanLine.toLowerCase().startsWith(heading)
  );

  if (isHeading) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
  }

  const wrappedText = doc.splitTextToSize(cleanLine, rightWidth);

  if (y + wrappedText.length * 7 > 280) {
    doc.addPage();
    y = 20;
  }

  doc.text(wrappedText, leftMargin, y);
  y += wrappedText.length * 7 + 3;
});

doc.save("resume_analysis_report.pdf");
  };

  return (
    <div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500&display=swap');
      :root{
      --accent: #5b4cdd;
      --accent-light: #ede9ff;
      --bg: #f0f2f7;
      --surface: #ffffff;
      --surface2: #f5f6fa;
      --text: #0d0f12;
      --text2: #5a6270;
      --border: #e2e6ea;
      --green: #1a9e5c;
      --green-light: #d4f7e7;
      --red: #e03e3e;
      --red-light: #fdeaea;
      --blue-light: #dbeafe;
      --shadow: 0 2px 16px rgba(0,0,0,0.07);
      }
      [data-theme="dark"]{
      --bg:#0f1117;
      --surface:#1a1d27;
      --surface2:#22263a;
      --text:#f0f2ff;
      --text2: #8b91a8;
      --border:#2e3348;
      --accent-light: #2d2660;
      --green-light: #0d2e1e;
      --red-light: #2e1010;
      --blue-light: #1e2a45;
      --shadow: 0 2px 16px rgba(0,0,0,0.3);}
        body{
        background: var(--bg);
        font-family:'DM Sans', sans-serif;
        color: var(--text);
        transition: background 0.3s ease, color 0.3s ease;
        }
        h1,h2,h3{
          font-family:'Syne', sans-serif;}
        textarea{
        background: var(--surface2) !important;
        color: var(--text) !important;
        border: 1.5px solid var(--border) !important;
        font-family:'DM Sans', sans-serif !important;
        resize: vertical;
        outline:none;
        transition: border 0.2s ease;
        }

        textarea:focus{
          border-color: var(--accent) !important;
        }
        button:hover{
        opacity: 0.88;
        transform: translateY(-1px);
        transition: all 0.15s ease;
        }
        
        @keyframes float1 {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(-20px, -20px); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(-25px, 35px); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(20px, 25px); }
        }
          `} 
      
      </style>

          {/* ── OUTER WRAPPER ── */}
      <div style={{ background: "var(--bg)", minHeight: "100vh", transition: "background 0.3s ease" }}>

        {/* background orbs */}
        <div style={{
          position: "fixed", top:0, left: 0,
          width: "100%", height: "100%", zIndex:0
        }}>
          {/* orb1- top left */}
          <div style={{
            position: "absolute", top:"10%", left:"5%",
            width: "400px", height: "400px",borderRadius: "50%",
            background: "radial-gradient(circle,rgba(91,76,221,0.12) 0%, transparent 70%)",
            animation:" float1 8s ease-in-out infinite",
          }} />
            {/* orb2- top right */}
          <div style={{
            position: "absolute", top:"5%", right:"5%",
            width: "300px", height: "300px",borderRadius: "50%",
            background: "radial-gradient(circle,rgba(26,158,92,0.10) 0%, transparent 70%)",
            animation:" float2 10s ease-in-out infinite",
          }}/>
          {/* orb3- bottom center */}
          <div style={{
            position: "absolute", bottom:"10%", left:"40%",
            width: "350px", height: "350px",borderRadius: "50%",
            background: "radial-gradient(circle,rgba(224,62,62,0.07) 0%, transparent 70%)",
            animation:" float3 12s ease-in-out infinite",
          }}/>
          </div> 
          
        {/* ── NAVBAR ── */}
        <nav style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 40px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 12px rgba(0,0,0,0.06)"
        }}>
 
          {/* LOGO */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "var(--accent)", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ color: "white", fontSize: "16px" }}>⚡</span>
            </div>
            <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "20px", color: "var(--accent)" }}>
              ResumeAI
            </span>
          </div>
 
          {/* DARK MODE BUTTON */}
          <button onClick={toggleTheme} style={{
            background: "var(--surface2)",
            border: "1.5px solid var(--border)",
            borderRadius: "999px",
            padding: "8px 18px",
            cursor: "pointer",
            color: "var(--text2)",
            fontSize: "13px",
            fontFamily: "DM Sans",
            fontWeight: 500
          }}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
 
        </nav>
 
        {/* ── MAIN ── */}
        <main style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px",
          position: "relative", zIndex: 1
         }}>
 
          {/* HERO */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h1 style={{ fontSize: "36px", fontWeight: 700, color: "var(--text)", marginBottom: "10px" }}>
              AI Resume{" "}
              <span style={{ color: "var(--accent)" }}>Analyzer</span>
            </h1>
            <p style={{ color: "var(--text2)", fontSize: "15px" }}>
              Upload your resume and paste a job description to get instant AI-powered insights
            </p>
          </div>
 
          {/* ── UPLOAD CARD ── */}
          <div style={{
            background: "var(--surface)",
            borderRadius: "16px",
            padding: "30px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow)",
            marginBottom: "24px"
          }}>
 
            {/* FILE INPUT */}
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ color: "var(--text)" }}
            />
 
            <br /><br />
 
            {file && (
              <p style={{ color: "var(--text2)", fontSize: "14px", marginBottom: "12px" }}>
                 Selected: <strong style={{ color: "var(--text)" }}>{file.name}</strong>
              </p>
            )}
 
            {/* JOB DESCRIPTION TEXTAREA */}
            <textarea
              rows="8"
              placeholder="Paste Job Description Here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              style={{ padding: "12px", borderRadius: "10px", width: "100%", fontSize: "14px" }}
            />
 
            <br /><br />
 
            {/* BUTTONS ROW */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
 
              <button
                onClick={handleUpload}
                disabled={loading}
                style={{
                  padding: "12px 28px",
                  background: loading ? "var(--border)" : "var(--accent)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "DM Sans",
                  fontWeight: 500,
                  fontSize: "15px"
                }}
              >
                {loading ? "⏳ Analyzing..." : "🚀 Analyze Resume"}
              </button>
 
              <button
                onClick={downloadPDF}
                disabled={!aiResponse}

                style={{
                  padding: "12px 28px",
                  background: "var(--green)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontFamily: "DM Sans",
                  fontWeight: 500,
                  fontSize: "15px"
                }}
              >
                 Download PDF Report
              </button>
 
            </div>
 
          </div>
 
          {/* ── DASHBOARD CARDS ── */}
          {aiResponse || skills.length > 0 && (
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
 
              {/* ATS SCORE CARD */}
              <div style={cardStyle}>
                <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "6px", fontWeight: 500 }}>ATS SCORE</p>
                <h2 style={{
                  fontSize: "32px", fontWeight: 700,
                  color: atsScore >= 80 ? "var(--green)" : atsScore >= 60 ? "var(--amber: #f59e0b)" : "var(--red)"
                }}>
                  {displayScore}%
                </h2>
                <div style={{
                  width: "100%", background: "var(--border)",
                  borderRadius: "999px", overflow: "hidden", marginTop: "10px", height: "8px"
                }}>
                  <div style={{
                    width: `${displayScore}%`,
                    background: atsScore >= 80 ? "var(--green)" : atsScore >= 60 ? "var(--amber: #f59e0b)" : "var(--red)",
                    height: "8px", borderRadius: "999px",
                    transition: "width 1s ease"
                  }} />
                </div>
              </div>
 
              {/* DETECTED SKILLS CARD */}
              <div style={cardStyle}>
                <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "6px", fontWeight: 500 }}>DETECTED SKILLS</p>
                <h2 style={{ fontSize: "32px", fontWeight: 700, color: "var(--accent)" }}>{skills.length}</h2>
              </div>
 
              {/* MATCHED SKILLS CARD */}
              <div style={cardStyle}>
                <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "6px", fontWeight: 500 }}>MATCHED SKILLS</p>
                <h2 style={{ fontSize: "32px", fontWeight: 700, color: "var(--green)" }}>{matchedSkills.length}</h2>
              </div>
 
              {/* MISSING SKILLS CARD */}
              <div style={cardStyle}>
                <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "6px", fontWeight: 500 }}>MISSING SKILLS</p>
                <h2 style={{ fontSize: "32px", fontWeight: 700, color: "var(--red)" }}>{missingSkills.length}</h2>
              </div>
 
            </div>
          )}
 
          {/* ── SKILLS SECTIONS ── */}
          {(aiResponse || skills.length > 0) && (
            <div>
 
              {/* DETECTED SKILLS */}
              <div style={sectionBox}>
                <h2 style={sectionTitle}>🔍 Detected Skills</h2>
                <div style={tagContainer}>
                  {skills.map((skill, i) => (
                    <span key={i} style={blueTag}>{skill}</span>
                  ))}
                </div>
              </div>
 
              {/* MATCHED SKILLS */}
              <div style={sectionBox}>
                <h2 style={sectionTitle}>✅ Matched Skills</h2>
                <div style={tagContainer}>
                  {matchedSkills.map((skill, i) => (
                    <span key={i} style={greenTag}>{skill}</span>
                  ))}
                </div>
              </div>
 
              {/* MISSING SKILLS */}
              <div style={sectionBox}>
                <h2 style={sectionTitle}>⚠️ Missing Skills</h2>
                <div style={tagContainer}>
                  {missingSkills.map((skill, i) => (
                    <span key={i} style={redTag}>{skill}</span>
                  ))}
                </div>
              </div>
 
              {/* PIE CHART */}
              <div style={sectionBox}>
                <h2 style={sectionTitle}>📊 Skills Analysis Chart</h2>
                <div style={{ width: "320px", margin: "auto" }}>
                  <Pie data={chartData} />
                </div>
              </div>
 
              {/* SUGGESTIONS */}
              <div style={sectionBox}>
                <h2 style={sectionTitle}>💡 Suggestions</h2>
                <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {suggestions.map((item, i) => (
                    <li key={i} style={{ color: "var(--text2)", lineHeight: "1.6" }}>{item}</li>
                  ))}
                </ul>
                {loading && <h3 style={{ color: "var(--text2)", marginTop: "12px" }}>Analyzing with AI...</h3>}
              </div>
 
              {/* AI ANALYSIS */}
<div style={sectionBox}>
  <h2 style={sectionTitle}>🤖 AI Analysis</h2>

  <div
    style={{
      background: "var(--surface2)",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid var(--border)"
    }}
  >
    <div
      style={{
        whiteSpace: "pre-wrap",
        lineHeight: "1.8"
      }}
    >
      {aiResponse}
    </div>
  </div>
</div>

</div>
)}

</main>
</div>
</div>
);
}
 
/* ── STYLES ── */
 
const cardStyle = {
  background: "var(--surface)",
  padding: "20px 24px",
  borderRadius: "14px",
  flex: "1",
  minWidth: "160px",
  textAlign: "center",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow)"
};
 
const sectionBox = {
  background: "var(--surface)",
  padding: "24px",
  borderRadius: "16px",
  marginBottom: "20px",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow)"
};
 
const sectionTitle = {
  fontSize: "18px",
  fontWeight: 700,
  color: "var(--text)",
  marginBottom: "16px"
};
 
const tagContainer = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px"
};
 
const blueTag = {
  background: "var(--blue-light)",
  color: "var(--accent)",
  padding: "7px 14px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 500
};
 
const greenTag = {
  background: "var(--green-light)",
  color: "var(--green)",
  padding: "7px 14px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 500
};
 
const redTag = {
  background: "var(--red-light)",
  color: "var(--red)",
  padding: "7px 14px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 500
};

export default App;
