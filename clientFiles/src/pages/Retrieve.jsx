import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import AlertBox from "../components/AlertBox.jsx";
import Spinner from "../components/Spinner.jsx";
// import style from "../styles/styling.module.css";
import rstyle from "../styles/retrievestyling.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faCopy } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../config";

function Retrieve() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState("");
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [fileReady, setFileReady] = useState(false);
  const [filename, setFilename] = useState("");
  const [activeCode, setActiveCode] = useState("");
  const [fileType, setFileType] = useState("");
  const [textData, setTextData] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (code) {
      setInputCode(code);
      handleSubmit(code);
    }
  }, [code]);

  const resetState = () => {
    setFileReady(false);
    setTextData("");
    setFileType("");
    setFilename("");
  };

  const fetchFileInfo = async (fetchCode) => {
    setUploading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/file/${fetchCode}`);
      if (!res.ok) throw new Error("File not found or expired.");

      const data = await res.json();
      setFilename(data.filename);
      setFileType(data.type);

      if (data.type === "text") {
        setTextData(data.text);
      }
      setFileReady(true);
    } catch (err) {
      setAlert({ show: true, type: "error", message: err.message });
      resetState();
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (customCode = null) => {
    const finalCode = (customCode || inputCode).trim();

    if (!finalCode) {
      setAlert({ show: true, type: "error", message: "Please enter a code." });
      return;
    }

    setActiveCode(finalCode);
    resetState();
    fetchFileInfo(finalCode);
  };

  const handleDownload = async () => {
    setUploading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/download/${activeCode}`);
      if (!res.ok) throw new Error("Unable to download file.");

      const blob = await res.blob();
      const fileURL = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = fileURL;
      a.download = filename || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(fileURL);

      setAlert({ show: true, type: "success", message: "Download started." });
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Error in download." });
    } finally {
      setUploading(false);
    }
  };

  // Text to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textData);
      setAlert({
        show: true,
        type: "success",
        message: "Text copied to clipboard.",
      });
    } catch {
      setAlert({ show: true, type: "error", message: "Failed to copy text." });
    }
  };

  return (
    <>
      <a href="/">
        <img src="../LOGO-noBG.png" alt="Logo" className={rstyle.mainLogo} />
      </a>

      <div className={rstyle.downloadWrapper}>
        <div className={rstyle.mainSection}>
          <h2>Enter the code to retrieve data</h2>
          <button className={rstyle.navBtn} onClick={() => navigate("/upload")}>
            want to upload?
          </button>

          <div className={rstyle.manualCode}>
            <input
              className={rstyle.inputField}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={inputCode}
              maxLength={4}
              placeholder="Code Field"
              onChange={(e) => setInputCode(e.target.value)}
              onFocus={() => setActiveCode("")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <br />
            <button className={rstyle.submitBtn} onClick={() => handleSubmit()}>
              Fetch
            </button>
            {uploading && (
              <div className={rstyle.spinstyle}>
                <Spinner />
              </div>
            )}
          </div>

          {alert.show && (
            <AlertBox
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ ...alert, show: false })}
            />
          )}

          {activeCode && !fileReady && (
            <p className={rstyle.waitingMessage}>Fetching file...</p>
          )}

          {fileReady && fileType === "file" && (
            <div className={rstyle.fileSection}>
              <p
                className={rstyle.filename}
                style={{ textDecoration: "underline" }}
              >
                {filename}
              </p>
              <button className={rstyle.downloadBtn} onClick={handleDownload}>
                <FontAwesomeIcon icon={faDownload} /> Download
              </button>
            </div>
          )}
          {fileReady && fileType === "zip" && (
            <div className={rstyle.fileSection}>
              <p
                className={rstyle.filename}
                style={{ textDecoration: "underline" }}
              >
                {filename}
              </p>
              <button className={rstyle.downloadBtn} onClick={handleDownload}>
                <FontAwesomeIcon icon={faDownload} /> Download
              </button>
            </div>
          )}
          {fileReady && fileType === "text" && (
            <div>
              <textarea
                className={rstyle.textBox}
                value={textData}
                readOnly
                rows={10}
              />
              <button className={rstyle.copyBtn} onClick={handleCopy}>
                <FontAwesomeIcon icon={faCopy} /> Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Retrieve;
