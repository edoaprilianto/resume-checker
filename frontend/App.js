import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error uploading file", error);
    }
  };

  return (
    <div>
      <h1>ATS Resume Matcher</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Resume</button>

      {data && (
        <div>
          <h2>Extracted Information</h2>
          <p><strong>Name:</strong> {data.extracted_info.name}</p>
          <p><strong>Email:</strong> {data.extracted_info.email}</p>
          <p><strong>Phone:</strong> {data.extracted_info.phone}</p>
          <p><strong>Skills:</strong> {data.extracted_info.skills}</p>

          <h2>Job Matches</h2>
          <ul>
            {data.job_matches.map((job, index) => (
              <li key={index}>
                {job.title} - {job.match_score}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
