import React, { useState } from "react";
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

      const response = await axios.post(
        "http://localhost:5000/upload",
        formData
      );

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
    const doc=new jsPDF();
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
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`,20,y);
    y+=10;

    //LINE 
    doc.setDrawColor(200);
    doc.line(20,y,190,y);
    y+=15;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204); 
    doc.text("ATS Score", 20, y);


    doc.setFont("helvetica", "normal"); 
    doc.setTextColor(0, 0, 0); 
    doc.text(`${atsScore}%`, 70, y); 
    y += 15;

    doc.setFontSize(14);
    doc.text("Matched Skills:",20,y);
    y+=10;
    const matched=doc.splitTextToSize(matchedSkills.join(", "),170);
    doc.text(matched,20,y);
    y+=matched.length*8+10;
    doc.text("Missing Skills:",20,y);
    y+=10;
    const missing=doc.splitTextToSize(missingSkills.join(", "),170);
    doc.text(missing,20,y);
    y+=missing.length*8+10;
    
    //SUGGESTIONS
    doc.setFont("helvetica", "bold"); 
    doc.setTextColor(255, 140, 0); 
    doc.text("Suggestions", 20, y); 
    y += 10;
    doc.setFont("helvetica", "normal"); 
    doc.setTextColor(40, 40, 40); 
    suggestions.forEach((item) => { 
      const lines = doc.splitTextToSize( `• ${item}`, 165 ); 
      if (y > pageHeight) { 
        doc.addPage(); 
        y = 20; } 
        doc.text(lines, 25, y); 
    y += lines.length * 7 + 5; }); 
    y += 10;

      // AI ANALYSIS
      doc.setFont("helvetica", "bold"); 
      doc.setFontSize(15);
      doc.setTextColor(102, 51, 153); 
      doc.text("Complete AI Analysis", 20, y); 
      y += 10; 
      doc.setFont("helvetica", "normal");
doc.setTextColor(30, 30, 30);
doc.setFontSize(12);

const analysisLines = aiResponse.split("\n");

analysisLines.forEach((line) => {

    const headingKeywords = [
      "Summary",
      "Match to Job Description",
      "Important Missing Skills",
      "Weaknesses",
      "Improvement Suggestions",
      "Best Projects",
      "Technical Interview Questions",
      "Final Hiring Recommendation"
    ];

    const isHeading = headingKeywords.some(h =>
  line.trim().startsWith(h)
);

    if (isHeading) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
    }

    const wrappedText = doc.splitTextToSize(line, 160);

    if (y + wrappedText.length * 7 > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(wrappedText, 20, y);
    y += wrappedText.length * 7 + 3;
  });

  doc.save("resume_analysis_report.pdf");
};

  

  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500&display=swap');
      :root{
      --accent:#5b4cdd;
      --bg:#f7f8fa;
      --surface:#ffffff;
      --text:#0d0f12;
      --text2: #5a6270;
      --border:#e2e6ea;}
      [data-theme="dark"]{
      --bg:#1a1d27;
      --surface:#1a1f2e;
      --text:#f0f2ff;
      --text2: #8b91a8;
      --border:#2e3348;}
        body{
        background: var(--bg);
        font-family:'DM Sans', sans-serif;
        transition: all 0.2s ease;
        }
        h1,h2,h3{
          font-family:'Syne', sans-serif;}
        `}
      </style>
    
    <div
      style={{
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial"
      }}
    >

      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.1)"
        }}
      >

        <h1 style={{ textAlign: "center" }}>
          AI Resume Analyzer
        </h1>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br /><br />

        {file && (
          <p>
            Selected file: {file.name}
          </p>
        )}

        <textarea
          rows="8"
          cols="80"
          placeholder="Paste Job Description Here..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "10px",
            width: "100%"
          }}
        />

        <br /><br />

        <button
  onClick={handleUpload}
  disabled={loading}
  style={{
    padding: "12px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "10px",
    opacity: loading ? 0.6 : 1,
    cursor: loading ? "not-allowed" : "pointer"
  }}
>
  {loading ? "Analyzing..." : "Upload Resume"}
