import { UserCredentialsForm } from "@/schema/form-schemas";
import { createContext } from "react";

export interface AdminDashboardContext {
  adminCredentials: UserCredentialsForm | null;
  setAdminCredentials: (credentials: UserCredentialsForm) => void;
}

export const AdminDashboardContext = createContext<AdminDashboardContext>({
  adminCredentials: null,
  setAdminCredentials: () => { },
});
