import React from 'react';
import { Check } from "lucide-react";

const CitationPanel = ({
  focusState,
  isLoading,
  errorMessage,
  noCiteFound,
  searchResults,
  selectedResultIndex,
  handlePaperSelect,
  tempBibContent,
  setTempBibContent,
  handleAppendBibTeX,
  tempBibTextareaRef
}) => {
  return (
    <div className="autocite-panel">
      <div className="panel-header right">
        <div className="autocite-tab active">autocite</div>
      </div>
      <div
        className={`search-results-base ${
          focusState === "results" ? "search-results-focused" : ""
        }`}
      >
        {isLoading && (
          <div className="message loading-message">Loading...</div>
        )}
        {errorMessage && (
          <div className="message error-message">{errorMessage}</div>
        )}
        {noCiteFound && (
          <div className="message error-message">
            No instances of \cite{} found.
          </div>
        )}
        {!isLoading &&
          searchResults.map((paper, index) => (
            <div
              key={index}
              className={`search-result ${
                index === selectedResultIndex ? "selected" : ""
              }`}
              onClick={() => handlePaperSelect(paper)}
            >
              [{index + 1}] {paper.title}
            </div>
          ))}
      </div>
      <div className="bibtex-citation">
        <textarea
          ref={tempBibTextareaRef}
          className={`autocite-textarea`}
          value={tempBibContent}
          onChange={(e) => setTempBibContent(e.target.value)}
        />
        {tempBibContent && (
          <button className={`autocite-tab ${focusState === 'append' ? 'active' : ''}`} onClick={handleAppendBibTeX}>
            <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CitationPanel;