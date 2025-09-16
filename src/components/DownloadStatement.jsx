import React, { useState, useEffect } from 'react';
import './DownloadStatement.css';

import { downloadStatement } from '../utils/processFinanceData';

const DownloadStatement = ({ preferences, allExpenses, setDownloadModal }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  console.log(startDate,endDate);
  console.log(allExpenses);
  
  
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    if (preferences && preferences.fields) {
      const initialSelection = {};
      for (const field in preferences.fields) {
        initialSelection[field] = [...preferences.fields[field]];
      }
      setSelectedItems(initialSelection);
    }
  }, [preferences]);

  const handleCheckboxChange = (field, item) => {
    setSelectedItems(prev => {
      const updatedField = prev[field]?.includes(item)
        ? prev[field].filter(i => i !== item)
        : [...(prev[field] || []), item];
      return { ...prev, [field]: updatedField };
    });
  };

  
  
  const handleDownloadPDF = () => {
    downloadStatement(preferences, startDate, endDate, allExpenses);
  }
  return (
    <div className="download-modal-overlay">
      <div className="download-modal">
        <h2>Download Statement - {preferences.cName}</h2>

        <div className="date-section">
          <label>Start Date</label>
          <input type="date"  onChange={(e) => setStartDate(e.target.value)} />

          <label>End Date</label>
          <input type="date"  onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <div className="fields-section">
          {Object.entries(preferences.fields).map(([field, items]) => (
            <div key={field} className="field-group">
              <h4>{field}</h4>
              {items.map(item => (
                <label key={item} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedItems[field]?.includes(item)}
                    onChange={() => handleCheckboxChange(field, item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          ))}
        </div>

        <div className="buttons">
          <button className="download-btn" onClick={handleDownloadPDF}>Download Report</button>
          <button className="cancel-btn" onClick={()=>setDownloadModal(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DownloadStatement;
