import axios from "axios";
import React, { useState } from "react";

const DynamicTable = ({ data, amountRecords, filterString }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [cachedPages, setCachedPages] = useState({ 1: data });
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isSortLoading, setSortLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const rowsPerPage = 20;

  const fetchPageData = async (header, direction, page, resetCache) => {
    if (!resetCache) setLoading(true);
    try {
      const response = await axios.get(
        `https://localhost:7157/chunked_data?chunkNumber=${page}&sortedBy=${header}&sortDirection=${direction}&${filterString}`,
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
      if (resetCache) setCachedPages({});
      setCachedPages((prev) => ({ ...prev, [page]: response.data.records }));
    } catch (error) {
      console.error("Error fetching page data:", error);
    } finally {
      setLoading(false);
      setSortLoading(false);
    }
  };

  const handleSort = (header) => {
    setSortLoading(true);
    let direction = "asc";
    if (sortConfig.key === header && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: header, direction });
    setCurrentPage(1);
    fetchPageData(header, direction, 1, true);
  };

  const toggleColumnVisibility = (header) => {
    setHiddenColumns((prev) =>
      prev.includes(header)
        ? prev.filter((col) => col !== header)
        : [...prev, header]
    );
  };

  const handleNextPage = async () => {
    const nextPage = currentPage + 1;
    if (!cachedPages[nextPage]) {
      await fetchPageData(sortConfig.key, sortConfig.direction, nextPage, false);
    }
    setCurrentPage(nextPage);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleExportToExcel = async () => {
    setIsExcelLoading(true);
    try {
      const response = await axios.get(
        `https://localhost:7157/get_excel?${filterString}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "filtered_data.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    } finally {
      setIsExcelLoading(false);
    }
  };

  const pageData = cachedPages[currentPage] || [];

  return (
    <div className="w-full flex flex-col items-center px-4">
      <h3 className="text-4xl text-black sm:text-5xl md:text-6xl mb-4">
        כלל המידע המפולתר
      </h3>
      <div className="mb-4">
        <button
          onClick={handleExportToExcel}
          className="px-10 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-2"
        >
          <span>ייצוא לאקסל</span>
          {isExcelLoading && (
            <div className="loader border-t-transparent border-white border-4 rounded-full w-5 h-5 animate-spin"></div>
          )}
        </button>
      </div>
      <div className="mt-4 flex items-center space-x-4 mb-2">
        <button
          onClick={handleNextPage}
          disabled={currentPage === Math.ceil(amountRecords / rowsPerPage)}
          className={`px-4 py-1 rounded ${
            currentPage === Math.ceil(amountRecords / rowsPerPage)
              ? "bg-gray-300"
              : "bg-indigo-700 hover:bg-indigo-500"
          } text-white flex items-center space-x-2`}
        >
          <span>הבא</span>
          {isLoading && (
            <div className="loader border-t-transparent border-white border-4 rounded-full w-5 h-5 animate-spin"></div>
          )}
        </button>
        <span>
          עמוד {currentPage} מתוך {Math.ceil(amountRecords / rowsPerPage)}
        </span>
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-1 rounded ${
            currentPage === 1 ? "bg-gray-300" : "bg-indigo-700 hover:bg-indigo-500"
          } text-white`}
        >
          הקודם
        </button>
      </div>
      <div className="flex mb-4 space-x-2">
        {Object.keys(pageData[0] || {}).map((header) =>
          hiddenColumns.includes(header) ? (
            <button
              key={header}
              onClick={() => toggleColumnVisibility(header)}
              className="px-2 py-1 bg-gray-200 text-black rounded border"
            >
              הצג {header.replace(/_/g, " ")}
            </button>
          ) : null
        )}
      </div>
      <div className="overflow-x-auto max-w-screen-lg w-full">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              {Object.keys(pageData[0] || {}).map((header) =>
                !hiddenColumns.includes(header) ? (
                  <th
                    key={header}
                    className="relative px-4 py-2 border border-gray-300 bg-gray-100 text-left cursor-pointer"
                    onClick={() => handleSort(header)}
                  >
                    {header.replace(/_/g, " ")}{" "}
                    {sortConfig.key === header &&
                      (sortConfig.direction === "asc" ? "▲" : "▼")}
                    {sortConfig.key === header && isSortLoading && (
                      <div className="loader border-t-transparent border-black
                      border-4 rounded-full w-5 h-5 animate-spin"></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColumnVisibility(header);
                      }}
                      className="absolute top-0 right-0 p-1 text-gray-600 hover:text-gray-900"
                    >
                      ⌧
                    </button>
                  </th>
                ) : null
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.keys(row).map((key) =>
                  !hiddenColumns.includes(key) ? (
                    <td key={key} className="px-4 py-2 border border-gray-300">
                      {row[key]}
                    </td>
                  ) : null
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicTable;
