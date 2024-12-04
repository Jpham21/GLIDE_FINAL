import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BASE_URL = 'http://localhost:8000';

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
  },
};

const AnalogChart = ({ isExperimentRunning, selectedPin }) => {
  const [chartType, setChartType] = useState('line'); // Default chart type
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Analog Input',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.4)',
        borderWidth: 2,
        fill: false,
      },
    ],
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (isExperimentRunning && selectedPin.startsWith('A')) {
      // Start fetching data
      intervalRef.current = setInterval(async () => {
        try {
          const response = await axios.get(`${BASE_URL}/analog-data`);
          const data = response.data.data;

          setChartData((prevData) => ({
            labels: Array.from({ length: data.length }, (_, i) => i + 1),
            datasets: [
              {
                ...prevData.datasets[0],
                data: data,
              },
            ],
          }));
        } catch (error) {
          console.error('Error fetching analog data:', error);
        }
      }, 500); // Fetch data every 500ms
    }

    return () => clearInterval(intervalRef.current); // Clear interval when experiment stops
  }, [isExperimentRunning, selectedPin]);

  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'scatter':
        return (
          <Scatter
            data={{
              datasets: [
                {
                  label: 'Analog Input',
                  data: chartData.datasets[0].data.map((value, index) => ({
                    x: index + 1,
                    y: value,
                  })),
                  backgroundColor: 'rgba(75, 192, 192, 0.4)',
                },
              ],
            }}
            options={chartOptions}
          />
        );
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div>
      <h2>Analog Data Visualization</h2>
      <div>
        <label>Select Chart Type:</label>
        <select value={chartType} onChange={handleChartTypeChange}>
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="scatter">Scatter Plot</option>
        </select>
      </div>
      {renderChart()}
    </div>
  );
};

export default AnalogChart;

