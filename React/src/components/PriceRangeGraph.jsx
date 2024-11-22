import React, { useState, useMemo } from "react";

const PriceRangeGraph = ({ data }) => {
  const [tooltip, setTooltip] = useState({ show: false, content: "", x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState("");

  const graphData = useMemo(() => {
    return Object.keys(data)
      .map((model) => ({
        model,
        min: data[model].min,
        max: data[model].max,
      }))
      .filter(({ model }) =>
        model.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [data, searchTerm]);

  const globalMin = Math.min(...graphData.map((d) => d.min));
  const globalMax = Math.max(...graphData.map((d) => d.max));

  const maxModelsPerGraph = 20;
  const chunks = [];
  for (let i = 0; i < graphData.length; i += maxModelsPerGraph) {
    chunks.push(graphData.slice(i, i + maxModelsPerGraph));
  }

  const handleMouseOver = (event, chunk) => {
    const { clientX, clientY } = event;
    const chunkData = chunk
      .map((d) => `${d.model}: Min - ${d.min}, Max - ${d.max}`)
      .join("\n");

    setTooltip({
      show: true,
      content: chunkData,
      x: clientX + 10,
      y: clientY + 550,
    });
  };

  const handleMouseOut = () => {
    setTooltip({ show: false, content: "", x: 0, y: 0 });
  };

  const renderGraph = (chunk, index) => (
    <div
      key={index}
      className="w-full lg:w-1/2 xl:w-1/3 p-4"
      onMouseOver={(event) => handleMouseOver(event, chunk)}
      onMouseOut={handleMouseOut}
    >
      <svg width="100%" height="105%" viewBox="0 0 700 400" className="bg-gray-100 border border-gray-300">
        <g transform="translate(70, 10)">
          <line x1="0" y1="350" x2="0" y2="0" stroke="black" />
          {[...Array(11).keys()].map((i) => {
            const value = globalMin + ((globalMax - globalMin) * i) / 10;
            return (
              <g key={i}>
                <text x="-10" y={350 - i * 35} fontSize="10" textAnchor="end">
                  {Math.round(value)}
                </text>
                <line x1="0" y1={350 - i * 35} x2="600" y2={350 - i * 35} stroke="#e0e0e0" />
              </g>
            );
          })}

          {chunk.map((d, i) => (
            <g key={i}>
              <line
                x1={i * 30}
                y1={350 - ((d.min - globalMin) / (globalMax - globalMin)) * 350}
                x2={i * 30}
                y2={350 - ((d.max - globalMin) / (globalMax - globalMin)) * 350}
                stroke="blue"
                strokeWidth="2"
              />
              <circle cx={i * 30} cy={350 - ((d.min - globalMin) / (globalMax - globalMin)) * 350} r="4" fill="red" />
              <circle cx={i * 30} cy={350 - ((d.max - globalMin) / (globalMax - globalMin)) * 350} r="4" fill="green" />
              <text x={i * 30 - 10} y="380" transform={`rotate(-30, ${i * 30}, 400)`} fontSize="10" textAnchor="start">
                {d.model}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );

  return (
    <div className="py-8">
      <div
        className="items-center w-[400px]"
        style={{
          position: "relative",
          left: "53%",
          transform: "translate(-50%, 0%)",
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
            paddingRight: "60px",
          }}
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

      <div className="flex flex-wrap justify-center relative">
        {chunks.map((chunk, index) => renderGraph(chunk, index))}
      </div>

      {tooltip.show && (
        <div
          style={{
            position: "absolute",
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "5px",
            borderRadius: "5px",
            fontSize: "12px",
            whiteSpace: "pre-line",
            zIndex: 1000,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default PriceRangeGraph;
