import React, { useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import html2canvas from "html2canvas";
import logo from "./deckoviz_space_logo.jpeg";

const layouts = {
  "4x4-square-4": {
    name: "Square 4 partitions (2x2)",
    partitions: 4,
    gridStyle: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gridTemplateRows: "repeat(2, 1fr)",
      gap: 12,
    },
  },
  "4x4-square-8": {
    name: "Square 8 partitions (4x2)",
    partitions: 8,
    gridStyle: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gridTemplateRows: "repeat(2, 1fr)",
      gap: 12,
    },
  },
  "4x4-square-mixed": {
    name: "Square 4x4 with 2 large + 2 small",
    partitions: 4,
    customStyle: true,
  },
  "rectangle-4x4-uniform": {
    name: "Rectangle 16 equal sections (4x4)",
    partitions: 16,
    gridStyle: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gridTemplateRows: "repeat(4, 1fr)",
      gap: 8,
    },
  },
  "rectangle-rectangles-2large-2small": {
    name: "Rectangle 2 large + 2 small",
    partitions: 4,
    customStyle: true,
  },
  "rectangle-left-large-right-3small": {
    name: "Rectangle - Large Left, 3 Small Right",
    partitions: 4,
    customStyle: true,
  },
  "rectangle-right-large-left-3small": {
    name: "Rectangle - Large Right, 3 Small Left",
    partitions: 4,
    customStyle: true,
  },
  "portrait-8-equal": {
    name: "Portrait Rectangle - 8 equal sections",
    partitions: 8,
    gridStyle: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gridTemplateRows: "repeat(4, 1fr)",
      gap: 12,
    },
  },
  "portrait-16-equal": {
    name: "Portrait Rectangle - 16 equal sections",
    partitions: 16,
    gridStyle: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gridTemplateRows: "repeat(4, 1fr)",
      gap: 8,
    },
  },
};

function PartitionBox({ content, onUpdate, style, title }) {
  function onFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      onUpdate("image", localUrl);
    }
  }

  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 2px 20px rgb(143 146 255 / 60%)",
        backgroundColor: "rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: "column",
        cursor: "default",
        ...style,
      }}
      title={title}
    >
      <div style={{ position: "relative", flex: "1 1 auto" }}>
        {content.image ? (
          <img
            src={content.image}
            alt={title}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: 140,
              objectFit: "contain",
              display: "block",
              borderBottom: "1px solid #9999ff66",
            }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div
            style={{
              height: 140,
              borderBottom: "1px solid #9999ff66",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#bbb",
              fontSize: 14,
              fontStyle: "italic",
            }}
          >
            No image selected
          </div>
        )}
      </div>
      <textarea
        placeholder="Add text..."
        value={content.text}
        onChange={(e) => onUpdate("text", e.target.value)}
        style={{
          flexGrow: 1,
          backgroundColor: "transparent",
          border: "none",
          color: "#e0e0ff",
          fontSize: 14,
          padding: 8,
          resize: "none",
          fontFamily: "inherit",
          outline: "none",
          minHeight: 60,
        }}
      />
      <input
        type="text"
        placeholder="Paste image URL"
        value={content.image || ""}
        onChange={(e) => onUpdate("image", e.target.value)}
        style={{
          fontSize: 12,
          padding: "6px 8px",
          border: "none",
          borderTop: "1px solid #9999ff66",
          backgroundColor: "transparent",
          color: "#ccc",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{
          marginTop: 4,
          fontSize: 12,
          cursor: "pointer",
          backgroundColor: "transparent",
          color: "#ccc",
        }}
        title="Upload image from your device"
      />
    </div>
  );
}

