import React, { useState } from 'react'; 

const SummaryItem = ({ item, itemKey }) => { 
  const [showFull, setShowFull] = useState(false);
  const hasALot = useState(Object.entries(item).length > 4);
  const [sortByAmount, setSortByAmount] = useState(true);

  const objectToString = (obj) => {
    const getDirection = (text) => {
      const hasHebrew = /[\u0590-\u05FF]/.test(text);
      const hasEnglish = /[A-Za-z]/.test(text);
      if (hasHebrew && !hasEnglish) return 'rtl';
      if (hasEnglish && !hasHebrew) return 'ltr';
      return 'rtl';
    };

    return Object.entries(obj)
      .sort(([keyA, valueA], [keyB, valueB]) => {
        return sortByAmount
          ? valueB - valueA || keyA.localeCompare(keyB)
          : keyA.localeCompare(keyB);
      })
      .map(([key, value]) => {
        const direction = getDirection(key);
        return (
          <span key={key} style={{ direction }}>
            ⊳ <b>{key}</b>: {value} {direction === 'rtl' ? 'רשומות' : 'records'}
            <br />
          </span>
        );
      });
  };

  let description = objectToString(item);
  if (!showFull) {
    if(Object.entries(item).length > 4) {
      description = description.slice(0, 3); 
      description.push(<span key="more">...</span>);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md relative w-full md:w-[350px]" dir="rtl">
      <div className="p-6">
        <div className="mb-6 flex justify-between">
          <h3 className="text-xl font-bold">{itemKey}</h3>
          {/* Sort toggle button */}
          <button
            onClick={() => setSortByAmount(!sortByAmount)}
            className="text-indigo-700 hover:text-indigo-500 text-sm"
            aria-label="Toggle sort order"
          >
            {sortByAmount ? 'מיין לפי שם' : 'מיין לפי כמות'}
          </button>
        </div>

        <div>{description}</div>
        {hasALot && (
          <button
            onClick={() => setShowFull((prevState) => !prevState)}
            className="text-indigo-700 mb-5 hover:text-indigo-500"
          >
            {showFull ? 'הצג פחות' : 'הצג יותר'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SummaryItem;
