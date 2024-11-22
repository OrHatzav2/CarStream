import React, { useCallback, useEffect, useRef, useState } from "react";

const MiniSearchBar = ({ placeholderText, data, setValue, fromComparison }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(true);
  const resultContainer = useRef(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const containerRef = useRef(null);
  const [colored, setColored] = useState(false);

  useEffect(() => {
    if(fromComparison) {
      setColored(true);
      setSearchTerm(fromComparison);
    } 
  })

  const handleSearchChange = (e) => {
    const term = e.target.value;
    if(term === "") {
      setValue("");
      setColored(false);
    } else {
      setColored(true);
    }
    setSearchTerm(term);
    if (term) {
      const filtered = data.filter((item) =>
        item.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults([]);
    }
    setFocusedIndex(0);
  };

  const handleSelection = (selectedIndex) => {
    const selectedValue = filteredResults[selectedIndex];
    if (selectedValue) {
      setSearchTerm(selectedValue);
      setValue(selectedValue);
      resetSearchComplete();
    }
  };

  const resetSearchComplete = useCallback(() => {
    setFocusedIndex(-1);
    setShowResults(false);
    setFilteredResults([]);
  }, []);

  const handleKeyDown = (e) => {
    const { key } = e;

    if (key === "ArrowDown") {
      setFocusedIndex((prev) => (prev + 1) % filteredResults.length);
    }

    if (key === "ArrowUp") {
      setFocusedIndex((prev) =>
        (prev + filteredResults.length - 1) % filteredResults.length
      );
    }

    if (key === "Escape") {
      resetSearchComplete();
    }

    if (key === "Enter" && filteredResults.length > 0) {
      e.preventDefault();
      handleSelection(focusedIndex);
    }
  };

  useEffect(() => {
    if (filteredResults.length > 0 && !showResults) setShowResults(true);
    if (filteredResults.length <= 0) setShowResults(false);
  }, [filteredResults]);

  useEffect(() => {
    if (resultContainer.current) {
      resultContainer.current.scrollIntoView({
        block: "center",
      });
    }
  }, [focusedIndex]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        resetSearchComplete();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef, resetSearchComplete]);

  return (
    <div
      tabIndex={1}
      onBlur={resetSearchComplete}
      onKeyDown={handleKeyDown}
      className="relative"
    >
      {/* Search Bar */}
      <input
        value={searchTerm}
        onChange={handleSearchChange}
        type="text"
        className={`py-1 border rounded outline-none ${
          colored ? "" : "text-gray-400"
        }`}
        placeholder={placeholderText}
        style={{ 
            width: "100%",
            paddingLeft: "40px",
            paddingRight: "20px" }}
        dir="rtl"
      />

      {/* Search Results */}
      {showResults && (
        <div className="absolute mt-1 w-full p-2 bg-white shadow-lg rounded-bl rounded-br max-h-56 overflow-y-auto"
        style={{zIndex: 10}}>
          {filteredResults.map((item, index) => {
            return (
              <div
                key={index}
                onMouseDown={() => handleSelection(index)}
                ref={index === focusedIndex ? resultContainer : null}
                style={{
                  backgroundColor: index === focusedIndex ? "rgba(0,0,0,0.1)" : "",
                }}
                className="cursor-pointer hover:bg-black hover:bg-opacity-10 p-2 text-gray-400"
              >
                {item}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MiniSearchBar;
