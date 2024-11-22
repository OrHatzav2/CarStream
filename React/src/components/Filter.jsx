import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MiniSearchBar from './MiniSearchBar';
import { useLocation } from 'react-router-dom';

const FilterComponent = ({ setChunkedData, setSummaryData, onFilteringStart, setFilterString }) => {
  const [shemYevuanOptions, setShemYevuanOptions] = useState([]);
  const [tozeretNmOptions, setTozeretNmOptions] = useState([]);
  const [eretzTozeretOptions, setEretzTozeretOptions] = useState([]);
  const [degemNmOptions, setDegemNmOptions] = useState([]);
  const [kinuyMishariOptions, setKinuyMishariOptions] = useState([]);
  const [filters, setFilters] = useState({
    יבואן: '',
    סוג_רכב: '',
    חברה: '',
    ארץ_תוצרת: '',
    מספר_דגם: '',
    דגם: '',
    משנת_ייצור: '',
    עד_שנת_ייצור: '',
    ממחיר: '',
    עד_מחיר: ''
  });
  const [yearRange, setYearRange] = useState(false);
  const [priceRange, setPriceRange] = useState(false);


  const currentYear = new Date().getFullYear();
  const toMaxYear = !filters.עד_שנת_ייצור? currentYear : filters.עד_שנת_ייצור;
  const fromMinYear = parseInt(!filters.משנת_ייצור? "1996" : filters.משנת_ייצור);
  
  const fromYearOptions = Array.from({ length: toMaxYear - 1996 + 1 }, (_, i) => 1996 + i);
  const toYearOptions = Array.from({ length: currentYear - fromMinYear + 1 }, (_, i) => fromMinYear + i);

  const [pendingSelection, setPendingSelection] = useState(false);
  const [comparisonImporter, setComparisonImporter] = useState("");
  const [comparisonCompany, setComparisonCompany] = useState("");
  const [comparisonModel, setComparisonModel] = useState("");
  const location = useLocation();
  let { key, value } = location.state || {};
  useEffect(() => {
    if(key) {
        let processedValue = value;
        if(key === "יבואן") {
            setComparisonImporter(value);
        } else if(key === "חברה") {
            setComparisonCompany(value);
        } else if(key === "דגם") {
            processedValue = value.split("_")[1];
            setComparisonModel(processedValue);
        }
        handleInputChange(key, processedValue);
        setPendingSelection(true);
    }
  }, []);
  useEffect(() => {
    if (pendingSelection) {
        console.log(filters);
        handleSubmit();
        setComparisonImporter("");
        setComparisonCompany("");
        setComparisonModel("");
        setPendingSelection(false);
    }
  }, [pendingSelection]); 

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
        axios
        .get("https://localhost:7157/search_fields", {
        headers: { "Access-Control-Allow-Origin": "*" },
        })
        .then((response) => {
            setShemYevuanOptions(response.data.data.יבואן);
            setTozeretNmOptions(response.data.data.חברה);
            setEretzTozeretOptions(response.data.data.ארץ_תוצרת);
            setDegemNmOptions(response.data.data.מספר_דגם);
            setKinuyMishariOptions(response.data.data.דגם);
        })
        .catch((error) => {
            console.error("Error fetching options:", error);
        });
    };
    fetchData();
  }, []);
 
  const handleInputChange = (key, value) => {
    if(key === "ממחיר" || key === "עד_מחיר") {
        if(value < 0) {value = 0;}
    }
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

    const handleSubmit = () => {
        onFilteringStart();
        let filterString = "";
        if(filters.יבואן) {
            filterString += "יבואן=" + filters.יבואן + "&";
        }
        if(filters.סוג_רכב) {
            filterString += "סוג_רכב=" + filters.סוג_רכב + "&";
        }
        if(filters.חברה) {
            filterString += "חברה=" + filters.חברה + "&";
        }
        if(filters.ארץ_תוצרת) {
            filterString += "ארץ_תוצרת=" + filters.ארץ_תוצרת + "&";
        }
        if(filters.דגם) {
            filterString += "דגם=" + filters.דגם + "&";
        }
        if(filters.מספר_דגם) {
            filterString += "מספר_דגם=" + filters.מספר_דגם + "&";
        }
        if(filters.משנת_ייצור && filters.עד_שנת_ייצור && yearRange) {
            filterString += "משנת_ייצור=" + filters.משנת_ייצור + "&" +
            "עד_שנת_ייצור=" + filters.עד_שנת_ייצור + "&";
        } else if(filters.משנת_ייצור && yearRange) {
            filterString += "משנת_ייצור=" + filters.משנת_ייצור + "&" +
                "עד_שנת_ייצור=" + currentYear + "&";
        } else if(filters.עד_שנת_ייצור && yearRange) {
            filterString += "משנת_ייצור=1996&" +
                "עד_שנת_ייצור=" + filters.עד_שנת_ייצור + "&";
        } else if (yearRange) {
            filterString += "משנת_ייצור=1996&עד_שנת_ייצור=" + currentYear+ "&";
        } else if(filters.משנת_ייצור) {
            filterString += "משנת_ייצור="+filters.משנת_ייצור+"&";
        }

        if(filters.ממחיר && filters.עד_מחיר && priceRange) {
            if(parseInt(filters.ממחיר) > parseInt(filters.עד_מחיר)){
                filterString += "ממחיר=" + filters.עד_מחיר + "&" +
                "עד_מחיר=" + filters.ממחיר;
            }
            else {
                filterString += "ממחיר=" + filters.ממחיר + "&" +
                "עד_מחיר=" + filters.עד_מחיר;
            }
        } else if(filters.ממחיר && priceRange) {
            filterString += "ממחיר=" + filters.ממחיר + "&" +
                "עד_מחיר=2000000000";
        } else if(filters.עד_מחיר && priceRange) {
            filterString += "ממחיר=0&" +
                "עד_מחיר=" + filters.עד_מחיר;
        } else if (priceRange) {
            filterString += "ממחיר=0&עד_מחיר=2000000000";
        } else if(filters.ממחיר) {
            filterString += "ממחיר="+filters.ממחיר;
        }

        setFilterString(filterString);
        axios
        .get("https://localhost:7157/summary_data?" + filterString, {
          headers: { "Access-Control-Allow-Origin": "*" },
        })
        .then((response) => {
            console.log(response);
            setSummaryData(response.data);
        })
        .catch((error) => {
            setSummaryData(null);
          console.error("Error fetching summary data:", error);
        });

        axios
        .get("https://localhost:7157/chunked_data?chunkNumber=1&"+ filterString, {
          headers: { "Access-Control-Allow-Origin": "*" },
        })
        .then((response) => {
            console.log(response);
            setChunkedData(response.data);
        })
        .catch((error) => {
            setChunkedData(null);
          console.error("Error fetching summary data:", error);
        });

    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat().format(value);
    };    

  const startYear = filters.משנת_ייצור? "-"+filters.משנת_ייצור : "ההתחלה";
  const endYear = filters.עד_שנת_ייצור? filters.עד_שנת_ייצור : "הסוף";

  const minPrice = filters.ממחיר? formatNumber(filters.ממחיר) : "0";
  const maxPrice = filters.עד_מחיר? formatNumber(filters.עד_מחיר) : "מקסימלי";

  return (
    <div className="filter-form p-4 border bg-gray-100 w-[70%]" dir="rtl">
      <div className='grid grid-cols-2 gap-4'>
        <div className="filter-field">
            <label className="block font-bold">יבואן:</label>
            <MiniSearchBar
                data={shemYevuanOptions}
                setValue={(value) => handleInputChange('יבואן', value)}
                placeholderText="יבואן"
                fromComparison={comparisonImporter}
            />
        </div>

        {/* Sug Degem */}
            <div className="filter-field">
            <label className="block font-bold">סוג רכב:</label>
            <div className="flex space-x-4 gap-2">
                <label>
                <input
                    type="checkbox"
                    checked={filters.סוג_רכב === 'פרטי'}
                    onChange={() =>
                    handleInputChange('סוג_רכב', filters.סוג_רכב === 'פרטי' ? '' : 'פרטי')
                    }
                />{' '}
                פרטי
                </label>
                <label>
                <input
                    type="checkbox"
                    checked={filters.סוג_רכב === 'מסחרי'}
                    onChange={() =>
                    handleInputChange('סוג_רכב', filters.סוג_רכב === 'מסחרי' ? '' : 'מסחרי')
                    }
                />{' '}
                מסחרי
                </label>
            </div>
            </div>

            <div className="filter-field">
                <label className="block font-bold">חברה:</label>
                <MiniSearchBar
                    data={tozeretNmOptions}
                    setValue={(value) => handleInputChange('חברה', value)}
                    placeholderText="חברה"
                    fromComparison={comparisonCompany}
                />
            </div>
            <div className="filter-field">
                <label className="block font-bold">ארץ תוצרת:</label>
                <MiniSearchBar
                    data={eretzTozeretOptions}
                    setValue={(value) => handleInputChange('ארץ_תוצרת', value)}
                    placeholderText="ארץ תוצרת"
                />
            </div>

            <div className="filter-field">
                <label className="block font-bold">מספר דגם:</label>
                <MiniSearchBar
                    data={degemNmOptions}
                    setValue={(value) => handleInputChange('מספר_דגם', value)}
                    placeholderText="מספר דגם"
                />
            </div>

            <div className="filter-field">
                <label className="block font-bold">דגם:</label>
                <MiniSearchBar
                    data={kinuyMishariOptions}
                    setValue={(value) => handleInputChange('דגם', value)}
                    placeholderText="דגם"
                    fromComparison={comparisonModel}
                />
                </div>

        <div className="filter-field mt-4">
            <div className='flex gap-3'>
                <label className="block font-bold">שנת ייצור:</label>
                <div>
                    <input
                        type="checkbox"
                        checked={yearRange}
                        onChange={() => setYearRange(!yearRange)}

                    />
                    <span className="mr-1">טווח</span>
                </div>
            </div>
            <div className="flex space-x-4">
                <select
                    value={filters.משנת_ייצור}
                    onChange={(e) => handleInputChange('משנת_ייצור', e.target.value)}
                    className={`px-3 py-2 rounded w-full
                         ${!filters.משנת_ייצור ? 'text-gray-400' : 'text-black'}`}
                    >
                        <option value="" className="text-gray-400">{yearRange ? "משנת" : "שנה"}</option>
                        {fromYearOptions.map((year) => (
                            <option key={year} value={year}>
                            {year}
                            </option>
                        ))}
                </select>


            {yearRange && (
                <select
                    value={filters.עד_שנת_ייצור}
                    onChange={(e) => handleInputChange('עד_שנת_ייצור', e.target.value)}
                    className={`px-3 py-2 rounded w-full
                         ${!filters.עד_שנת_ייצור ? 'text-gray-400' : 'text-black'}`}
                    >
                        <option value="" className="text-gray-400">עד שנת</option>
                        {toYearOptions.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                        ))}
              </select>
              
              )}
            </div>
            {yearRange && (
                <label className="block mr-2"
                style={{fontSize: '12px'}} >*מ{startYear} עד {endYear}</label>
            )}
        </div>

        {/* Mehir */}
        <div className="filter-field mt-4">
            <div className='flex gap-3'>
                <label className="block font-bold">מחיר:</label>
                <div>
                    <input
                        type="checkbox"
                        checked={priceRange}
                        onChange={() => setPriceRange(!priceRange)}
                    />
                    <span className="mr-1">טווח</span>
                </div>
            </div>
            <div className="flex space-x-4">
                <input
                    placeholder={priceRange ? "ממחיר" : "מחיר"}
                    value={filters.ממחיר ? formatNumber(filters.ממחיר) : ''}
                    onChange={(e) => {
                        const numericValue = e.target.value.replace(/,/g, ''); 
                        handleInputChange('ממחיר', parseInt(numericValue, 10));
                    }}
                    className={`border p-2 w-full outline-none ${
                        !filters.ממחיר ? "" : "text-gray-400"
                      }`}
                />
                {priceRange && (
                    <input
                        placeholder="עד מחיר"
                        value={filters.עד_מחיר ? formatNumber(filters.עד_מחיר) : ''}
                        onChange={(e) => {
                            const numericValue = e.target.value.replace(/,/g, ''); 
                            handleInputChange('עד_מחיר', parseInt(numericValue, 10));
                        }}
                        className={`border p-2 w-full outline-none ${
                            !filters.עד_מחיר ? "" : "text-gray-400"
                          }`}
                    />
                )}
            </div>                
            {priceRange && (
                <label className="block mr-2"
                style={{fontSize: '12px'}} >*מ-{minPrice} עד {maxPrice}</label>
            )}
        </div>
      </div>
      {/* Submit Button */}
      <div className="flex justify-center">
            <button
                onClick={handleSubmit}
                className="mt-6 bg-indigo-700 text-white p-2 rounded w-[20%]
                 hover:bg-indigo-500 ">
                חיפוש
            </button>
      </div>
    </div>
  );
};

export default FilterComponent;
