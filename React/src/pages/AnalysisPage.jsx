import React, { useState, useEffect } from "react";
import ModelListings from '../components/ModelListings'
import ViewAllJobs from '../components/ViewAllJobs'
import SearchBar from '../components/SearchBar';
import AnalysisYear from '../components/AnalysisYear';
import Spinner from "../components/Spinner";
import AnalysisImportersCompanies from "../components/AnalysisImportersCompanies";

const AnalysisPage = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSetAnalysisResult = (data) => {
    setLoading(false);
    setAnalysisResult(data);
  };

  const handleSearchStart = () => {
    setLoading(true);
    setAnalysisResult(null);
  };

  return (
    <div style={{ position: "relative"}}>
        <div style={{ position: "relative", zIndex: 10, marginTop:"20px" }}>
        <SearchBar 
          setAnalysisResult={handleSetAnalysisResult} 
          onSearchStart={handleSearchStart}
        />
        </div>
        <div style={{ marginTop: "50px", marginBottom: "130px" }}>
        {loading ? 
          <Spinner loading={loading} /> : 
          (analysisResult && <div>
          <AnalysisYear data={analysisResult} />
          <AnalysisImportersCompanies data={analysisResult}/>
           <ModelListings data={analysisResult}/>
           </div>)
        }
      </div>
        <ViewAllJobs/>
    </div>
  )
}

export default AnalysisPage