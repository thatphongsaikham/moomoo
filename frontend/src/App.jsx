import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./page/home/home";
import Order from "./page/order/orderManagement";
import Table from "./page/table/tableManagement";
import Billing from "./page/Bill/billing";

import Topbar from "./components/layout/sidebar/topbar";


function App() {
  return (
    <BrowserRouter>
      <Topbar /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order" element={<Order />} />
        <Route path="/table" element={<Table />} />
        <Route path="/bill" element={<Billing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
