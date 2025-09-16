export const filterExpensesByDate = (from, to, dataArray) => {
    if (!from && !to) return dataArray;
  
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
  
    return dataArray.filter((item) => {
      const itemDate = new Date(item.date);
      if (fromDate && itemDate < fromDate) return false;
      if (toDate && itemDate > toDate) return false;
      return true;
    });
  };
  
  export const calculateTotalAmount = (dataArray) => {
  if (!Array.isArray(dataArray)) return 0;

  const total = dataArray.reduce((sum, item) => {
    const amount = parseFloat(item.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return parseFloat(total.toFixed(2)); // ensures 2 decimal places
};

  

//   Pie chart
export const processChartData = (expenses, groupByField) => {
    const grouped = {};
  
    expenses.forEach((item) => {
      const label = item[groupByField]; // dynamic field access
  
      if (!label) return; // skip if no label
  
      const amount = parseFloat(item.amount) || 0;
  
      if (grouped[label]) {
        grouped[label] += amount;
      } else {
        grouped[label] = amount;
      }
    });
  
    return Object.keys(grouped).map((key) => ({
      name: key,
      value: grouped[key],
    }));
  };
  

  
  export const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = d.getFullYear();
  
    return `${day}-${month}-${year}`;
  };