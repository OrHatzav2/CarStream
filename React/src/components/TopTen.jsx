import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopTen = ({ data }) => {
  const smartKeys = 2;
  const navigate = useNavigate();
  const [selectedDataset, setSelectedDataset] = useState(Object.keys(data)[smartKeys]);
  const [activeSubDataset, setActiveSubDataset] = useState(
    Object.keys(data[selectedDataset])[1]
  );

  const handleMainSwitch = (dataset) => setSelectedDataset(dataset);
  const handleSubSwitch = (subDataset) => setActiveSubDataset(subDataset);

  const activeData = data[selectedDataset][activeSubDataset] || {};
  const entries = Object.entries(activeData);

  const rankColors = ['bg-yellow-300', 'bg-gray-300', 'bg-orange-300'];


  const handleNavigation = (name) => {
    navigate('/', {
      state: {
        key: selectedDataset,
        value: name,
      },
    });
  };

  return (
    <div className="w-full flex flex-col items-center space-y-8">
      <h3 className="text-3xl text-black sm:text3xl md:text-4xl mb-4">יבואיים מובילים</h3>

      {/* Main Dataset Switch */}
      <div className="flex space-x-4">
        {Object.keys(data).slice(0, 3).map((dataset) => (
          <button
            key={dataset}
            onClick={() => handleMainSwitch(dataset)}
            className={`px-6 py-2 rounded-full font-medium transition 
              ${selectedDataset === dataset ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-black'}
              hover:bg-indigo-500 hover:text-white`}
          >
            {dataset.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Sub Dataset Switch */}
      <div className="flex space-x-4">
        {Object.keys(data[selectedDataset]).map((subDataset) => (
          <button
            key={subDataset}
            onClick={() => handleSubSwitch(subDataset)}
            className={`px-6 py-2 rounded-full font-medium transition 
              ${activeSubDataset === subDataset ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-black'}
              hover:bg-indigo-500 hover:text-white`}
          >
            {subDataset.replace('_', ' ')}
          </button>
        ))}
      </div>
      {/* Top Ten List */}
      <ul className="w-full max-w-lg space-y-2" dir="rtl">
        {entries.map(([name, value], index) => (
          <li
            key={name}
            onClick={() => handleNavigation(name)}
            className={`flex justify-between items-center p-4 rounded-md text-lg cursor-pointer hover:bg-indigo-300
              ${index < 3 ? rankColors[index] : 'bg-gray-100'} 
              transition`}
          >
            <span className="font-bold">{index + 1}.</span>
            <span>{name.replace("_", " ")}</span>
            <span>{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopTen;
