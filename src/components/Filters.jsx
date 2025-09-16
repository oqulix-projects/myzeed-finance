import React from 'react';
import './Filters.css';

const Filters = ({
  setSortBy,
  filterValues,
  setFilterValues,
  setSearchText,
  preferences
}) => {
  const fields = preferences?.fields || {};

  return (
    <div className='filter-div'>
      <div className='search-filter'>
        <label htmlFor="searchFilter"><i className="fa-solid fa-magnifying-glass"></i> </label>
        <input
          placeholder='Search remarks, amount'
          type="text"
          id="searchFilter"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Dynamically generate filter dropdowns from preferences.fields */}
      <div className='filter-select-div'>
        {Object.entries(fields).map(([fieldKey, options]) => (
          <React.Fragment key={fieldKey}>
            <div className='filter-selects'>
              <label htmlFor={`${fieldKey}-filter`}>{fieldKey} </label>
              <select
                id={`${fieldKey}-filter`}
                onChange={(e) =>
                  setFilterValues({ ...filterValues, [`${fieldKey}`]: e.target.value })
                }
                className='filter-select'
              >
                <option value="All">All</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className='sort-by-div'>
        <label htmlFor="sort-by"><i className="fa-solid fa-sort"></i> </label>
        <select
          id="sort-by"
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value='dateIncurred'>Date incurred</option>
          <option value='amount'>Amount</option>
          <option value='dateAdded'>Date added</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;
