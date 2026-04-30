import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell() {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
