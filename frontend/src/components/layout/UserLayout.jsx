import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "@/components/layout/sidebar/topbar";

const UserLayout = () => {
  return (
    <div>
      <Topbar />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;