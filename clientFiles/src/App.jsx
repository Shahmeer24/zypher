import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Retrieve from "./pages/Retrieve";
import About from "./pages/About";

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handleLoad = () => setLoaded(true);
    if (document.readyState === "complete") {
      setLoaded(true);
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  if (!loaded) return null;
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/retrieve" element={<Retrieve />} />
      <Route path="/retrieve/:code" element={<Retrieve />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App;
