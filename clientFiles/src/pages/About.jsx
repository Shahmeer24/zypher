import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
// import style from "../styles/styling.module.css";
import astyle from "../styles/aboutstyling.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../config";

function About() {
  const [uploadCount, setUploadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/api/stats`)
      .then((res) => res.json())
      .then((data) => setUploadCount(data.uploadCount))
      .catch((err) => console.error("Failed to update count", err));
  }, []);
  return (
    <>
      <a href="/">
        <img src="../LOGO-noBG.png" alt="Logo" className={astyle.mainLogo} />
      </a>
      <div className={astyle.aboutContainer}>
        <h1 className={astyle.aboutTitle}>Zypher</h1>

        <p className={astyle.aboutDescription}>
          <strong>Zypher</strong> is a fast, modern file and text sharing tool
          built for simplicity. It allows anyone to securely upload text or
          multiple files (under 20MB), generate a shareable code and let others
          download the content using that code without needing signups or
          accounts. All uploads are temporary and auto-delete after 10 minutes,
          making it ideal for quick sharing. Built with a React frontend and
          Express backend, Zypher is lightweight, responsive, and thoughtfully
          designed to work seamlessly across devices. It uses file zipping for
          multiple uploads, harnesses real-time alerts, and provides infinite
          availablility in the time frame.
        </p>

        <div className={astyle.footer}>
          <span>Total Uploads:</span>
          <strong>{uploadCount}</strong>
        </div>

        <a
          className={astyle.githubBtn}
          href="https://github.com/shahmeer24/zypher"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faGithub} /> View on GitHub
        </a>
        <button className={astyle.backBtn} onClick={()=>navigate('/')}> <FontAwesomeIcon icon={faArrowLeft} />Go Back</button>
        
      </div>
    </>
  );
}

export default About;
