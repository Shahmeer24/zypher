import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import style from "../styles/styling.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../config";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div>
      <a href="/">
        <img src="../LOGO-noBG.png" alt="Logo" className={style.mainLogo} />
      </a>

      <div className={style.mainContainer}>
        <div className={style.container}>
          <div className={style.subContainer}>
            <button onClick={() => navigate("/upload")}>
              <span className={`${style.btnContainer} ${style.btnUpload}`}>
                <FontAwesomeIcon icon={faUpload} />
              </span>
            </button>
            <p>Upload</p>
          </div>

          <div className={style.subContainer}>
            <button onClick={() => navigate("/retrieve")}>
              <span className={`${style.btnContainer} ${style.btnDownload}`}>
                <FontAwesomeIcon icon={faDownload} />
              </span>
            </button>

            <p>Retrieve</p>
          </div>
        </div>

        <div className={style.footer}>
          <button onClick={() => navigate("/about")}>About Zypher</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
