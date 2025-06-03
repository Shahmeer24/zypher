import React, { useState } from "react";
import AlertBox from "../components/AlertBox";
import style from "../styles/styling.module.css";
import ustyle from "../styles/uploadstyling.module.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../config";

const MAX_FILE_SIZE_MB = 10;

const Upload = () => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });

  const showAlert = (message, type = "error") => {
    setAlert({ message, type, visible: true });
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const allFiles = [...files, ...selected];
    const uniqueFiles = allFiles.filter(
      (file, idx, arr) =>
        arr.findIndex((f) => f.name === file.name && f.size === file.size) ===
        idx
    );
    const totalSize = uniqueFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showAlert("File size exceeds 10MB");
      return;
    }
    setFiles(uniqueFiles);
    setText("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const allFiles = [...files, ...droppedFiles];
    const uniqueFiles = allFiles.filter(
      (file, idx, arr) =>
        arr.findIndex((f) => f.name === file.name && f.size === file.size) ===
        idx
    );
    const totalSize = uniqueFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showAlert("File size exceeds 10MB");
      return;
    }
    setFiles(uniqueFiles);
    setText("");
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    setFiles([]);
  };

  const handleUpload = async () => {
    if (!text && files.length === 0) {
      showAlert("Please upload a file or enter some text.");
      return;
    }
    const formData = new FormData();
    if (text) {
      formData.append("text", text);
    } else {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }
    try {
      const res = await axios.post(`${BASE_URL}/upload`, formData);
      if (!res?.data?.code) {
        throw new Error("Invalid response from server");
      }
      setUploadResult(res.data);
      showAlert("Uploaded successfully", "success");
    } catch (err) {
      console.error(err);
      if (err.message.includes("Network")) {
        showAlert("Server just woke up. Please try again.", "error");
      } else {
        showAlert("Upload failed", "error");
      }
    }
  };

  const handleReset = () => {
    setText("");
    setFiles([]);
    setUploadResult(null);
  };

  return (
    <>
      <a href="/">
        <img src="../LOGO-noBG.png" alt="Logo" className={style.mainLogo} />
      </a>
      <div className={ustyle.uploadContainer}>
        <h2>Upload Data</h2>
        <h3>Enter Text</h3>
        <textarea
          className={ustyle.inputTextarea}
          placeholder="Text Field"
          value={text}
          onChange={handleTextChange}
          rows={6}
        />
        <h2>or</h2>
        <h3>Select File(s) - max size 10mb</h3>
        <div
          className={ustyle.dropArea}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <label htmlFor="fileUpload" className={ustyle.inputFileBtn}>
            Browse or Drop Files Here
          </label>
          <input
            type="file"
            id="fileUpload"
            className={ustyle.inputFileBtnHidden}
            multiple
            onChange={handleFileChange}
            accept="*/*"
          />
        </div>
        <div className={ustyle.fileList}>
          {files.length > 0 ? (
            <ul>
              <p id={ustyle.defaultTxt}>Selected Files:</p>
              {files.map((file, index) => (
                <li key={index}>
                  <FontAwesomeIcon
                    icon={faFile}
                    style={{ marginRight: "8px" }}
                  />
                  {file.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No files selected</p>
          )}
        </div>
        <div>
          <button className={ustyle.uploadBtn} onClick={handleUpload}>
            Upload
          </button>
          <button className={ustyle.resetBtn} onClick={handleReset}>
            Reset
          </button>
        </div>
        {uploadResult?.code && uploadResult?.link && (
          <div className={ustyle.uploadResult}>
            <p>
              <strong>Code:</strong>{" "}
              <p id={ustyle.resultCode}>{uploadResult.code}</p>
            </p>
            <p>
              <strong>Link:</strong>{" "}
              <a
                href={uploadResult.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <p id={ustyle.resultLink}>{uploadResult.link}</p>
              </a>
            </p>
          </div>
        )}
        {alert.visible && (
          <AlertBox
            message={
              alert.message +
              " : " +
              (uploadResult?.code ? uploadResult.code : "")
            }
            type={alert.type}
            onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
          />
        )}
      </div>
    </>
  );
};

export default Upload;