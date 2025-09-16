import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../services/helpers';

export const processDataByService = (expenses) => {
    const serviceMap = {};
  
    expenses.forEach(expense => {
      const service = expense.service;
      const amount = Number(expense.amount) || 0;
  
      if (serviceMap[service]) {
        serviceMap[service] += amount;
      } else {
        serviceMap[service] = amount;
      }
    });
  
    return Object.entries(serviceMap).map(([service, amount]) => ({
      service,
      amount
    }));
  };
  

export const processDataByType =(expenses)=>{
  const typeMap={}

  expenses.forEach(expense=>{
    const type=expense.type;
    const amount=Number(expense.amount) || 0;

    if(typeMap[type]){
      typeMap[type]+=amount;
    }else{
      typeMap[type]=amount
    }
  });

  return Object.entries(typeMap).map(([type, amount]) => ({
    type,
    amount
  }));
}

export const processDataByCategory =(expenses)=>{
  const categoryMap={}

  expenses.forEach(expense=>{
    const category=expense.category;
    const amount=Number(expense.amount) || 0;

    if(categoryMap[category]){
      categoryMap[category]+=amount;
    }else{
      categoryMap[category]=amount
    }
  });

  return Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount
  }));
}

// Download Finance Statement
export const processData = (expenses, filterField, selectedValues) => {
  const map = {};

  expenses.forEach(expense => {
    // Check if the field exists before processing
    const fieldValue = expense[filterField] || "Unknown";  // Default to 'Unknown' if the field is missing
    const amount = Number(expense.amount) || 0;

    // Check if the selected value exists in preferences
    if (selectedValues.includes(fieldValue) || selectedValues.length === 0) {
      if (map[fieldValue]) {
        map[fieldValue] += amount;
      } else {
        map[fieldValue] = amount;
      }
    }
  });

  return Object.entries(map).map(([key, amount]) => ({
    [filterField]: key,
    amount
  }));
};


// Function to download the statement as a PDF
export const downloadStatement = (preferences, startDate, endDate, allExpenses) => {
  if (!preferences || !preferences.fields) {
    return null; // Don't process if preferences are not loaded
  }
  console.log(preferences);
  

  // Filter expenses based on preferences
  const selectedCategories = preferences.fields.category;
  const selectedServices = preferences.fields.service;
  const selectedSources = preferences.fields.source;

  const filteredExpenses = allExpenses.filter(expense => {
    return (
      (selectedCategories.includes(expense.category) || selectedCategories.length === 0) &&
      (selectedServices.includes(expense.service) || selectedServices.length === 0) &&
      (selectedSources.includes(expense.source) || selectedSources.length === 0)
    );
  });

  // Prepare Summary Data (Sum by category, service, or type)
  const summaryData = {
    byCategory: processData(filteredExpenses, 'category', selectedCategories),
    byService: processData(filteredExpenses, 'service', selectedServices),
    bySource: processData(filteredExpenses, 'source', selectedSources),
  };
  console.log(summaryData);
  

  // Prepare Detailed Transactions Data
  const transactionData = filteredExpenses.map(expense => [
    expense.date,
    expense.category,
    `₹${expense.amount}`,
    expense.source,
    expense.remarks
  ]);

  // Start PDF generation
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal Finance Manager', 105, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.text('Account Statement', 105, 30, { align: 'center' });

  // Line separator
  doc.line(14, 35, 196, 35);

  // Subheader - Name, Generated Date, Statement Period
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  const formattedGeneratedDate = formatDate(new Date());

  doc.text(`Name: ${preferences.cName}`, 14, 45);
  doc.text(`Generated On: ${formattedGeneratedDate}`, 14, 50);
  doc.text(`Statement Period: ${formattedStartDate} to ${formattedEndDate}`, 14, 55);
  doc.text(`Total Expenses: ₹${filteredExpenses.reduce((acc, exp) => acc + parseFloat(exp.amount), 0)}`, 14, 60);

  // Line separator
  doc.line(14, 65, 196, 65);

  // Summary Section
  doc.setFontSize(12);
  doc.text('Summary:', 14, 75);

  let summaryYPosition = 80;
  // Iterate through each summary data (category, service, source)
  for (const section in summaryData) {
    doc.text(`${section.charAt(0).toUpperCase() + section.slice(1)}:`, 14, summaryYPosition);
    summaryYPosition += 5;
    summaryData[section].forEach(item => {
      doc.text(`${item[section.charAt(0).toUpperCase() + section.slice(1)]} - ₹${item.amount}`, 14, summaryYPosition);
      summaryYPosition += 5;
    });
    summaryYPosition += 5;
  }

  // Line separator
  doc.line(14, summaryYPosition + 5, 196, summaryYPosition + 5);

  // Detailed Transactions Section
  doc.setFontSize(12);
  doc.text('Detailed Transactions:', 14, summaryYPosition + 15);

  // Table for Detailed Transactions
  autoTable(doc, {
    startY: summaryYPosition + 20,
    head: [['Date', 'Category', 'Amount', 'Source', 'Notes']],
    body: transactionData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [50, 50, 50]
    },
    styles: {
      halign: 'left',
      valign: 'middle'
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.text('This is a system-generated statement.', 14, doc.internal.pageSize.height - 20);
  doc.text('For queries: support@yourapp.com', 14, doc.internal.pageSize.height - 15);

  // Save the PDF
  const formattedFileName = `Account_Statement_${preferences.cName}_${formattedStartDate}_to_${formattedEndDate}.pdf`;
  doc.save(formattedFileName);
};