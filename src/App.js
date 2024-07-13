import React, { useState, useRef, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import "./App.css";
import { searchSemanticScholar, getPaperDetails } from "./utils/api";
import { extractBibTeXId, replaceBibTeXId, citeRegex, updateCiteCommands } from "./utils/utils";
import TextPanel from "./components/TextPanel";
import CitationPanel from "./components/CitationPanel";

const AutociteWebsite = () => {
  const [activeTab, setActiveTab] = useState("Text");
  const [textContent, setTextContent] = useState("");
  const [bibContent, setBibContent] = useState("");
  const [currentCiteIndex, setCurrentCiteIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tempBibContent, setTempBibContent] = useState("");
  const [focusState, setFocusState] = useState("text");
  const [noCiteFound, setNoCiteFound] = useState(false);
  const textareaRef = useRef(null);
  const tempBibTextareaRef = useRef(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFocusState(tab === "Text" ? "text" : "bib");
  };

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      setIsLoading(true);
      try {
        const acceptableQuery = query.replace('_', ' ');
        const results = await searchSemanticScholar(acceptableQuery);
        if (!results) {
          setErrorMessage(
            "No papers found. Ensure you're using spaces between words (e.g., 'lucas vit' instead of 'lucasvit')."
          );
        } else {
          setErrorMessage("");
          setSearchResults(results);
        }
      } catch (error) {
        console.error("Error searching Semantic Scholar:", error);
        setErrorMessage(
          "Error while searching. The API might be rate limited, try again soon. Check console for details."
        );
      } finally {
        setIsLoading(false);
      }
    }, 250),
    []
  );

  const debouncedGetPaperDetails = useCallback(
    debounce(async (paperId) => {
      setIsLoading(true);
      try {
        setErrorMessage("");
        const paperDetails = await getPaperDetails(paperId);
        setSelectedPaper(paperDetails);
        let bibtex = paperDetails.citationStyles.bibtex;

        const citeMatches = Array.from(textContent.matchAll(citeRegex));
        if (currentCiteIndex < citeMatches.length) {
          const citeContent = citeMatches[currentCiteIndex][1];
          bibtex = replaceBibTeXId(bibtex, citeContent);
        }
        setTempBibContent(bibtex);
        setFocusState("bibtex");
      } catch (error) {
        console.error("Error fetching paper details:", error);
        setErrorMessage(
          "Error while fetching. The API might be rate limited, try again soon. Check console for details."
        );
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [textContent, currentCiteIndex]
  );

  const handleCiteSearch = useCallback(() => {
    if (currentCiteIndex !== -1) {
      const citeMatches = Array.from(textContent.matchAll(citeRegex));
      if (currentCiteIndex < citeMatches.length) {
        const citeContent = citeMatches[currentCiteIndex][1];
        debouncedSearch(citeContent);
      }
    } else {
      setSearchResults([]);
      setTempBibContent("");
      setErrorMessage("");
    }
  }, [currentCiteIndex, textContent, debouncedSearch]);

  useEffect(() => {
    handleCiteSearch();
  }, [handleCiteSearch]);

  // scrolling to current cite
  useEffect(() => {
    if (textareaRef.current && currentCiteIndex !== -1) {
      const citeMatches = Array.from(textContent.matchAll(citeRegex));
      if (currentCiteIndex < citeMatches.length) {
        const { index, 0: match } = citeMatches[currentCiteIndex];
        const textarea = textareaRef.current;
        textarea.setSelectionRange(index, index + match.length);
        textarea.focus();

        const lines = textContent.substr(0, index).split("\n");
        const lineHeight =
          textarea.scrollHeight / textarea.value.split("\n").length;
        const scrollPosition = lines.length * lineHeight;
        textarea.scrollTop = scrollPosition - textarea.clientHeight / 2;
      }
    }
  }, [currentCiteIndex, textContent]);

  useEffect(() => {
    if (focusState === "bibtex" && tempBibTextareaRef.current) {
      tempBibTextareaRef.current.focus();
    }
    if (focusState === "bib" && textareaRef.current) {
      textareaRef.current.focus();
    }
    if (focusState === "text" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [focusState]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setTextContent(e.target.result);
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([bibContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "references.bib";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // handle key presses
  const handleKeyDown = (e) => {
    if (activeTab === "Text") {
      if (focusState === "text") {
        if (e.key === "Tab") {
          e.preventDefault();
          const citeMatches = Array.from(textContent.matchAll(citeRegex));
          if (citeMatches.length > 0) {
            setCurrentCiteIndex(
              (prevIndex) => (prevIndex + 1) % citeMatches.length
            );
            setSelectedResultIndex(-1);
            setFocusState("results");
            setNoCiteFound(false);
          } else {
            setNoCiteFound(true);
          }
        }
      } else if (focusState === "results") {
        if (e.key === "Tab") {
          e.preventDefault();
          const citeMatches = Array.from(textContent.matchAll(citeRegex));
          if (citeMatches.length > 0) {
            setCurrentCiteIndex(
              (prevIndex) => (prevIndex + 1) % citeMatches.length
            );
            setSelectedResultIndex(-1);
            setFocusState("results");
            setNoCiteFound(false);
          } else {
            setNoCiteFound(true);
          }
        }
        if (e.key >= "1" && e.key <= "7") {
          e.preventDefault();
          e.stopPropagation();
          const index = parseInt(e.key) - 1;
          if (index < searchResults.length) {
            handlePaperSelect(searchResults[index]);
          }
        }
      } else if (focusState === "bibtex") {
        if (e.key === "Tab") {
          e.preventDefault();
          setFocusState("append");
        }
      } else if (focusState === "append") {
        if (e.key === "Tab") {
          e.preventDefault();
          setFocusState("text");
        }
        if (e.key === "Enter") {
          e.preventDefault();
          handleAppendBibTeX();
        }
      }
    } else if (activeTab === "Bib") {
      if (e.key === "Tab") {
        e.preventDefault();
      }
    }
  };

  const handleTextareaClick = () => {
    setCurrentCiteIndex(-1);
    setFocusState("text");
  };

  const handlePaperSelect = (paper) => {
    debouncedGetPaperDetails(paper.paperId);
  };

  const handleAppendBibTeX = () => {
    const newBibTeX = tempBibContent.trim();
    const newId = extractBibTeXId(newBibTeX);
  
    if (newId) {
      // Replace spaces with underscores in the newId
      const noSpacesId = newId.replace(/\s+/g, '_');
      
      // Check if an entry with the same ID already exists
      const existingEntries = bibContent
        .split("\n\n")
        .filter((entry) => entry.trim() !== "");
      const updatedEntries = existingEntries.map((entry) => {
        const entryId = extractBibTeXId(entry);
        return entryId === noSpacesId ? newBibTeX : entry;
      });
  
      // If the ID doesn't exist, append the new entry
      if (!updatedEntries.includes(newBibTeX)) {
        updatedEntries.push(newBibTeX);
      }
  
      setBibContent(updatedEntries.join("\n\n"));
  
      // Update the text content to replace spaces with underscores in cite commands
      setTextContent(updateCiteCommands(textContent));
    } else {
      // If no ID could be extracted, just append the new entry
      setBibContent((prevContent) => {
        if (prevContent.trim() === "") {
          return newBibTeX;
        } else {
          return prevContent + "\n\n" + newBibTeX;
        }
      });
    }
  
    setTempBibContent("");
    const citeMatches = Array.from(textContent.matchAll(citeRegex));
    if (currentCiteIndex + 1 < citeMatches.length) {
      setCurrentCiteIndex(currentCiteIndex + 1);
      setFocusState("results");
    } else {
      handleTabChange("Bib");
      setSearchResults([]);
      setTempBibContent("");
      setErrorMessage("");
    }
  };

  return (
    <div className="autocite-container" onKeyDown={handleKeyDown}>
      <div className="autocite-main">
        <TextPanel
          activeTab={activeTab}
          textContent={textContent}
          bibContent={bibContent}
          handleTabChange={handleTabChange}
          handleFileUpload={handleFileUpload}
          handleDownload={handleDownload}
          setTextContent={setTextContent}
          setBibContent={setBibContent}
          handleTextareaClick={handleTextareaClick}
          textareaRef={textareaRef}
        />
        <CitationPanel
          focusState={focusState}
          isLoading={isLoading}
          errorMessage={errorMessage}
          noCiteFound={noCiteFound}
          searchResults={searchResults}
          selectedResultIndex={selectedResultIndex}
          handlePaperSelect={handlePaperSelect}
          tempBibContent={tempBibContent}
          setTempBibContent={setTempBibContent}
          handleAppendBibTeX={handleAppendBibTeX}
          tempBibTextareaRef={tempBibTextareaRef}
        />
      </div>
    </div>
  );
};

export default AutociteWebsite;