</button>

        <br /><br />

        {/* DOWNLOAD BUTTON */}
        <button
        onClick={downloadPDF}
        style={{
          padding:"12px 20px",
          backgroundColor: "#28a745",
          color:"white",
          border:"none",
          borderRadius:"10px",
          cursor:"pointer",
          marginLeft:"10px"}}
          >
          Download PDF Report
        </button>

        {/* DASHBOARD CARDS */}

        {skills.length > 0 && (

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "20px",
              flexWrap: "wrap"
            }}
          >

            <div style={cardStyle}>
              <h2>{atsScore}%</h2>
              <div 
              style={{
                width:"100%",
                backgroundColor:"#ddd",
                borderRadius:"10px",
                overflow:"hidden",
                marginTop:"10px"
              }}
              >
                <div
                style={{
                  width:`${atsScore}%`,
                  backgroundColor: atsScore >= 80 ? "#28a745" : atsScore >= 60 ? "#ffc107" : "#dc3545",
                  height:"12px"
                }}
                ></div>
                </div>
                <p>ATS Score</p>

              
            </div>

            <div style={cardStyle}>
              <h2>{skills.length}</h2>
              <p>Detected Skills</p>
            </div>

            <div style={cardStyle}>
              <h2>{matchedSkills.length}</h2>
              <p>Matched Skills</p>
            </div>

            <div style={cardStyle}>
              <h2>{missingSkills.length}</h2>
              <p>Missing Skills</p>
            </div>

          </div>
        )}

        <br />

        {/* SKILLS SECTION */}

        {skills.length > 0 && (

          <div style={sectionBox}>

            <h2>Detected Skills</h2>

            <div style={tagContainer}>
              {skills.map((skill, index) => (
                <span key={index} style={blueTag}>
                  {skill}
                </span>
              ))}
            </div>

            <div style={sectionBox}>   
            <h2>Matched Skills</h2>

            <div style={tagContainer}>
              {matchedSkills.map((skill, index) => (
                <span key={index} style={greenTag}>
                  {skill}
                </span>
              ))}
            </div>
            </div>

            <div style={sectionBox}>
            <h2>Missing Skills</h2>

            <div style={tagContainer}>
              {missingSkills.map((skill, index) => (
                <span key={index} style={redTag}>
                  {skill}
                </span>
              ))}
            </div>
            </div>
            
            <div style={sectionBox}>
            <h2>Skills Analysis Chart</h2>
            <div
            style={{
              width:"350px",
              margin:"auto"
            }}
            >
            <Pie data={chartData} />
            </div></div><br/>

            <div style={sectionBox}>
            <h2>Suggestions</h2>

            <ul>
              {suggestions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            {loading && <h3>Analyzing with AI...</h3>}</div>

            <div style={sectionBox}>
            <h2>AI Analysis</h2>

<div
  style={{
    background: "#f5f5f5",
    padding: "20px",
    borderRadius: "10px"
  }}
>
  <pre
    style={{
      whiteSpace: "pre-wrap",
      lineHeight: "1.8",
      color: "#333",
      fontSize: "15px",
      fontFamily: "DM Sans",
      background: "#fff",
      padding: "15px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      overflowX: "auto"
    }}
  >
    {aiResponse}
    </pre>
</div>
</div>

</div>
)}

</div>
</div>
</div>
);
}
/* CARD STYLE */

const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  width: "180px",
  textAlign: "center",
  boxShadow: "0px 0px 8px rgba(0,0,0,0.1)"
};

// section box
const sectionBox={
  background:"#fff",
  padding:"20px",
  borderRadius:"14px",
  marginBottom:"20px",
  border:"1px solid #e5e7eb",
  boxShadow:"0px 2px 8px rgba(0,0,0,0.5)"
};

/* TAG CONTAINER */

const tagContainer = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "20px"
};

/* TAGS */

const blueTag = {
  backgroundColor: "#d0e7ff",
  padding: "8px 14px",
  borderRadius: "20px"
};

const greenTag = {
  backgroundColor: "#d4f8d4",
  padding: "8px 14px",
  borderRadius: "20px"
};

const redTag = {
  backgroundColor: "#ffd6d6",
  padding: "8px 14px",
  borderRadius: "20px"
};

export default App;