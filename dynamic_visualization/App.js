import React, { useState, useRef, useEffect } from "react";
import logo from "./deckoviz_space_logo.jpeg";
import html2canvas from "html2canvas";

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1));
  return [
    Math.floor(255 * f(0)),
    Math.floor(255 * f(8)),
    Math.floor(255 * f(4)),
  ];
}

function FractalCanvas({ type, width, height, animate, speed, canvasId }) {
  const canvasRef = useRef();
  const [zoom, setZoom] = useState(1.2);

  // Happy hues palette for vibrant fractal colors
  const happyHues = [50, 100, 175, 210, 340, 25];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(width, height);

    const maxIter = 220;
    const scaleX = 3.6 / (width * zoom);
    const scaleY = 2.6 / (height * zoom);

    for (let px = 0; px < width; px++) {
      for (let py = 0; py < height; py++) {
        let x0 = px * scaleX - 2.0;
        let y0 = py * scaleY - 1.3;

        let x, y, iteration = 0, cx, cy;
        if (type === "Mandelbrot") {
          x = 0; y = 0;
          while (x * x + y * y <= 4 && iteration < maxIter) {
            let xTemp = x * x - y * y + x0;
            y = 2 * x * y + y0;
            x = xTemp;
            iteration++;
          }
        } else if (type === "Julia") {
          x = x0; y = y0;
          cx = -0.7; cy = 0.27015; // classic Julia parameters
          while (x * x + y * y <= 4 && iteration < maxIter) {
            let xTemp = x * x - y * y + cx;
            y = 2 * x * y + cy;
            x = xTemp;
            iteration++;
          }
        } else if (type === "BurningShip") {
          x = 0; y = 0;
          while (x * x + y * y <= 4 && iteration < maxIter) {
            let xTemp = x * x - y * y + x0;
            y = Math.abs(2 * x * y) + y0;
            x = Math.abs(xTemp);
            iteration++;
          }
        }

        let color;
        if (iteration === maxIter) {
          color = [0, 0, 0]; // black inside set
        } else {
          const h = happyHues[(px + py) % happyHues.length] + (iteration * 2) % 360;
          color = hslToRgb(h, 90, 63);
        }
        const pixelIndex = (py * width + px) * 4;
        imgData.data[pixelIndex] = color[0];
        imgData.data[pixelIndex + 1] = color[1];
        imgData.data[pixelIndex + 2] = color[2];
        imgData.data[pixelIndex + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [type, width, height, zoom]);

  useEffect(() => {
    if (!animate) return;
    let id;
    let increasing = true;
    const animateZoom = () => {
      setZoom(z => {
        if (z > 2.0) increasing = false;
        if (z < 1.1) increasing = true;
        return increasing ? z + speed : z - speed;
      });
      id = requestAnimationFrame(animateZoom);
    };
    id = requestAnimationFrame(animateZoom);
    return () => cancelAnimationFrame(id);
  }, [animate, speed]);

  return (
    <div style={{
      background: "#faf9fe",
      boxShadow: "0 0 24px #b1b4ec70",
      borderRadius: 16,
      padding: 18,
      display: "inline-block",
    }}>
      <canvas id={canvasId} ref={canvasRef} width={width} height={height} />
    </div>
  );
}

export default function App() {
  const [mood, setMood] = useState("");
  const [motif, setMotif] = useState("");
  const [fractalType, setFractalType] = useState("Mandelbrot");
  const [animate, setAnimate] = useState(true);
  const [speed, setSpeed] = useState(0.03);
  const [started, setStarted] = useState(false);

  const recognition = useRef(null);
  const [listeningMood, setListeningMood] = useState(false);
  const [listeningMotif, setListeningMotif] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) return;
    recognition.current = new SpeechRecognition();
    recognition.current.onresult = (event) => {
      const transcript = event.results[0].transcript.trim();
      if (listeningMood) setMood(transcript);
      else if (listeningMotif) setMotif(transcript);
      setListeningMood(false);
      setListeningMotif(false);
    };
    recognition.current.onerror = () => {
      setListeningMood(false);
      setListeningMotif(false);
    };
    recognition.current.onend = () => {
      setListeningMood(false);
      setListeningMotif(false);
    };
  }, [listeningMood, listeningMotif]);

  const startListening = (field) => {
    if (!recognition.current) {
      alert("Speech recognition not supported by your browser.");
      return;
    }
    if (field === "mood") setListeningMood(true);
    if (field === "motif") setListeningMotif(true);
    recognition.current.start();
  };

  const downloadImage = async () => {
    const canvas = document.getElementById("fractal-canvas");
    if (!canvas) return;
    const canvasImage = await html2canvas(canvas.parentElement);
    const link = document.createElement("a");
    link.download = `fractal_${Date.now()}.png`;
    link.href = canvasImage.toDataURL("image/png");
    link.click();
  };

  const startSession = () => {
    if (!mood.trim() || !motif.trim()) {
      alert("Please provide both mood and motif.");
      return;
    }
    setStarted(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #515ada 0%, #807ddd 100%)",
        padding: "22px 0 48px 0",
        color: "#ebf1ff",
        fontFamily: "Inter, Arial, sans-serif",
        maxWidth: 960,
        margin: "auto",
        boxSizing: "border-box",
      }}
    >
      <header style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        justifyContent: "center",
        marginBottom: 24
      }}>
        <img
          src={logo}
          alt="Logo"
          style={{ width: 56, height: 56, borderRadius: "50%", boxShadow: "0 0 12px #807ddd90" }}
        />
        <h1 style={{ margin: 0, fontWeight: 900, fontSize: 28 }}>Dynamic Fractal Visualization</h1>
      </header>

      {!started ? (
        <div style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 20,
          maxWidth: 620,
          margin: "0 auto",
          padding: "28px 22px",
        }}>
          <div style={{ marginBottom: 18 }}>
            <label>
              Mood:&nbsp;
              <input
                type="text"
                value={mood}
                onChange={e => setMood(e.target.value)}
                placeholder="e.g. Calm, Dreamy, Excited, Peaceful"
                style={{
                  padding: 8,
                  fontSize: 17,
                  borderRadius: 7,
                  border: "none",
                  width: 210,
                }}
              />
              <button
                onClick={() => startListening("mood")}
                style={{
                  marginLeft: 10,
                  padding: "8px 14px",
                  borderRadius: 7,
                  fontWeight: "bold",
                  border: "none",
                  backgroundColor: "#7a84e9",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                {listeningMood ? "Listening..." : "Speak"}
              </button>
            </label>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label>
              Motif:&nbsp;
              <input
                type="text"
                value={motif}
                onChange={e => setMotif(e.target.value)}
                placeholder="e.g. Mountain, Forest, Ocean, Abstract"
                style={{
                  padding: 8,
                  fontSize: 17,
                  borderRadius: 7,
                  border: "none",
                  width: 210,
                }}
              />
              <button
                onClick={() => startListening("motif")}
                style={{
                  marginLeft: 10,
                  padding: "8px 14px",
                  borderRadius: 7,
                  fontWeight: "bold",
                  border: "none",
                  backgroundColor: "#7a84e9",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                {listeningMotif ? "Listening..." : "Speak"}
              </button>
            </label>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label>
              Fractal type:&nbsp;
              <select
                value={fractalType}
                onChange={e => setFractalType(e.target.value)}
                style={{ padding: 8, borderRadius: 6, fontSize: 16 }}
              >
                <option value="Mandelbrot">Mandelbrot</option>
                <option value="Julia">Julia</option>
                <option value="BurningShip">Burning Ship</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label>
              Animate zoom:&nbsp;
              <input type="checkbox" checked={animate}
                onChange={() => setAnimate(!animate)}
              />
            </label>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label>
              Animation speed:&nbsp;
              <input type="range"
                min="0.005"
                max="0.05"
                step="0.001"
                value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))}
              />{" "}
              {speed.toFixed(3)}
            </label>
          </div>

          <button
            onClick={startSession}
            style={{
              marginTop: 16,
              backgroundColor: "#615fed",
              color: "#fff",
              padding: "13px 30px",
              fontWeight: "bold",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 18,
              boxShadow: "0 0 14px #615fed80",
            }}
          >
            Visualize
          </button>
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          background: "rgba(255,255,255,0.12)",
          borderRadius: 20,
          maxWidth: 900,
          margin: "0 auto",
          padding: 24,
        }}>
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setStarted(false)}
              style={{
                backgroundColor: "#ddd",
                color: "#333",
                padding: "10px 20px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                marginRight: 12,
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              &larr; Back
            </button>
            <button
              onClick={downloadImage}
              style={{
                backgroundColor: "#615fed",
                color: "#fff",
                padding: "10px 18px",
                fontWeight: "bold",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 16,
                boxShadow: "0 0 14px #6c7ae0",
              }}
            >
              Download Image
            </button>
          </div>
          <div>
            <FractalCanvas
              type={fractalType}
              width={820}
              height={540}
              animate={animate}
              speed={speed}
              canvasId="fractal-canvas"
            />
          </div>
        </div>
      )}
    </div>
  );
}
