import React,{useState} from "react";
import axios from "axios";

function App(){
  const [file,setFile] = useState(null);
  const [text,setText]=useState("");
  const [skills,setSkills]=useState([]);
  const [jobDesc,setJobDesc]=useState("");
  const [matchedSkills,setMatchedSkills]=useState([]);
  const [missingSkills,setMissingSkills]=useState([]);
  const [atsScore,setAtsScore]=useState(0);
  const [ suggestions,setSuggestions]=useState([]);

  const handleUpload=async()=>{
    const formData = new FormData();
    formData.append("resume",file);
    formData.append("jobDescription",jobDesc);
    try{
      const response = await axios.post("http://localhost:5000/upload",formData
      );
      setText(response.data.extractedText);
      setSkills(response.data.skills);
      setMatchedSkills(response.data.matchedSkills || []);
      setMissingSkills(response.data.missingSkills || []);
      setAtsScore(response.data.atsScore || 0);
      setSuggestions(response.data.suggestions || []);
      console.log(response.data);

    }catch(error){
      console.error("Error uploading file:",error);
    }
  };
  return(
  <div style={{padding:"40px"}}>
    
    <h1>AI Resume Analyzer</h1>

    <input
      type="file"
      onChange={(e) => setFile(e.target.files[0])}
    />

    <br /><br />

    {file && (
      <p>Selected file: {file.name}</p>
    )}

    
    <textarea
    rows="10"
    cols="60"
    placeholder="paste job description here ..."
    value={jobDesc}
    onChange={(e)=>setJobDesc(e.target.value)}
    >   </textarea>
    <br /><br />

    <button onClick={handleUpload}>
      Upload Resume
    </button>

    <br /><br />

    {text && (
      <div>
        <h2>Extracted Resume Text:</h2>
        <p>{text}</p>
      </div>
    )}

    {skills.length > 0 && (
      <div>
        <h2>Detected Skills:</h2>
        <h2>ATS Score: {atsScore}%</h2>

        <ul>
          {skills.map((skill,index)=>(
            <li key={index}>{skill}</li>
          ))}
        </ul>
        <h2>Matched Skills:</h2>
        <ul>
          {matchedSkills.map((skill,index)=>(
            <li key={index}>{skill}</li>
          ))}
        </ul>
        <h2>Missing Skills:</h2>
        <ul>
          {missingSkills.map((skill,index)=>(
            <li key={index}>{skill}</li>
          ))}
        </ul>
        <h2>Suggestions:</h2>
        <ul>
          {suggestions.map((item,index)=>(
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    )}

  </div>
);
}
  export default App;

      