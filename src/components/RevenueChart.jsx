import React, { useState } from 'react'
import './Charts.css'
import { PieChart, Pie, Cell, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { processChartData } from '../services/helpers'

const RevenueChart = ({ setDate, date, displayRevenue, insightData }) => {
  const [field, setField] = useState('remarks') // default to remarks

  const COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#C9CBCF', '#00A8A8', '#F67280', '#F8B195',
    '#355C7D', '#6C5B7B', '#C06C84', '#2A9D8F', '#E76F51',
    '#E9C46A', '#264653', '#A8DADC', '#457B9D', '#1D3557'
  ]

  // Filtered data (if field not available, fallback)
  const filteredExpenses = displayRevenue.filter(exp => exp[field])

  const getLineChartData = () => {
    if (!displayRevenue || displayRevenue.length === 0) return []

    const dateToAmountMap = {}
    displayRevenue.forEach(exp => {
      const dateKey = new Date(exp.date).toISOString().split('T')[0]
      if (!dateToAmountMap[dateKey]) dateToAmountMap[dateKey] = 0
      dateToAmountMap[dateKey] += Number(exp.amount)
    })

    return Object.entries(dateToAmountMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, amount]) => ({
        date,
        amount: Number(amount.toFixed(2)),
      }))
  }

  const getFilteredTotal = () => {
    return displayRevenue.reduce((sum, curr) => sum + Number(curr.amount), 0)
  }

  return (
    <>
      {/* Date Picker */}
      <div className='date-picker-div'>
        <label htmlFor="from">From</label>
        <input
          value={date.from}
          className='input-picker'
          type="date"
          id='from'
          onChange={(e) => setDate({ ...date, from: e.target.value })}
        />
        <label htmlFor="to">To</label>
        <input
          value={date.to}
          className='input-picker'
          type="date"
          id='to'
          onChange={(e) => setDate({ ...date, to: e.target.value })}
        />
        <button className='rst-btn' onClick={() => setDate({ from: '', to: '' })}>Reset</button>
      </div>

      {/* Header */}
      <div className='chart-data'>
        <div className='chart-head'>
          <h2>Total Incurred Revenue: <span>₹{insightData.totalRevenue?.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</span></h2>
        </div>

        {/* Field Switch Buttons */}
        <div className='field-filter'>
          {['remarks', 'service'].map((fieldKey) => (
            <div
              className={`fields-set ${field === fieldKey ? 'active' : ''}`}
              key={fieldKey}
              onClick={() => setField(fieldKey)}
              style={{
                cursor: 'pointer',
                padding: '8px 12px',
                margin: '5px',
                borderRadius: '8px',
                backgroundColor: field === fieldKey ? '#cacacaff' : 'white',
                color: field === fieldKey ? '#fff' : '#444',
                border: '1px solid #444',
                transition: 'all 0.2s ease'
              }}
            >
              <p style={{ margin: 0, textTransform: 'capitalize' }}>{fieldKey}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className='chart-container'>
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
                <Tooltip contentStyle={{ backgroundColor: 'white', color: '#000' }} />
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

          {/* Line Graph */}
          <div>
            <div className='line-graph' style={{ marginTop: '3rem' }}>
              <h3 style={{ color: 'black', textAlign: 'center', marginBottom: '1rem' }}>
                Daily Revenue Over Time
              </h3>
              <LineChart width={800} height={300} data={getLineChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: 'black', fontSize: 12 }} />
                <YAxis tick={{ fill: 'black' }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', color: '#000' }} />
                <Line type="monotone" dataKey="amount" stroke="#36A2EB" strokeWidth={2} dot={{ r: 1 }} />
              </LineChart>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <div className='revenue-table'>
        <h3>Revenue Records</h3>
        <table>
          <thead>
            <tr >
                <th>#</th>
              <th>Date</th>
              <th>Service</th>
              <th>Remarks</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {displayRevenue.map((rev, idx) => (
              <tr key={idx}>
                <td>{idx+1}</td>
                <td>{new Date(rev.date).toLocaleDateString()}</td>
                <td>{rev.service}</td>
                <td>{rev.remarks}</td>
                <td>{Number(rev.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default RevenueChart
