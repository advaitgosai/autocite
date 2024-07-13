import React from 'react';
import { ArrowUp, ArrowDown } from "lucide-react";

const TextPanel = ({ 
  activeTab, 
  textContent, 
  bibContent, 
  handleTabChange, 
  handleFileUpload, 
  handleDownload, 
  setTextContent, 
  setBibContent, 
  handleTextareaClick, 
  textareaRef 
}) => {
  return (
    <div className="autocite-panel">
      <div className="panel-header">
        <div className="autocite-tab-container">
          <button
            className={`autocite-tab ${activeTab === "Text" ? "active" : ""}`}
            onClick={() => handleTabChange("Text")}
          >
            Text
          </button>
          <button
            className={`autocite-tab ${activeTab === "Bib" ? "active" : ""}`}
            onClick={() => handleTabChange("Bib")}
          >
            Bib
          </button>
        </div>
        <div className="autocite-actions">
          {activeTab === "Text" ? (
            <label className="autocite-tab active">
              <ArrowUp size={13} />
              <input
                type="file"
                accept=".txt,.tex"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </label>
          ) : (
            <button className="autocite-tab active" onClick={handleDownload}>
              <ArrowDown size={13} />
            </button>
          )}
        </div>
      </div>
      <div className="autocite-textarea-container">
        <textarea
          ref={textareaRef}
          className={`autocite-textarea`}
          value={activeTab === "Text" ? textContent : bibContent}
          onChange={(e) =>
            activeTab === "Text"
              ? setTextContent(e.target.value)
              : setBibContent(e.target.value)
          }
          onClick={handleTextareaClick}
        />
        {activeTab === "Text" && !textContent && (
          <div className="autocite-placeholder">
            Enter your text or upload a .txt / .tex file
          </div>
        )}
      </div>
    </div>
  );
};

export default TextPanel;