import React from 'react';
import TopTen from '../components/TopTen';
import Spinner from '../components/Spinner';
import PieChart from '../components/PieChart';
import { FaExclamationTriangle } from 'react-icons/fa';

const ComparisonPage = ({ data, loading }) => {
  if(!data && !loading) {
    return <div className='flex flex-col items-center mt-20'>
      <FaExclamationTriangle className='text-yellow-400 text-6xl mb-4' />
      <h3 className="text-4xl text-black mb-4">
          אבד הקשר עם השרת
      </h3>
    </div>;
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      {loading ? (
        <Spinner loading={loading} />
      ) : (
        <div className="flex w-full max-w-screen-xl space-x-8">
          {/* Left Side (Charts) */}
          <div className="flex-1 flex flex-col space-y-8"
          style={{ marginLeft: "50px" }}>
            <PieChart data={data.סוג_רכב} />
          </div>

          {/* Right Side (TopTen Component) */}
          <div
            className="flex-2 bg-white shadow-lg p-14 rounded-lg"
            style={{ minWidth: '40%', maxWidth: '50%', marginRight: "50px" }}
          >
            <TopTen data={data} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonPage;
