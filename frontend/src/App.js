import React,{useState} from "react";
import axios from "axios";

function App(){
  const [file,setFile] = useState(null);
  const [text,setText]=useState("");
  const [skills,setSkills]=useState([]);
  const handleUpload=async()=>{
    const formData = new FormData();
    formData.append("resume",file);
    try{
      const response = await axios.post("http://localhost:5000/upload",formData
      );
      setText(response.data.extractedText);
      setSkills(response.data.skills);
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

        <ul>
          {skills.map((skill,index)=>(
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </div>
    )}

  </div>
);
}
  export default App;

      