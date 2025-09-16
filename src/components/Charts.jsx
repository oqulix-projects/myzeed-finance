import React, { useEffect, useState } from 'react'
import './Charts.css'
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { processChartData } from '../services/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';


const Charts = ({ setDate, date, insightData, displayExpenses, preferences }) => {
  const [field, setField] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);


  const COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#C9CBCF', '#00A8A8', '#F67280', '#F8B195',
    '#355C7D', '#6C5B7B', '#C06C84', '#2A9D8F', '#E76F51',
    '#E9C46A', '#264653', '#A8DADC', '#457B9D', '#1D3557'
  ];

  // Set default field when preferences are loaded
  useEffect(() => {
    if (preferences && Object.keys(preferences.fields).length > 0) {
      const firstField = Object.keys(preferences.fields)[0];
      setField((prevField) => prevField || firstField); // set only if not already set
    }

    if (field && preferences?.fields[field]) {
      setSelectedFilters(preferences.fields[field]);
    }
  }, [preferences, field]);



  const filteredExpenses = displayExpenses.filter((exp) => {
    if (!field || selectedFilters.length === 0) return true; // show all if nothing selected

    const value = exp[field]; // get the value of current field (e.g., 'category', 'source', etc.)
    return selectedFilters.includes(value); // only include if checkbox is selected
  });


  const getLineChartData = () => {
    if (!displayExpenses || displayExpenses.length === 0) return [];

    const filtered = filteredExpenses;

    const dateToAmountMap = {};

    filtered.forEach(exp => {
      const dateKey = new Date(exp.date).toISOString().split('T')[0]; // 'YYYY-MM-DD'
      if (!dateToAmountMap[dateKey]) dateToAmountMap[dateKey] = 0;
      dateToAmountMap[dateKey] += Number(exp.amount); // ensure it's a number
    });

    const chartData = Object.entries(dateToAmountMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, amount]) => ({
        date,
        amount: Number(amount),
      }));


    return chartData;
  };

  const getFilteredTotal = () => {
    if (!field || !selectedFilters.length) return 0;

    return displayExpenses
      .filter(item => selectedFilters.includes(item[field]))
      .reduce((sum, curr) => sum + Number(curr.amount), 0);
  };




  return (
    <>
      <div className='date-picker-div'>
        <label htmlFor="from">From</label>
        <input value={date.from} className='input-picker' type="date" id='from' onChange={(e) => setDate({ ...date, from: e.target.value })} />
        <label htmlFor="to">To</label>
        <input value={date.to} className='input-picker' type="date" id='to' onChange={(e) => setDate({ ...date, to: e.target.value })} />
        <button className='rst-btn' onClick={() => setDate({ from: '', to: '' })}>Reset</button>
      </div>

      <div className='chart-data'>
        <div className='chart-head'>
          <h2>Total Incurred Expense: <span>₹{insightData.totalExpense}</span></h2>
        </div>
        <div className='field-filter'>
          {preferences &&
            Object.keys(preferences.fields).map((fieldKey) => (
              <div
                className={`fields-set ${field === fieldKey ? 'active' : ''}`}
                key={fieldKey}
                onClick={() => setField(fieldKey)}
                style={{
                  cursor: 'pointer',
                  padding: '8px 12px',
                  margin: '5px',
                  borderRadius: '8px',
                  backgroundColor: field === fieldKey ? 'rgb(202, 198, 198)' : 'white',
                  color: field === fieldKey ? '#fff' : '#ccc',
                  border: '1px solid #444',
                  transition: 'all 0.2s ease'
                }}
              >
                <p style={{ margin: 0, textTransform: 'capitalize' }}>{fieldKey}</p>
              </div>
            ))
          }
        </div>

        {field && preferences?.fields[field] && (
          <div className='checkbox-container' style={{ display: 'flex', flexWrap: 'wrap', marginTop: '1rem' }}>
            {preferences.fields[field].map((option) => (
              <label key={option} style={{ color: 'white', marginRight: '1rem' }}>
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFilters([...selectedFilters, option]);
                    } else {
                      setSelectedFilters(selectedFilters.filter((item) => item !== option));
                    }
                  }}
                />
                <span style={{ marginLeft: '5px' }}>{option}</span>
              </label>
            ))}
          </div>
        )}


      </div>

      <div className='chart-container'>
        {preferences && field && (
          <div className='chart-div'>
            <div className='chart-main'>
              <h3 style={{ color: 'black', textAlign: 'center', marginBottom: '1rem' }}>
                Chart by {field.charAt(0).toUpperCase() + field.slice(1)}
              </h3>
              <div className='donuts' style={{ position: 'relative' }}>
                <PieChart width={800} height={600}>
                  <Pie
                    data={processChartData(filteredExpenses, field)}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={190}
                    outerRadius={210}
                    paddingAngle={1}
                    stroke="none"
                    cy={250}
                  >
                    {processChartData(filteredExpenses, field).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      color: '#ffffff',
                      backgroundColor: 'white',
                      letterSpacing: '1px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    layout="horizontal"
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#000055' }}>{value}</span>}
                  />
                </PieChart>

                {/* Center Text for Total Amount */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    fontSize: '35px',
                    transform: 'translateX(-50%) translateY(-100%)',
                    height: '50%',
                    display: 'flex',
                    alignItems: 'end',
                    zIndex: 0,
                    pointerEvents: 'none',
                  }}
       
                >
                  <h2 className='total-value'>₹{getFilteredTotal().toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</h2>
                </div>

              </div>
            </div>
            {/* Line graph */}
            <div>
              <div className='line-graph' style={{ marginTop: '3rem' }}>
                <h3 style={{ color: 'black', textAlign: 'center', marginBottom: '1rem' }}>
                  Daily Expenses Over Time
                </h3>
                <LineChart width={800} height={300} data={getLineChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: 'black', fontSize: 12 }} />
                  <YAxis domain={[0, 10000]} tick={{ fill: 'black' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', color: '#fff' }} />
                  <Line type="monotone" dataKey="amount" stroke="#36A2EB" strokeWidth={2} dot={{ r: 1 }} />
                </LineChart>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Charts;