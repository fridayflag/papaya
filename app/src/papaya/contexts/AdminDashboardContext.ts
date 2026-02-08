import { DatabaseManagementStatus } from "@/schema/application/remote-schemas";
import { UserCredentialsForm } from "@/schema/form-schemas";
import { createContext } from "react";

export interface AdminDashboardContext {
  authenticate: (adminCredentials: UserCredentialsForm) => Promise<Response>;
  databaseManagementStatus: DatabaseManagementStatus | null;
}

export const AdminDashboardContext = createContext<AdminDashboardContext>({
  authenticate: () => Promise.reject(),
  databaseManagementStatus: null,
});