function EditPage() {
  const [selectedLayout, setSelectedLayout] = useState("4x4-square-4");
  const [partitionsContent, setPartitionsContent] = useState(
    Array(layouts["4x4-square-4"].partitions)
      .fill(0)
      .map(() => ({
        image: "",
        text: "",
      }))
  );

  const navigate = useNavigate();

  function onChangeLayout(e) {
    const layoutKey = e.target.value;
    const partsCount = layouts[layoutKey].partitions;
    setSelectedLayout(layoutKey);
    setPartitionsContent(
      Array(partsCount)
        .fill(0)
        .map(() => ({
          image: "",
          text: "",
        }))
    );
  }

  function updatePartition(index, field, value) {
    setPartitionsContent((content) => {
      const updated = [...content];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  const layout = layouts[selectedLayout];

  function renderPartitions() {
    if (layout.customStyle) {
      if (selectedLayout === "4x4-square-mixed") {
        return (
          <div
            style={{
              display: "grid",
              gridTemplateAreas: `
                "large1 large1"
                "large2 large2"
                "small1 small2"
              `,
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "2fr 2fr 1fr",
              gap: 12,
              height: 480,
            }}
          >
            {[0, 1, 2, 3].map((idx) => {
              const gridArea =
                idx === 0
                  ? "large1"
                  : idx === 1
                  ? "large2"
                  : idx === 2
                  ? "small1"
                  : "small2";

              return (
                <PartitionBox
                  key={idx}
                  content={partitionsContent[idx]}
                  onUpdate={(field, val) => updatePartition(idx, field, val)}
                  style={{ gridArea }}
                  title={`Partition ${idx + 1}`}
                />
              );
            })}
          </div>
        );
      }
      if (selectedLayout === "rectangle-rectangles-2large-2small") {
        return (
          <div
            style={{
              display: "grid",
              gridTemplateAreas: `
                "large1 large1"
                "large2 large2"
                "small1 small2"
              `,
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "2fr 2fr 1fr",
              gap: 12,
              height: 480,
            }}
          >
            {[0, 1, 2, 3].map((idx) => {
              const gridArea =
                idx === 0
                  ? "large1"
                  : idx === 1
                  ? "large2"
                  : idx === 2
                  ? "small1"
                  : "small2";

              return (
                <PartitionBox
                  key={idx}
                  content={partitionsContent[idx]}
                  onUpdate={(field, val) => updatePartition(idx, field, val)}
                  style={{ gridArea }}
                  title={`Partition ${idx + 1}`}
                />
              );
            })}
          </div>
        );
      }
      if (selectedLayout === "rectangle-left-large-right-3small") {
        return (
          <div
            style={{
              display: "grid",
              gridTemplateAreas: `
                "large small1"
                "large small2"
                "large small3"
              `,
              gridTemplateColumns: "2fr 1fr",
              gridTemplateRows: "1fr 1fr 1fr",
              gap: 12,
              height: 480,
            }}
          >
            {[0, 1, 2, 3].map((idx) => {
              const gridArea =
                idx === 0
                  ? "large"
                  : idx === 1
                  ? "small1"
                  : idx === 2
                  ? "small2"
                  : "small3";

              return (
                <PartitionBox
                  key={idx}
                  content={partitionsContent[idx]}
                  onUpdate={(field, val) => updatePartition(idx, field, val)}
                  style={{ gridArea }}
                  title={`Partition ${idx + 1}`}
                />
              );
            })}
          </div>
        );
      }
      if (selectedLayout === "rectangle-right-large-left-3small") {
        return (
          <div
            style={{
              display: "grid",
              gridTemplateAreas: `
                "small1 large"
                "small2 large"
                "small3 large"
              `,
              gridTemplateColumns: "1fr 2fr",
              gridTemplateRows: "1fr 1fr 1fr",
              gap: 12,
              height: 480,
            }}
          >
            {[0, 1, 2, 3].map((idx) => {
              const gridArea =
                idx === 3
                  ? "large"
                  : idx === 0
                  ? "small1"
                  : idx === 1
                  ? "small2"
                  : "small3";

              return (
                <PartitionBox
                  key={idx}
                  content={partitionsContent[idx]}
                  onUpdate={(field, val) => updatePartition(idx, field, val)}
                  style={{ gridArea }}
                  title={`Partition ${idx + 1}`}
                />
              );
            })}
          </div>
        );
      }
    }

    return (
      <div style={{ ...layout.gridStyle, minHeight: 400 }}>
        {partitionsContent.map((content, idx) => (
          <PartitionBox
            key={idx}
            content={content}
            onUpdate={(field, val) => updatePartition(idx, field, val)}
            title={`Partition ${idx + 1}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(90deg, #B19CD9, #FFFDD0, #87CEEB)",
        color: "#eee",
        fontFamily: "Inter, Arial, sans-serif",
        padding: "40px 60px 80px",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <img src={logo} alt="Logo" style={{ width: 56, borderRadius: "50%" }} />
        <h1 style={{ fontSize: 28, fontWeight: "900", margin: 0 }}>
          Moodboard with Partitions
        </h1>
      </header>

      <label
        htmlFor="layout-select"
        style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, display: "block" }}
      >
        Choose Layout:
      </label>
      <select
        id="layout-select"
        value={selectedLayout}
        onChange={onChangeLayout}
        style={{
          fontSize: 16,
          padding: "8px 12px",
          borderRadius: 8,
          marginBottom: 32,
          width: "100%",
          maxWidth: 400,
          color: "#333",
        }}
      >
        {Object.entries(layouts).map(([key, layout]) => (
          <option key={key} value={key}>
            {layout.name}
          </option>
        ))}
      </select>

      {renderPartitions()}

      <button
        onClick={() =>
          navigate("/preview", { state: { partitionsContent, layoutKey: selectedLayout } })
        }
        style={{
          marginTop: 40,
          fontSize: 18,
          fontWeight: "700",
          padding: "12px 36px",
          borderRadius: 24,
          border: "none",
          cursor: "pointer",
          backgroundColor: "#515ada",
          color: "#fff",
          boxShadow: "0 0 20px #8490f8aa",
        }}
      >
        Preview & Download
      </button>
    </div>
  );
}

function PreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const previewRef = useRef(null);

  const { state } = location || {};

  useEffect(() => {
    if (!state) navigate("/", { replace: true });
  }, [state, navigate]);

  if (!state) return null;

  const { partitionsContent, layoutKey } = state;
  const layout = layouts[layoutKey];

  async function downloadImage() {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current);
    const link = document.createElement("a");
    link.download = `moodboard_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const renderPreviewPartitions = () => {
    if (layout.customStyle) {
      // You may add custom gridArea-based preview styling if needed
    }

    return (
      <div style={{ ...layout.gridStyle, minHeight: 480, width: "100%" }}>
        {partitionsContent.map((content, idx) => (
          <div
            key={idx}
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 14,
              boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
              backgroundColor: "#222",
            }}
          >
            <img
              src={content.image}
              alt={`Partition ${idx + 1}`}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: 140,
                objectFit: "contain",
                display: content.image ? "block" : "none",
              }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div
              style={{
                padding: 8,
                color: "#eee",
                fontSize: 14,
                minHeight: 60,
                whiteSpace: "pre-wrap",
                fontFamily: "Inter, Arial, sans-serif",
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            >
              {content.text}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(90deg, #B19CD9, #FFFDD0, #87CEEB)",
        color: "#eee",
        fontFamily: "Inter, Arial, sans-serif",
        padding: "40px 60px",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: "900", marginBottom: 20 }}>Preview Moodboard</h1>

      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: 24,
          fontSize: 16,
          fontWeight: "700",
          padding: "8px 24px",
          borderRadius: 20,
          border: "none",
          cursor: "pointer",
          backgroundColor: "#f0eefd",
          color: "#515ada",
          boxShadow: "0 0 10px #8490f8",
        }}
      >
        Back to Edit
      </button>

      <div ref={previewRef} style={{ maxWidth: 700, margin: "auto" }}>
        {renderPreviewPartitions()}
      </div>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button
          onClick={downloadImage}
          style={{
            fontSize: 18,
            fontWeight: "700",
            padding: "12px 36px",
            borderRadius: 24,
            border: "none",
            cursor: "pointer",
            backgroundColor: "#10a99b",
            color: "#fff",
            boxShadow: "0 0 20px #36c2b1",
          }}
        >
          Download as PNG
        </button>
      </div>
    </div>
  );
}

export default function MoodboardApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EditPage />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
}
