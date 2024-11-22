import React, { useState } from 'react';
import ModelListing from './ModelListing';
import PriceRangeGraph from './PriceRangeGraph';

const ModelListings = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const info = data.model_info;
  const priceRangeData = data.price_range_per_model;

  let filteredModels;
  if(info) {
     filteredModels = Object.keys(info).filter((key) =>
      key.toLowerCase().includes(searchTerm.toLowerCase())
    ); 
  }

  return (
    <section className="bg-indigo-100 px-5 py-7">
      {info && (
        <div
          className="items-center w-[400px]"
          style={{
            position: 'relative',
            left: '53%',
            transform: 'translate(-50%, -15%)',
          }}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative py-1 text-lg rounded-full border-2 border-gray-500 focus:border-gray-700 outline-none transition text-center"
            placeholder={"חיפוש"}
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
      )}

      <div className="container-xl lg:container m-auto py-4">
        {info && (
          <div className="flex flex-wrap justify-center gap-4">
            {filteredModels.map((key) => (
              <ModelListing className="w-full sm:w-1/2 md:w-1/3 flex justify-center"
              key={key} model={info[key]} modelKey={key} />
            ))}
          </div>
        )}
        {priceRangeData && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-center ">טווח מחירים לכל מודל</h2>
            <PriceRangeGraph data={priceRangeData} />
          </div>
        )}
      </div>
    </section>
  );
};

export default ModelListings;
