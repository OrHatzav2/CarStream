import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';

const SearchBar = ({ setAnalysisResult, onSearchStart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [keys, setKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState("בחירת מפתח");
  const [showDropdown, setShowDropdown] = useState(false);
  const [data, setData] = useState({});
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const resultContainer = useRef(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const containerRef = useRef(null);
  const [pendingSelection, setPendingSelection] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  let { key, name } = location.state || {};

  useEffect(() => {
    const keys = ['יבואן', 'חברה'];//, 'סוג_רכב', 'ארץ_תוצרת', 'דגם', 'מספר_דגם'];
    if(key) {
      handleKeySelection(key);
      setFilteredResults([name]);
      setPendingSelection(true);
    }
    setKeys(keys);
  }, []);

  useEffect(() => {
    if (pendingSelection && filteredResults.length > 0) {
      handleSelection(0);
      setPendingSelection(false);
    }
  }, [filteredResults, pendingSelection]); 

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (selectedKey && data) {
      const filtered = data.filter((item) =>
        item.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredResults(filtered);
    }
  };

  const handleDropdownToggle = () => {
    setSearchTerm("");
    setShowDropdown(!showDropdown);
  };

  const handleKeySelection = (key) => {
    const url = `https://localhost:7157/search_key?key=${key}`
    axios
    .get(url, {
      headers: { "Access-Control-Allow-Origin": "*" },
    })
    .then((response) => {
      setData(response.data);
    })
    .catch((error) => {
      console.error("Error fetching search keys:", error);
    });

    const fixedKey = key.replace(' ', "_");
    setSelectedKey(fixedKey);
    setShowDropdown(false);
    setShowResults(false);
    if (searchTerm && data) {
      const filtered = data.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults([]);
    }
  };

  const handleSelection = (selectedIndex) => {
    onSearchStart();
    const selectedItem = filteredResults[selectedIndex];
    if (!selectedItem) return resetSearchComplete();
    setSearchTerm(selectedItem);

    const url = `https://localhost:7157/analysis/${selectedKey}=${selectedItem}`;
    axios
      .get(url, {
        headers: { "Access-Control-Allow-Origin": "*" },
      })
      .then((response) => {
        setAnalysisResult(response.data);

      })
      .catch((error) => {
        console.error("Error fetching analysis data:", error);
      });
  
    resetSearchComplete();
  };

  const resetSearchComplete = useCallback(() => {
    setFocusedIndex(-1);
    setShowResults(false);
    setFilteredResults([]);
    navigate(location.pathname, { replace: true, state: {} });
  }, []);

  const handleKeyDown = (e) => {
    const { key } = e;
    let nextIndexCount = 0;

    if (key === "ArrowDown")
      nextIndexCount = (focusedIndex + 1) % filteredResults.length;

    if (key === "ArrowUp")
      nextIndexCount = (focusedIndex + filteredResults.length - 1) % filteredResults.length;

    if (key === "Escape") {
      resetSearchComplete();
    }

    if (key === "Enter" && filteredResults.length > 0) {
      e.preventDefault();
      handleSelection(focusedIndex);
    }

    setFocusedIndex(nextIndexCount);
  };

  useEffect(() => {
    if (filteredResults.length > 0 && !showResults) setShowResults(true);
    if (filteredResults.length <= 0) setShowResults(false);
  }, [filteredResults]);

  useEffect(() => {
    if (!resultContainer.current) return;
    resultContainer.current.scrollIntoView({
      block: "center",
    });
  }, [focusedIndex]);

  // Detect outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef]);

  return (
    <div
      className="items-center w-[600px]"
      style={{
        position: 'relative',
        left: '50%',
        transform: 'translate(-50%, -15%)',
      }}
      ref={containerRef} // Attach the ref to the main container
    >
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
            className="w-[600px] px-5 py-3 text-lg rounded-full border-2 border-gray-500 focus:border-gray-700 outline-none transition text-center"
            placeholder={"חיפוש"}
            style={{ 
                width: "100%",
                paddingLeft: "40px",
                paddingRight: "60px" }}
            dir="rtl"
        />


        {/* Search Icon */}
        <span
          style={{
            position: "absolute",
            left: "15px",
            top: "15px",
            fontSize: "18px",
            color: "gray",
          }}
        >
          🔍
        </span>

        {/* Dropdown Button */}
        <button
          onClick={handleDropdownToggle}
          className="rounded-full bg-indigo-500"
          style={{
            position: "absolute",
            right: "12px",
            top: "12px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "white",
            padding: "5px",
          }}
        >
          {selectedKey.replace("_", ' ')}{" "}
          <span
            style={{
              marginLeft: "3px",
              fontSize: "12px",
              color: "white",
            }}
          >
            &#9660;
          </span>
        </button>

        {/* Key Dropdown */}
        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "0",
              background: "white",
              border: "1px solid #ccc",
              zIndex: 1000,
            }}
          >
            {keys.map((key) => (
              <div
                key={key}
                onClick={() => handleKeySelection(key)}
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  background: selectedKey === key ? "#eee" : "white",
                }}
              >
                {key.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        )}

        {/* Search Results */}
        {showResults && (
          <div className="absolute mt-1 w-full p-2 bg-white shadow-lg rounded-bl rounded-br max-h-56 overflow-y-auto">
            {filteredResults.map((item, index) => {
              return (
                <div
                  key={index}
                  onMouseDown={() => handleSelection(index)}
                  ref={index === focusedIndex ? resultContainer : null}
                  style={{
                    backgroundColor: index === focusedIndex ? "rgba(0,0,0,0.1)" : "",
                  }}
                  className="cursor-pointer hover:bg-black hover:bg-opacity-10 p-2 text-center"
                >
                  {item}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;