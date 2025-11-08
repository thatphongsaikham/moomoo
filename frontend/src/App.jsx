import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "@/components/layout/UserLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// User Pages
import TableList from "@/page/user/TableList";
import OrderPage from "@/page/user/OrderPage";

// Admin Pages
import HomeAdmin from "@/page/admin/homeAdmin";
import AdminTable from "@/page/admin/table";
import AdminBilling from "@/page/admin/billing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<HomeAdmin />} />
          <Route path="table" element={<AdminTable />} />
          <Route path="billing" element={<AdminBilling />} />
        </Route>

        {/* User Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<TableList />} />
          <Route path=":tableId" element={<OrderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;