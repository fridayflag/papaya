import AdminDashboardContextProvider from "@/components/providers/AdminDashboardContextProvider";
import { Grid } from "@mui/material";
import AdminDatabaseManagementStatus from "./AdminDatabaseManagementStatus";
import AdminLoginDialog from "./AdminLoginDialog";


export default function AdminDashboard() {



  return (
    <AdminDashboardContextProvider>
      <>
        <AdminLoginDialog />
        <Grid container spacing={2}>
          <Grid size={12}>
            <AdminDatabaseManagementStatus />
          </Grid>
        </Grid>
      </>
    </AdminDashboardContextProvider>
  )
}
