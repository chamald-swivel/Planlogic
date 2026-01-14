import React, { useState } from "react";
import { AudioTranscriptionService } from "../../services/audio-transcription-service"; // Adjust path to your service file

const AudioUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTranscribedText(""); // Reset previous result
      setError("");
    }
  };

  const handleUploadAndTranscribe = async () => {
    if (!file) {
      setError("Please select an audio file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await AudioTranscriptionService.uploadAndTranscribe(file, {
        locale: "en-US", // Optional: Change for other languages
      });

      setTranscribedText(result.text);
      console.log("Blob URL:", result.blobUrl); // For debugging or further use
      console.log("Transcription ID:", result.transcriptionId);
    } catch (err) {
      setError((err as Error).message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Audio Transcription</h2>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        disabled={loading}
      />
      <button onClick={handleUploadAndTranscribe} disabled={!file || loading}>
        {loading ? "Processing..." : "Upload and Transcribe"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {transcribedText && (
        <div>
          <h3>Transcribed Text:</h3>
          <pre>{transcribedText}</pre>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
