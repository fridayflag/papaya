import AdminDashboardContextProvider from "@/components/providers/AdminDashboardContextProvider";
import { Grid } from "@mui/material";
import AdminDatabaseManagementStatus from "./AdminDatabaseManagementStatus";
import AdminLoginDialog from "./AdminLoginDialog";
import AdminUserManagement from "./AdminUserManagement";


export default function AdminDashboard() {



  return (
    <AdminDashboardContextProvider>
      <>
        <AdminLoginDialog />
        <Grid container spacing={2}>
          <Grid size={4}>
            <AdminDatabaseManagementStatus />
          </Grid>
          <Grid size={4}>
            <AdminUserManagement />
          </Grid>
        </Grid>
      </>
    </AdminDashboardContextProvider>
  )
}
