import React, { useState, useEffect } from 'react';
import './index.css';
import axios from 'axios';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AnalysisPage from './pages/AnalysisPage';
import AllDataPage from './pages/AllDataPage';

// Lazy load ComparisonPage
const ComparisonPage = React.lazy(() => import('./pages/ComparisonPage'));

const App = () => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://localhost:7157/data_comparison');
        setComparisonData(response.data);
      } catch (error) {
        console.error('Error fetching comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Fetch data only once when the app loads
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<AllDataPage />} />
        <Route path="/specific" element={<AnalysisPage />} />
        <Route
          path="/compare"
          element={
            <React.Suspense>
              <ComparisonPage data={comparisonData} loading={loading} />
            </React.Suspense>
          }
        />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
