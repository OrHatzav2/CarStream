import React from 'react';
import SummaryItem from './SummaryItem';
const SummaryListings = ({ data }) => {
  const info = data.analysis;
  const total = data.total_filtered;
  const objectToString = (obj) => {
    return Object.entries(obj)
      .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
      .join(", ");
  };
  
  const filters = objectToString(data.filters) || "אין";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <h3 className="text-4xl text-black sm:text-4xl md:text-5xl">
          סיכום המידע
        </h3>
        <div className='bg-indigo-100 w-full justify-center flex py-2' dir='rtl'>
          <label className="block " style={{fontSize: '22px'}}><b>כמות תוצאות: </b>{total}</label>
        </div>
        <div className='bg-indigo-100 w-full justify-center flex gap-20'
        style={{fontSize: '20px'}} dir='rtl'>
          <label className="block"><b>פילטרים: </b>{filters}</label>
        </div>
    <section className="bg-indigo-100 px-5 py-10 mb-12">
      <div className="container-xl lg:container m-auto">
        {info && (
          <div className="flex flex-wrap justify-center gap-4">
          {Object.keys(info)
          .filter((key) => Object.keys(info[key]).length > 0)
          .map((key) => (
            <div key={key} className="w-full sm:w-1/2 md:w-1/3 flex justify-center">
              <SummaryItem item={info[key]} itemKey={key.replace(/_/g, ' ')} />
            </div>
          ))}
        </div>
        
        
        )}
      </div>
    </section>
    </div>

  );
};

export default SummaryListings;
