// App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Insights from "./pages/Insights";
import ProtectedRoute from "./components/ProtectedRoute";
import RevenueInsights from "./pages/RevenueInsights";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home/insights"
        element={
          <ProtectedRoute>
            <Insights />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home/revenueinsights"
        element={
          <ProtectedRoute>
            <RevenueInsights />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
