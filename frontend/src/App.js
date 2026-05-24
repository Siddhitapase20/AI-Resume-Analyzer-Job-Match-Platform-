import React,{useState} from "react";
import axios from "axios";

function App(){
  const [file,setFile] = useState(null);
  const handleUpload=async()=>{
    const formData = new FormData();
    formData.append("resume",file);
    try{
      const response = await axios.post("http://localhost:5000/upload",formData
      );
      console.log(response.data);
    }catch(error){
      console.error("Error uploading file:",error);
    }
  };
  return(
    <div style={{padding:"40px"}}>
      <h1>AI Resume Analyzer</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])}/>
      <br /><br />
      {file && <p>Selected file: {file.name}</p>}
      <button onClick={handleUpload}>Upload Resume</button>
    </div>
  );
}
  export default App;

      