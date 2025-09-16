import React, { useEffect, useState } from "react";
// import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "./expenseTable.css";
import AddExpense from "./AddExpense";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import Swal from "sweetalert2";
import { deleteData, filterExpenses, sortExpenses } from "../services/services";
import Filters from "./Filters";
import { filterExpensesByDate } from "../services/helpers";

import AddExpenseModal from "./AddExpenseModal";
import AddRevenueModal from "./AddRevenueModal";
import send from "../assets/send.png";
import recieve from "../assets/recieve.png";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";


const ExpenseTable = ({ preferences }) => {
  const [expenses, setExpenses] = useState([]);

  const [date, setDate] = useState({ from: "", to: "" });
  const [displayExpenses, setDisplayExpenses] = useState([]); //Display data
  const [displayRevenue, setDisplayRevenue] = useState([]); // Display data
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [view, setView] = useState("all");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [filteredFinanceData, setFilteredFinanceData] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [editRowId, setEditRowId] = useState(null); // stores the ID of the row being edited
  const [editRowData, setEditRowData] = useState({}); // stores editable data
  const [monthlyTotalExpense, setMonthlyTotalExpense] = useState(0);
  const [monthlyTotalRevenue, setMonthlyTotalRevenue] = useState(0);
  const [monthlyTotalCredit,setMonthlyTotalCredit] = useState(0)

  const [triggerFetch, setTriggerFetch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("dateIncurred");

console.log(combinedData);

  
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100; // adjust how many rows you want per page

const startIndex = (currentPage - 1) * rowsPerPage;
const paginatedData = combinedData.slice(startIndex, startIndex + rowsPerPage);


const downloadFilteredExcel = async (fromDate, toDate, companyName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transactions");

  // ====== REPORT HEADER ======
  worksheet.mergeCells("A1:H1");
  worksheet.getCell("A1").value = companyName || "Company Name";
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = { horizontal: "left" };

  worksheet.mergeCells("A2:H2");
  worksheet.getCell("A2").value = "Financial Transactions Report";
  worksheet.getCell("A2").font = { size: 14, bold: true, color: { argb: "FF4F81BD" } };
  worksheet.getCell("A2").alignment = { horizontal: "left" };

  if (fromDate && toDate) {
    worksheet.mergeCells("A3:H3");
    worksheet.getCell("A3").value = `Period: ${fromDate} to ${toDate}`;
    worksheet.getCell("A3").alignment = { horizontal: "left" };
  }

  worksheet.mergeCells("A4:H4");
  worksheet.getCell("A4").value = `Generated on: ${new Date().toLocaleDateString()}`;
  worksheet.getCell("A4").alignment = { horizontal: "left" };

  worksheet.addRow([]);

  // ====== TABLE HEADERS ======
  worksheet.columns = [
    { key: "id", width: 5 },
    { key: "date", width: 15 },
    { key: "type", width: 10 },
    { key: "source", width: 20 },
    { key: "category", width: 20 },
    {key: "service",width:20},
    { key: "debit", width: 15 },
    { key: "credit", width: 15 },
    { key: "remarks", width: 45 },
  ];

  const headerRow = worksheet.addRow([
    "#",
    "Date",
    "Type",
    "Source",
    "Category",
    "Service",
    "Debit",
    "Credit",
    "Remarks",
  ]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F81BD" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  let totalDebit = 0;
  let totalCredit = 0;

  // ====== ADD TRANSACTION ROWS ======
  combinedData.forEach((item, index) => {
    const type = item.typeOfTransaction === "Expense" ? "Debit" : "Credit";
    const amountValue = Number(item.amount || 0);

    const row = worksheet.addRow({
      id: index + 1,
      date: item.date || "-",
      type,
      source: item.source || "-",
      category: item.category || "-",
      service: item.service || -"",
      debit: type === "Debit" ? amountValue : null ,
      credit: type === "Credit" ? amountValue : null ,
      remarks: item.remarks || "-",
    });

    // Format date
    if (row.getCell("date").value && row.getCell("date").value !== "-") {
      row.getCell("date").numFmt = "dd-mmm-yyyy";
    }

    // Format debit/credit separately
    const debitCell = row.getCell("debit");
    const creditCell = row.getCell("credit");
    debitCell.numFmt = creditCell.numFmt = '₹#,##0.00';

    if (type === "Debit") {
      debitCell.font = { color: { argb: "FFFF0000" } }; // red
      totalDebit += amountValue;
    } else {
      creditCell.font = { color: { argb: "FF00B050" } }; // green
      totalCredit += amountValue;
    }
  });

  // ====== SUMMARY SECTION ======
  const lastRow = worksheet.lastRow.number + 2;

  worksheet.mergeCells(`A${lastRow}:E${lastRow}`);
  const summaryTitle = worksheet.getCell(`A${lastRow}`);
  summaryTitle.value = "Summary";
  summaryTitle.font = { bold: true, size: 12 };
  summaryTitle.alignment = { horizontal: "center" };

  worksheet.addRow({ source: "Total Debited", debit: totalDebit });
  worksheet.lastRow.getCell("debit").numFmt = '₹#,##0.00';
  worksheet.lastRow.getCell("debit").font = { color: { argb: "FFFF0000" }, bold: true };

  worksheet.addRow({ source: "Total Credited", credit: totalCredit });
  worksheet.lastRow.getCell("credit").numFmt = '₹#,##0.00';
  worksheet.lastRow.getCell("credit").font = { color: { argb: "FF00B050" }, bold: true };

 
  // ====== EXPORT FILE ======
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${preferences.cName}_Statement_${fromDate}_${toDate}.xlsx`);
};





 useEffect(() => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // Jan = 0
  const currentYear = currentDate.getFullYear();

  // Calculate total expenses for current month
  const totalExpenseMonth = expenses.reduce((sum, expense) => {
    const expenseDate = new Date(expense.date);
    if (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    ) {
      return sum + Number(expense.amount);
    }
    return sum;
  }, 0);

  // Calculate total revenues for current month
  const totalRevenueMonth = revenue
  .filter(item => {
    const d = new Date(item.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  })
  .reduce((sum, item) => sum + Number(item.amount), 0);


  // Calculating toal creditmonthly
  const totalCreditMonth = revenue
  .filter(item => {
    const d = new Date(item.date);
    return (
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear &&
      item.creditType === 'credit'
    );
  })
  .reduce((sum, item) => sum + Number(item.amount), 0);


  // Format in Indian style with commas
  setMonthlyTotalExpense(totalExpenseMonth.toLocaleString("en-IN"));
  setMonthlyTotalRevenue(totalRevenueMonth.toLocaleString("en-IN"));
  setMonthlyTotalCredit(totalCreditMonth.toLocaleString("en-IN"));
}, [expenses, revenue]);


useEffect(() => {
  const totalExpenses = displayExpenses.reduce(
    (acc, item) => acc + Number(item.amount),
    0
  );

  const totalCredit = displayRevenue.reduce(
    (acc, item) => acc + Number(item.amount),
    0
  );

  const totalRevenue = displayRevenue.reduce(
  (acc, item) => item.creditType === 'revenue' ? acc + Number(item.amount) : acc,
  0
);


  // Format in Indian style (e.g. 3,00,000)
  setTotalExpenses(totalExpenses.toLocaleString("en-IN"));
  setTotalRevenue(totalRevenue.toLocaleString("en-IN"));
  setTotalCredit((totalCredit-totalRevenue).toLocaleString("en-IN"))
}, [displayExpenses, displayRevenue]);


  const monthName = new Date().toLocaleString("default", { month: "long" });
  const today = new Date();
  //Thu Jun 26 2025 15:40:48 GMT+0530 (India Standard Time)
  const currentDate = today.getDate();

  const totalDaysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const progress = ((currentDate / totalDaysInMonth) * 100).toFixed(2);

  const generateDefaultFilters = (preferences) => {
    if (!preferences?.fields) return {};
    const filters = {};
    Object.keys(preferences.fields).forEach((key) => {
      filters[key] = "All";
    });
    return filters;
  };

  useEffect(() => {
    if (preferences?.fields) {
      setFilterValues(generateDefaultFilters(preferences));
    }
  }, [preferences]);

  useEffect(() => {
    const ref = filterExpensesByDate(date.from, date.to, expenses);
    setDisplayExpenses(ref);
    const refrev = filterExpensesByDate(date.from, date.to, revenue);
    setDisplayRevenue(refrev);
  }, [date]);
  const [filterValues, setFilterValues] = useState(
    generateDefaultFilters(preferences)
  );

  const saveEditedData = async (type, id) => {
    const userId = auth.currentUser.uid; // assuming Firebase Auth is being used
    try {
      const financeId = "financialData";
      await updateDoc(
        doc(db, "userData", userId, "finances", financeId, type, id),
        editRowData
      );
      setTriggerFetch((prev) => !prev);
      Swal.fire({
        icon: "success",
        title: `✔️ ${type} Updated!`,
        showConfirmButton: false,
        timer: 800,
      });
      setEditRowId(null);
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setExpenses([]);
        setRevenue([]); // No user logged in
        return;
      }
      const financeId = "financialData";
      const userExpensesRef = collection(
        db,
        "userData",
        user.uid,
        "finances",
        financeId,
        "expenses"
      );
      const userRevenueRef = collection(
        db,
        "userData",
        user.uid,
        "finances",
        financeId,
        "revenue"
      );

      const q = query(userExpensesRef, orderBy("date", "desc")); // Order By Date
      const p = query(userRevenueRef, orderBy("date", "desc")); // Order By Date

      try {
        const querySnapshot = await getDocs(q);
        const querySnapshotRevenue = await getDocs(p);
        const expensesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const revenueList = querySnapshotRevenue.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // console.log("Fetched expenses:", expensesList);
        setExpenses(expensesList);
        setDisplayExpenses(expensesList);
        // console.log("Fetched revenue:", revenueList);
        setRevenue(revenueList);
        setDisplayRevenue(revenueList);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    });

    return () => unsubscribe();
  }, [triggerFetch]);

  const handleExpenseAdded = () => {
    setTriggerFetch((prev) => !prev);
  };

  const handleDeleteData = async (type, id) => {
    console.log(id)
    const result = await Swal.fire({
      title: `Delete this ${type}?`,
      text: `This action cannot be undone.`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteData(type, id);
        Swal.fire({
          icon: "success",
          title: `✔️ ${type} deleted!`,
          showConfirmButton: false,
          timer: 800,
        });
        setTriggerFetch((prev) => !prev);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "❌ Failed to delete",
          text: "Something went wrong. Please try again.",
        });
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const filtered = filterExpenses(expenses, filterValues, searchText);
    setDisplayExpenses(filtered);
  }, [expenses, filterValues, searchText]);


  // Sorting
    useEffect(() => {
    if (!combinedData || combinedData.length === 0) return;

    const sortedData = [...combinedData].sort((a, b) => {
      if (sortBy === "dateAdded") {
        // Firestore timestamp createdAt
        return b.createdAt.seconds - a.createdAt.seconds;
      }
      if (sortBy === "dateIncurred") {
        // your string date field "YYYY-MM-DD"
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === "amount") {
        return Number(b.amount) - Number(a.amount);
      }
      return 0;
    });

    setCombinedData(sortedData);
  }, [sortBy]);

  useEffect(() => {
    if (view == "all") {
      const combinedDataRef = [
        ...displayExpenses.map((item) => ({
          ...item,
          typeOfTransaction: "Expense",
        })),
        ...displayRevenue.map((item) => ({
          ...item,
          typeOfTransaction: "Revenue",
        })),
      ];
      combinedDataRef.sort((a, b) => new Date(b.date) - new Date(a.date)); // latest on top
      setCombinedData(combinedDataRef);
    }
    if (view == "expenses") {
      const combinedDataRef = [
        ...displayExpenses.map((item) => ({
          ...item,
          typeOfTransaction: "Expense",
        })),
      ];
      combinedDataRef.sort((a, b) => new Date(b.date) - new Date(a.date)); // latest on top
      setCombinedData(combinedDataRef);
    }
    if (view == "revenue") {
      const combinedDataRef = [
        ...displayRevenue.map((item) => ({
          ...item,
          typeOfTransaction: "Revenue",
        })),
      ];
      combinedDataRef.sort((a, b) => new Date(b.date) - new Date(a.date)); // latest on top
      setCombinedData(combinedDataRef);
    }
  }, [displayExpenses, displayRevenue, view]);

  useEffect(() => {
    if (view == "all" || view == "expenses") {
      setFilteredFinanceData(displayExpenses);
    } else {
      setFilteredFinanceData(displayRevenue);
    }
  }, [displayExpenses, displayRevenue, view]);

  const getLineChartData = () => {
    if (!displayExpenses || displayExpenses.length === 0) return [];

    const filtered = filteredFinanceData;

    const dateToAmountMap = {};

    filtered.forEach((exp) => {
      const dateKey = new Date(exp.date).toISOString().split("T")[0]; // 'YYYY-MM-DD'
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




  return (
    <>
      {displayExpenses.length>0?<>
        <div className="top-div">
          <h2>Financial Details</h2>
          <div className="date-picker-div">
            <div className="input-wrapper">
              <label htmlFor="from">From</label>
              <input
                value={date.from}
                className="input-picker"
                type="date"
                id="from"
                onChange={(e) => setDate({ ...date, from: e.target.value })}
              />
            </div>
  
            <div className="input-wrapper">
              <label htmlFor="to">To</label>
              <input
                value={date.to}
                className="input-picker"
                type="date"
                id="to"
                onChange={(e) => setDate({ ...date, to: e.target.value })}
              />
            </div>
            <button
              className="reset-btn"
              onClick={() => setDate({ from: "", to: "" })}
            >
              Reset
            </button>
          </div>
          <button className="excel-btn" onClick={()=>downloadFilteredExcel(date.from, date.to, preferences.cName)}>Download Excel</button>
        </div>
  
        <div className="top-container">
          <div className="report-card">
            <div className="report-head">
              <i style={{fontSize:'30px',marginRight:'5px'}} className="fa-solid fa-money-bill-transfer"></i> <h2> Financial Snapshot</h2>
            </div>
            <div className="reports">
              <div className="report-box">
                <div className="inside-head">
                  {/* <img src={exp} alt="" /> */}
                  <h3>Total Debited</h3>
                </div>
                <div className="outside-head">
                  <h2>{totalExpenses} INR</h2>
                  <h5>{monthlyTotalExpense} INR this month</h5>
                </div>
              </div>
              <div className="report-box">
                <div className="inside-head">
                  {/* <img src={rev} alt="" /> */}
                  <h3>Total Credited</h3>
                </div>
                <div className="outside-head">
                  <h2>{totalCredit} INR</h2>
                  <h5>{monthlyTotalCredit} INR this month</h5>
                </div>
              </div>
              <div className="report-box">
                <div className="inside-head">
                  {/* <img src={exp} alt="" /> */}
                  <h3>Revenue</h3>
                </div>
                <div className="outside-head">
                  <h2>{totalRevenue} INR</h2>
                  <h5>{monthlyTotalRevenue} INR this month</h5>
                </div>
              </div>
            </div>
            <AddExpense
              setExpenseModalOpen={setExpenseModalOpen}
              setRevenueModalOpen={setRevenueModalOpen}
              onExpenseAdded={handleExpenseAdded}
              preferences={preferences}
            />
            <div className="expense-bar">
              <div
                className="expense-progress"
                style={{ width: `${Number(progress)}%` }}
              >
                <div>
                  <p>{monthlyTotalExpense} INR</p>
                  <i className="fa-solid fa-play"></i>
                </div>
              </div>
              <p className="report-month">{monthName}</p>
            </div>
          </div>
          <div>
            <div className="line-graph line-table" style={{ marginTop: "3rem" }}>
              <h3
                style={{
                  color: "black",
                  textAlign: "center",
                  marginBottom: "1rem",
                }}
              >
                <p>Daily {view == "revenue" ? "Revenue" : "Expense"} over time</p>
              </h3>
              <BarChart width={800} height={300} data={getLineChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "black", fontSize: 12 }} />
                <YAxis domain={[0, 10000]} tick={{ fill: "black" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    color: "#fff",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="rgb(79, 201, 31)"
                  barSize={20}
                  radius={[110, 110, 0, 0]} // TopLeft, TopRight, BottomRight, BottomLeft
                />
              </BarChart>
            </div>
          </div>
        </div>
  
        <AddExpenseModal
          onExpenseAdded={handleExpenseAdded}
          isOpen={expenseModalOpen}
          preferences={preferences}
          onClose={() => setExpenseModalOpen(false)}
        />
        <AddRevenueModal
          onExpenseAdded={handleExpenseAdded}
          isOpen={revenueModalOpen}
          preferences={preferences}
          onClose={() => setRevenueModalOpen(false)}
        />
  
        <div
          className="add-exp-buttons"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        ></div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100vw",
            justifyContent: "center",
          }}
        ></div>
  
        {/* ----------------------- */}
        <div className="table-head-container">
          <div className="table-head">
            <h1 className="finance-report-h1" style={{ textAlign: "left" }}>
              Your Financial Report
            </h1>
            <div className="table-view">
              <button
                className={`view-button ${view === "all" ? "active" : ""}`}
                onClick={() => setView("all")}
              >
                All
              </button>
              <button
                className={`view-button ${view === "expenses" ? "active" : ""}`}
                onClick={() => setView("expenses")}
              >
                Debit
              </button>
              <button
                className={`view-button ${view === "revenue" ? "active" : ""}`}
                onClick={() => setView("revenue")}
              >
                Credit
              </button>
            </div>
          </div>
          <div className="filter-container">
            <Filters
              setSortBy={setSortBy}
              filterValues={filterValues}
              setFilterValues={setFilterValues}
              setSearchText={setSearchText}
              preferences={preferences}
            />
          </div>
        </div>
        <div className="tableDiv">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Transaction</th>
                <th>Date</th>
                {/* Dynamically render preference or service field */}
                {preferences &&
                  Object.keys(preferences.fields).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                <th>Amount</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
  {paginatedData.map((item, index) => (
    <tr key={item.id}>
      <td>{startIndex + index + 1}</td>
                  <td>
                    {item.typeOfTransaction == "Expense"}
  
                    <img
                      width={"25px"}
                      src={item.typeOfTransaction == "Expense"  ? send : recieve  
                      }
                      alt=""
                    />
                  </td>
  
                  {editRowId === item.id ? (
                    <>
                      <td>
                        <input
                          className="edit-input"
                          type="date"
                          value={editRowData.date}
                          onChange={(e) =>
                            setEditRowData({
                              ...editRowData,
                              date: e.target.value,
                            })
                          }
                        />
                      </td>
  
                      {item.typeOfTransaction ? (
                        Object.keys(preferences.fields).map((key) => (
                          <td key={key}>
                            <select
                              value={editRowData[key] || ""}
                              onChange={(e) =>
                                setEditRowData({
                                  ...editRowData,
                                  [key]: e.target.value,
                                })
                              }
                            >
                              <option value="" disabled>
                                Select {key}
                              </option>
                              {preferences.fields[key].map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                        ))
                      ) : (
                        <td colSpan={Object.keys(preferences.fields).length}>
                          <select
                            value={editRowData.service}
                            onChange={(e) =>
                              setEditRowData({
                                ...editRowData,
                                service: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              Select Service
                            </option>
                            {serviceOptions.map((service) => (
                              <option key={service} value={service}>
                                {service}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}
  
                      <td>
                        <input
                          className="edit-input"
                          type="number"
                          value={editRowData.amount}
                          onChange={(e) =>
                            setEditRowData({
                              ...editRowData,
                              amount: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          type="text"
                          value={editRowData.remarks}
                          onChange={(e) =>
                            setEditRowData({
                              ...editRowData,
                              remarks: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="edit-btns">
                        <button
                          style={{ backgroundColor: "green" }}
                          className="edit-btn"
                          onClick={() =>
                            saveEditedData(
                              item.typeOfTransaction ? "expenses" : "revenue",
                              item.id
                            )
                          }
                        >
                          <i
                            style={{ color: "white" }}
                            className="fa-solid fa-check"
                          ></i>
                        </button>
                        <button
                          style={{ backgroundColor: "red" }}
                          className="edit-btn"
                          onClick={() => setEditRowId(null)}
                        >
                          <i
                            style={{ color: "white" }}
                            className="fa-solid fa-xmark"
                          ></i>
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.date || "-"}</td>
  
                      {item.typeOfTransaction ? (
                        Object.keys(preferences.fields).map((key) => (
                          <td key={key}>{item[key] || "-"}</td>
                        ))
                      ) : (
                        <td colSpan={Object.keys(preferences.fields).length}>
                          {item.service || "-"}
                        </td>
                      )}
  
                      <td
                        style={
                          item.typeOfTransaction==='Expense'
                            ? { color: "red", fontWeight: "800" }
                            : { color: "rgb(6, 182, 6)", fontWeight: "800" }
                        }
                      >
                        ₹{Number(item.amount || 0).toLocaleString("en-IN")}

                      </td>
                      <td>{item.remarks || "-"}</td>
                      <td className="actionCell">
                        <i
                          className="fa-solid fa-pen-to-square"
                          onClick={() => {
                            setEditRowId(item.id);
                            setEditRowData(item);
                          }}
                          title="Edit"
                        ></i>
                        <i
                          className="fa-solid fa-trash"
                          onClick={() =>
                            handleDeleteData(
                              item.typeOfTransaction=='Expense'?'expenses':'revenue',
                              item.id
                            )
                          }
                          title="Delete"
                        ></i>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>:
      <div className="loading-expenses">

        {/* <img src={load3} alt="" /> */}
        <div className="loader-bg">
          <div className="loader-bar"></div>
        </div>
        <p>Loading your finances...</p>
      </div>
      
      }
      <div className="pagination-controls">
  <button className="control-btn"
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
  >
    <i class="fa-solid fa-chevron-left"></i>
  </button>

  {/* Page Numbers */}
  {Array.from({ length: Math.ceil(combinedData.length / rowsPerPage) }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => setCurrentPage(i + 1)}
      style={{
        margin: "0 5px",
        fontWeight: currentPage === i + 1 ? "bold" : "normal",
        backgroundColor: currentPage === i + 1 ? "#a1a1a1ff" : "white",
        color: currentPage === i + 1 ? "white" : "black",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "4px 8px",
      }}
    >
      {i + 1}
    </button>
  ))}

  <button className="control-btn"
    disabled={currentPage === Math.ceil(combinedData.length / rowsPerPage)}
    onClick={() => setCurrentPage(currentPage + 1)}
  >
    <i class="fa-solid fa-chevron-right"></i>
  </button>
</div>



    </>
  );
};

export default ExpenseTable;
