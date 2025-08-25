import React, { useState, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import logo from "./deckoviz_space_logo.jpeg";

const backgroundOptions = [
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1465101178521-7856e8b788ba?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1465378556944-c1ed9450b4ab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1465101178521-7856e8b788ba?auto=format&fit=crop&w=800&q=80",
];

const starredBackgrounds = [
  "https://images.unsplash.com/photo-1465169392108-ccb137c954c4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80",
];

export default function App() {
  const [selectedBg, setSelectedBg] = useState(backgroundOptions[0]);
  const [starredBg, setStarredBg] = useState(starredBackgrounds);
  const [aiImage, setAIImage] = useState(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAIPrompt] = useState("");

  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [fontSize, setFontSize] = useState(28);
  const [fontColor, setFontColor] = useState("#515ada");
  const [orientation, setOrientation] = useState("portrait"); // portrait or landscape
  const [alignment, setAlignment] = useState("center"); // text alignment
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");

  const previewRef = useRef(null);

  // Call backend API to generate AI image
  const generateAIImage = async () => {
    if (!aiPrompt.trim()) {
      alert("Please enter a prompt for AI image generation");
      return;
    }
    setShowAIPrompt(false); // Close prompt input
    try {
      const response = await axios.post("http://localhost:5000/api/generate-background", {
        prompt: aiPrompt,
      });
      const imageUrl = response.data.url;
      setAIImage(imageUrl); // Set AI generated image URL for preview
      setSelectedBg(null);  // Clear manual background selection
    } catch (error) {
      alert("Error generating image: " + (error.response?.data?.error || error.message));
    }
  };

  const currentBackground = aiImage || selectedBg || starredBg;

  return (
    <div
      style={{
        fontFamily: "Inter, Arial, sans-serif",
        background: "linear-gradient(135deg, #515ada 0%, #807ddd 100%)",
        minHeight: "100vh",
        padding: "20px 24px",
        boxSizing: "border-box",
        color: "#f0eefd",
      }}
    >
      {/* Logo and Title */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            boxShadow: "0 0 10px #b1b4ec",
          }}
        />
        <h1 style={{ fontWeight: 900, fontSize: "2.4rem", margin: 0 }}>
          Manual Quote Poster
        </h1>
      </header>

      {/* Background Selection */}
      <section style={{ maxWidth: 960, margin: "auto 0 48px 0" }}>
        <h2 style={{ marginBottom: 16, color: "#e0defe" }}>Select Background</h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "center",
          }}
        >
          {backgroundOptions.map((bg) => (
            <button
              key={bg}
              onClick={() => {
                setSelectedBg(bg);
                setAIImage(null);
              }}
              style={{
                width: 130,
                height: 90,
                backgroundImage: `url(${bg})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                borderRadius: 14,
                border: selectedBg === bg ? "3px solid #fff" : "2px solid #b5b9eb",
                boxShadow: selectedBg === bg ? "0 0 12px #dacfff" : "none",
                cursor: "pointer",
              }}
              aria-label="Select background"
            />
          ))}
        </div>

        <h3 style={{ marginTop: 40, marginBottom: 16, color: "#d0cfff" }}>
          Starred / Liked Backgrounds
        </h3>
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {starredBackgrounds.map((bg) => (
            <button
              key={bg}
              onClick={() => {
                setStarredBg(bg);
                setAIImage(null);
                setSelectedBg(null);
              }}
              style={{
                width: 130,
                height: 90,
                backgroundImage: `url(${bg})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                borderRadius: 14,
                border: starredBg === bg ? "3px solid #fff" : "2px solid #b5b9eb",
                boxShadow: starredBg === bg ? "0 0 12px #f4dada" : "none",
                cursor: "pointer",
              }}
              aria-label="Select starred background"
            />
          ))}
        </div>

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <button
            onClick={() => setShowAIPrompt(true)}
            style={{
              backgroundColor: "#dacfff",
              color: "#5548c8",
              padding: "12px 30px",
              borderRadius: 36,
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 0 16px #b1a9f7",
              border: "none",
              letterSpacing: "0.025em",
            }}
          >
            Use AI Generated Image
          </button>

          {showAIPrompt && (
            <div
              style={{
                marginTop: 20,
                padding: 20,
                border: "1px solid #ccc",
                borderRadius: 12,
                maxWidth: 400,
                backgroundColor: "#fff",
                color: "#000",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >
              <h4>Enter Prompt for AI Image Generation</h4>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                placeholder="e.g. sunset over mountains"
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  padding: "8px 10px",
                  fontSize: 16,
                  borderRadius: 6,
                  border: "1px solid #aaa",
                  marginBottom: 12,
                  boxSizing: "border-box",
                  wordWrap: "break-word",
                }}
              />
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={generateAIImage}
                  style={{
                    flex: 1,
                    backgroundColor: "#10a99b",
                    color: "#fff",
                    fontWeight: 600,
                    padding: "10px 0",
                    borderRadius: 12,
                    cursor: "pointer",
                  }}
                >
                  Generate
                </button>
                <button
                  onClick={() => setShowAIPrompt(false)}
                  style={{
                    flex: 1,
                    backgroundColor: "#ddd",
                    fontWeight: 600,
                    padding: "10px 0",
                    borderRadius: 12,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Manual Quote Entry Section */}
      <section
        style={{
          minHeight: "60vh",
          paddingTop: 40,
          paddingBottom: 60,
          backgroundColor: "#f9f8ff",
          color: "#333",
          maxWidth: 640,
          margin: "auto",
          borderRadius: 18,
          boxShadow: "0 0 20px rgba(0,0,0,0.05)",
          paddingLeft: 24,
          paddingRight: 24,
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ marginBottom: 24, fontWeight: 700 }}>Add Your Quote</h2>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          rows={4}
          placeholder="Type your quote here..."
          style={{
            width: "100%",
            maxWidth: "100%",
            padding: 14,
            fontSize: fontSize,
            fontFamily: fontFamily,
            color: fontColor,
            borderRadius: 12,
            border: "1px solid #ccc",
            resize: "vertical",
            fontWeight: 600,
            marginBottom: 18,
            minHeight: 120,
            boxSizing: "border-box",
            wordWrap: "break-word",
          }}
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author (optional)"
          style={{
            width: "100%",
            padding: 10,
            fontSize: 18,
            fontFamily: fontFamily,
            color: "#666",
            borderRadius: 10,
            border: "1px solid #eee",
            marginBottom: 28,
            fontWeight: 600,
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label>
            Font Size:
            <input
              type="number"
              min={16}
              max={72}
              value={fontSize}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 16 && val <= 72) setFontSize(val);
              }}
              style={{ marginLeft: 8, width: 80, fontSize: 16, padding: 6 }}
            />
          </label>
          <label>
            Font Color:
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              style={{
                marginLeft: 8,
                width: 50,
                height: 32,
                border: "none",
                cursor: "pointer",
              }}
            />
          </label>
          <label>
            Font Family:
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              style={{ marginLeft: 8, fontSize: 16, padding: 6 }}
            >
              <option value="Inter, sans-serif">Inter</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Times New Roman, serif">Times New Roman</option>
              <option value="Courier New, monospace">Courier New</option>
              <option value="Comic Sans MS, cursive">Comic Sans MS</option>
            </select>
          </label>
          <label>
            Orientation:
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
              style={{ marginLeft: 8, fontSize: 16, padding: 6 }}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
          <label>
            Text Align:
            <select
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
              style={{ marginLeft: 8, fontSize: 16, padding: 6 }}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
        </div>
      </section>

      {/* Preview Section */}
      <section
        style={{
          minHeight: orientation === "portrait" ? "70vh" : "55vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          background: "linear-gradient(90deg, #B19CD9, #FFFDD0, #87CEEB)", // pastel gradient lavender → cream → sky blue
          boxSizing: "border-box",
          marginTop: 32,
          marginBottom: 16,
        }}
      >
        <div
          id="poster-preview"
          ref={previewRef}
          style={{
            width: orientation === "portrait" ? 440 : 700,
            height: orientation === "portrait" ? 550 : 440,
            backgroundImage: `url(${currentBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgb(57 74 159 / 18%)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: alignment,
            padding: 30,
            color: fontColor,
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontWeight: 600,
            textAlign: alignment,
            userSelect: "none",
            rowGap: 15,
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              width: 40,
              borderRadius: "50%",
              boxShadow: "0 0 8px rgba(0,0,0,0.15)",
              zIndex: 10,
            }}
          />
          <div style={{ whiteSpace: "pre-wrap" }}>
            {quote || "Your quote preview will appear here"}
          </div>
          {author && (
            <div
              style={{
                fontStyle: "italic",
                fontSize: fontSize * 0.7,
                opacity: 0.7,
              }}
            >
              - {author}
            </div>
          )}
        </div>
      </section>

      {/* Download Button */}
      <div style={{ textAlign: "center", margin: 24 }}>
        <button
          onClick={async () => {
            if (!previewRef.current) return;
            const canvas = await html2canvas(previewRef.current);
            const link = document.createElement("a");
            link.download = `quote_poster_${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
          }}
          style={{
            padding: "14px 44px",
            fontSize: 18,
            color: "white",
            background: "linear-gradient(90deg, #515ada, #10a99b)",
            border: "none",
            borderRadius: 28,
            cursor: "pointer",
            boxShadow: "0 0 20px #8490f890",
          }}
        >
          Download Poster
        </button>
      </div>

      <footer
        style={{
          textAlign: "center",
          padding: 20,
          color: "#d0cfff",
          fontWeight: 600,
        }}
      >
        &copy; {new Date().getFullYear()} Manual Quote Poster
      </footer>
    </div>
  );
}
