import React, {useState} from 'react'
import FilterComponent from '../components/Filter'
import Spinner from "../components/Spinner";
import DynamicTable from '../components/DynamicTable';
import SummaryListings from '../components/SummaryListings';
import Hero from "../components/Hero";

const AllDataPage = () => {
  const [chunkData, setChunkedData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [filterString, setFilterString] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const handleChunkedData = (data) => {
    setLoading(false);
    if(data == null) 
      setNoData(true);
    else
      setNoData(false);
    
    setChunkedData(data);
  };
  const handleSummaryData = (data) => {
    setLoading(false);
    if(data == null) 
      setNoData(true);
    else
      setNoData(false);
    
    setSummaryData(data);
  };

  const handleFilteringStart = () => {
    setLoading(true);
    setChunkedData(null);
    setSummaryData(null);
  };
  return (
    <div style={{ position: "relative" }}>
        <Hero/>
        <div className='px-4 py-6 flex justify-center' 
        style={{ position: "relative", zIndex: 10 }}>
        <FilterComponent 
          setChunkedData={handleChunkedData} 
          setSummaryData={handleSummaryData} 
          onFilteringStart={handleFilteringStart}
          setFilterString={setFilterString}
        />
        </div>
        <div className='flex justify-center' style={{ marginTop: "50px", marginBottom: "100px" }}>
        {loading ? (
          <Spinner loading={loading} />) :
           (<div>
            {noData && (
              <div>
                  <h3 className="text-4xl text-black mb-4">
                      אין תוצאות
                  </h3>
              </div>
            )}
            {summaryData && (
              <div>
                <SummaryListings data={summaryData} />
              </div>
            )}
            {chunkData && (
              <div>
                <DynamicTable data={chunkData.records} 
                amountRecords={chunkData.amount_records}
                filterString={filterString}/>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

export default AllDataPage