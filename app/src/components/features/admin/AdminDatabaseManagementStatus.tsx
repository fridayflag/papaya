import { AdminDashboardContext } from "@/model/contexts/AdminDashboardContext";
import { Paper } from "@mui/material";
import { useContext } from "react";

export default function AdminDatabaseManagementStatus() {
  const adminContext = useContext(AdminDashboardContext);
  const { databaseManagementStatus } = adminContext;
  return (
    <Paper>
      {JSON.stringify(databaseManagementStatus)}
    </Paper>
  )
}
