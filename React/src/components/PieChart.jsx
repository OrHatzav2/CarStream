import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels: labels.map((label) => label.replace("_", " ")),
    datasets: [
      {
        data: values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="flex flex-col items-center" style={{ width: '400px', margin: '0 auto' }}>
        <h3 className="text-3xl text-black sm:text3xl md:text-4xl mb-4">סוג רכב</h3>
        <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
