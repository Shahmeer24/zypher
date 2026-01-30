import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AlertBox from "../components/AlertBox";
import Spinner from "../components/Spinner";
// import style from "../styles/styling.module.css";
import ustyle from "../styles/uploadstyling.module.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faTrash } from "@fortawesome/free-solid-svg-icons";
import { QRCodeCanvas } from "qrcode.react";
import { BASE_URL } from "../config";

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const MAX_FILE_SIZE_MB = 20;

const Upload = () => {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isTypingArea = tag === "textarea" || tag === "input";
      if (e.key === "Enter" && !e.shiftKey) {
        if (isMobile && isTypingArea) {
          //handles default Enter button functionality based on device
          return;
        }
        e.preventDefault();
        if (text.trim() || files.length > 0) {
          handleUpload();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [text, files]);

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
      showAlert("File size exceeds 20MB");
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
      showAlert("File size exceeds 20MB");
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

    setUploading(true);

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
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() || files.length > 0) {
        handleUpload();
      }
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
  };

  const handleReset = () => {
    setText("");
    setFiles([]);
    setUploadResult(null);
  };

  return (
    <>
      <a href="/">
        <img src="../LOGO-noBG.png" alt="Logo" className={ustyle.mainLogo} />
      </a>
      <div className={ustyle.uploadContainer}>
        <h2>Upload Data</h2>
        <button className={ustyle.navBtn} onClick={() => navigate("/retrieve")}>
          want to retrieve?
        </button>
        <div className={ustyle.uploadSection}>
          <div className={ustyle.textUploadSection}>
            <h3 className={ustyle.secondaryHeading}>Enter Text</h3>
            <h3 className={ustyle.secondaryHeading}>
              Press Enter to Upload. Shift+Enter for newline
            </h3>
            <textarea
              className={ustyle.inputTextarea}
              placeholder="Text Field"
              value={text}
              onChange={handleTextChange}
              rows={6}
            />
          </div>
          <div>
            <h2>or</h2>
          </div>

          <div className={ustyle.fileUploadSection}>
            <h3 className={ustyle.secondaryHeading}>
              Select File(s) - max size 20mb
            </h3>
            <h3 className={ustyle.secondaryHeading}>
              Upload multiple files together to create a zip file
            </h3>
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
                  {files.map((file, index) => (
                    <li key={index} className={ustyle.fileItem}>
                      <FontAwesomeIcon
                        icon={faTrash}
                        className={ustyle.trashIcon}
                        onClick={() => handleRemoveFile(index)}
                        title="Remove File"
                      />
                      <FontAwesomeIcon
                        icon={faFile}
                        style={{ marginRight: "8px" }}
                      />
                      <span className={ustyle.fileName} title={file.name}>
                        {file.name}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={ustyle.defaultEntry}>No files selected</p>
              )}
            </div>
          </div>
        </div>
        <div className={ustyle.btnRow}>
          <button className={ustyle.uploadBtn} onClick={handleUpload}>
            Upload
          </button>
          <button className={ustyle.resetBtn} onClick={handleReset}>
            Reset
          </button>
        </div>
        {uploading && <Spinner />}

        {uploadResult?.code && uploadResult?.link && (
          <div className={ustyle.uploadResultContainer}>
            <div className={ustyle.uploadResult}>
              <p>
                <strong id={ustyle.resultHead}>Retrieval Code</strong>{" "}
                <p id={ustyle.resultCode}>{uploadResult.code}</p>
              </p>
              <p>
                <strong id={ustyle.resultHead}>Retrieval Link</strong>{" "}
                <a
                  href={uploadResult.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ustyle.textDecor}
                >
                  <p id={ustyle.resultLink} className={ustyle.textDecor}>
                    {uploadResult.link}
                  </p>
                </a>
              </p>
            </div>

            <div className={ustyle.uploadResult}>
              <strong id={ustyle.resultHead}>Retrieval QR</strong> <br />
              <QRCodeCanvas
                value={uploadResult.link}
                size={180}
                bgColor={"#eeeeee"}
                fgColor={"#5606a1"}
                level={"H"}
                marginSize={"2"}
                id={ustyle.resultQR}
              ></QRCodeCanvas>
            </div>
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
