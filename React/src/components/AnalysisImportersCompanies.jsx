import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import chroma from 'chroma-js';

const AnalysisImportersCompanies = ({ data }) => {
  const [hoveredImporter, setHoveredImporter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const importers = data.importers || data.unique_companies;

  const sortedImporters = Object.keys(importers)
    .map((importer) => ({
      name: importer,
      total: importers[importer].total,
      countries: importers[importer],
    }))
    .sort((a, b) => b.total - a.total);

  const grandTotal = sortedImporters.reduce((acc, importer) => acc + importer.total, 0);

  const filteredImporters = sortedImporters.filter((importer) =>
    importer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMouseEnter = (importer) => {
    setHoveredImporter(importer.name);
  };

  const handleMouseLeave = () => {
    setHoveredImporter(null);
  };

  const renderPieChart = (importerData) => {
    const countryData = Object.entries(importerData.countries)
      .filter(([key]) => key !== 'total')
      .map(([country, value]) => ({
        name: country,
        value,
      }));

    const colors = chroma.scale(['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff']).colors(countryData.length);

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={countryData} dataKey="value" nameKey="name" outerRadius={100} fill="#8884d8">
            {countryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <RechartsTooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className='py-8'>
      <div
        className="items-center w-[400px]"
        style={{
          position: 'relative',
          left: '53%',
          transform: 'translate(-50%, 0%)',
        }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="relative py-1 text-lg rounded-full border-2 border-gray-500 focus:border-gray-700 outline-none transition text-center"
          placeholder="חיפוש"
          style={{ 
              width: "80%",
              paddingLeft: "60px",
              paddingRight: "60px" }}
          dir="rtl"
        />
        <span
          style={{
            position: "absolute",
            left: "10px",
            top: "10px",
            fontSize: "14px",
          }}
        >
          🔍
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', padding: '20px' }}>
        {filteredImporters.map((importer, index) => (
          <div
            key={importer.name}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              textAlign: 'center',
              position: 'relative',
              cursor: 'pointer',
              backgroundColor: chroma.hsl((index * 360) / filteredImporters.length, 0.7, 0.8).hex(),
            }}
            onMouseEnter={() => handleMouseEnter(importer)}
            onMouseLeave={handleMouseLeave}
          >
            <div><strong>{importer.name}</strong></div>
            <div>סה"כ: {importer.total}</div>
            <div>{((importer.total / grandTotal) * 100).toFixed(2)}%</div>

            {hoveredImporter === importer.name && (
              <div 
                style={{
                  width: '160%',
                  position: 'absolute',
                  top: '10px',
                  left: '100%',
                  zIndex: 10,
                  background: '#fff',
                  border: '1px solid #ccc',
                  padding: '20px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1',
                }}
              >
                {renderPieChart(importer)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisImportersCompanies;
