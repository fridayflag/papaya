import { AdminDashboardContext } from "@/contexts/AdminDashboardContext";
import { Paper } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";


export default function AdminUserManagement() {
  const adminContext = useContext(AdminDashboardContext)

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      return adminContext.listUsers();
    },
    enabled: !!adminContext.databaseManagementStatus,
  })

  return (
    <Paper>
      {JSON.stringify(usersQuery.data)}
    </Paper>
  )
}