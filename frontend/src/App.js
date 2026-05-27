import React, { useState } from "react";
import axios from "axios";
import {Pie} from "react-chartjs-2";

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

    } catch (error) {

      console.error("Error uploading file:", error);

    }
  };

  return (

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
          style={{
            padding: "12px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          Upload Resume
        </button>

        <br /><br />

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

          <div>

            <h2>Detected Skills</h2>

            <div style={tagContainer}>
              {skills.map((skill, index) => (
                <span key={index} style={blueTag}>
                  {skill}
                </span>
              ))}
            </div>

            <h2>Matched Skills</h2>

            <div style={tagContainer}>
              {matchedSkills.map((skill, index) => (
                <span key={index} style={greenTag}>
                  {skill}
                </span>
              ))}
            </div>

            <h2>Missing Skills</h2>

            <div style={tagContainer}>
              {missingSkills.map((skill, index) => (
                <span key={index} style={redTag}>
                  {skill}
                </span>
              ))}
            </div>

            <h2>Skills Analysis Chart</h2>
            <div
            style={{
              width:"350px",
              margin:"auto"
            }}
            >
            <Pie data={chartData} />
            </div><br/>

            <h2>Suggestions</h2>

            <ul>
              {suggestions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

          </div>
        )}

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