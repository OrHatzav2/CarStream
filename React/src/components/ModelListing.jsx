import React, { useState } from 'react'; 
import { FaShekelSign } from 'react-icons/fa';

const ModelListing = ({ model, modelKey }) => { 
  const [showFull, setShowFull] = useState(false);

  const price = model.price_range;
  
  let description = 
    "סוג רכב: " + model.סוג_רכב + ",\n" + 
    "דגם: " + model.דגם + ",\n\n" + 
    "יבואנים של הדגם:\n";

  const importers = Object.entries(model.importers).map(
    ([importer, amount], index) => (
      `⊳ ${importer}: ${amount}${index !== Object.entries(model.importers).length - 1 ? ',' : ''}`
    )
  ).join('\n');

  description += importers;

  if (showFull) {
    description = description.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  } else {
    description = description.substring(0, 30) + '...';
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md relative w-full md:w-[350px]" dir="rtl">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold">
            {modelKey}
          </h3>
        </div>

        <div>{description}</div>
        
        <button onClick={() => setShowFull((prevState) => !prevState)}
          className="text-indigo-700 mb-5 hover:text-indigo-500">
          {showFull ? 'הצג פחות' : 'הצג יותר'}
        </button>

        <h3 className="text-gray-500 mb-2">כמות הייבוא של הדגם: {model.record_count}</h3>

        <div className="border border-gray-100 mb-5"></div>

        <div className="flex flex-col lg:flex-row justify-between mb-4">
          <div className="text-orange-700 mb-3">
            <FaShekelSign className="inline text-lg" />
            {` ${price.max} - ${price.min}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelListing;
