import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "@/components/layout/UserLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// User Pages
import TableList from "@/page/user/TableList";
import OrderPage from "@/page/user/OrderPage";
import HistoryPage from "@/page/user/HistoryPage";

// Admin Pages
import MenuManagement from "@/page/admin/menu";
import OrderQueue from "@/page/admin/orderQueue";
import TableManagement from "@/page/admin/tableManagement";
import BillingManagement from "@/page/admin/billingManagement";
import WaitlistManagement from "@/page/admin/waitlistManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="menu" element={<MenuManagement />} />
          <Route path="orders" element={<OrderQueue />} />
          <Route path="tables" element={<TableManagement />} />
          <Route path="billing" element={<BillingManagement />} />
          <Route path="waitlist" element={<WaitlistManagement />} />
          <Route index element={<MenuManagement />} /> {/* Default admin page */}
        </Route>

        {/* User Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<TableList />} />
          {/* Support both /:tableId and /:tableId/order for compatibility */}
          <Route path=":tableId" element={<OrderPage />} />
          <Route path=":tableId/order" element={<OrderPage />} />
          <Route path=":tableId/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;