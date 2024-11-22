import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AnalysisYear = ({ data }) => {
  const recordsPerYear = data.records_per_year;
  const isImporter = !data.manufacturer && data.importer;
  const title = data.manufacturer || data.importer;

  const chartData = Object.keys(recordsPerYear).map((year) => {
    const yearData = { year, total: isImporter ? recordsPerYear[year] : recordsPerYear[year].total };
    
    if (!isImporter) {
      Object.keys(recordsPerYear[year]).forEach((key) => {
        if (key !== "total") {
          yearData[key] = recordsPerYear[year][key];
        }
      });
    }
    return yearData;
  });

  const countries = isImporter ? [] : Array.from(
        new Set(
          Object.values(recordsPerYear).flatMap((yearData) =>
            Object.keys(yearData).filter((key) => key !== "total")
          )
        )
      );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ background: "white", padding: "10px", border: "1px solid #ccc" }}>
          <p className="label">{`Year : ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name} : ${entry.value}`}
            </p>
          ))}
          
          {!isImporter && (
            <p style={{ fontWeight: "bold" }}>{`Total : ${payload[0].payload.total}`}</p>
          )}
        </div>
      );
    }
    return null;
  };
      
  return (
    <div style={{ width: "100%", height: isImporter ? 300 : 420 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <h3 className="text-4xl font-extrabold text-black sm:text-5xl md:text-6xl">
          {title}
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={isImporter ? 300 : 400}>
        <LineChart
            data={chartData}
            margin={{ top: 20, right: 100, left: 80, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" label={{ value: "Year", position: "insideBottomRight", dy: 10 }} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />

          {isImporter ? (
            <Line
              type="monotone"
              dataKey="total"
              stroke="hsl(200, 70%, 50%)"
              activeDot={{ r: 8 }}
              name="Total"
            />
          ) : (
            countries.map((country, index) => (
              <Line
                key={country}
                type="monotone"
                dataKey={country}
                stroke={`hsl(${(index * 360) / countries.length}, 70%, 50%)`}
                activeDot={{ r: 8 }}
                name={country}
              />
            ))
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalysisYear;
