import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  LinearProgress,
} from "@mui/material";
import { CloudUpload, CheckCircle } from "@mui/icons-material";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setData(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error uploading file", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" style={{ textAlign: "center", marginTop: "40px" }}>
      <Typography variant="h4" gutterBottom>
        ATS Resume Matcher
      </Typography>

      <Typography variant="h5" gutterBottom>
        Job Requirement :
      </Typography>

      <Typography variant="body1" style={{ marginTop: "10px" }}>
        Software Engineer - Python, FastAPI, Machine Learning
      </Typography>

      <Typography variant="body1" style={{ marginTop: "10px" }}>
       Data Scientist - Python, NLP, Data Analysis
      </Typography>

      <Typography variant="body1" style={{ marginTop: "10px", marginBottom:"20px" }}>
      Frontend Developer - React.js, JavaScript, UI/UX
      </Typography>


      <input
        type="file"
        accept=".pdf,.docx"
        style={{ display: "none" }}
        id="upload-resume"
        onChange={handleFileChange}
      />
      <label htmlFor="upload-resume">
        <Button variant="contained" component="span" startIcon={<CloudUpload />}>
          Upload Resume
        </Button>
      </label>

      {file && (
        <Typography variant="body1" color="textSecondary" style={{ marginTop: "10px" }}>
          {file.name}
        </Typography>
      )}

      <div style={{ marginTop: "20px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Process Resume"}
        </Button>
      </div>

      {loading && (
        <div style={{ marginTop: "20px" }}>
          <CircularProgress />
          <Typography variant="body2" color="textSecondary">
            Processing resume...
          </Typography>
        </div>
      )}

      {data && (
        <div style={{ marginTop: "30px" }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Extracted Information
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong> {data.extracted_info.name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {data.extracted_info.email}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong> {data.extracted_info.phone}
              </Typography>
              <Typography variant="body1">
                <strong>Skills:</strong> {data.extracted_info.skills}
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h5" gutterBottom style={{ marginTop: "30px" }}>
            Job Matches
          </Typography>

          <Grid container spacing={2}>
            {data.job_matches.map((job, index) => (
              <Grid item xs={12} key={index}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6">{job.title}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={job.match_score}
                      style={{ height: "10px", borderRadius: "5px", marginTop: "10px" }}
                    />
                    <Typography variant="body2" color="textSecondary" style={{ marginTop: "5px" }}>
                      Match Score: {job.match_score}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      )}

      {data && (
        <div style={{ marginTop: "20px" }}>
          <CheckCircle color="success" fontSize="large" />
          <Typography variant="body1" color="textSecondary">
            Resume successfully processed!
          </Typography>
        </div>
      )}
    </Container>
  );
}

export default App;
