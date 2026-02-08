import { DatabaseManagementStatus } from "@/schema/application/remote-schemas";
import { UserCredentialsForm } from "@/schema/form-schemas";
import { createContext } from "react";

export interface AdminDashboardContext {
  authenticate: (adminCredentials: UserCredentialsForm) => Promise<Response>;
  listUsers: () => Promise<unknown>;
  addUser: (user: UserCredentialsForm) => Promise<unknown>;
  updateUser: (user: UserCredentialsForm) => Promise<unknown>;
  deleteUser: (user: UserCredentialsForm) => Promise<unknown>;
  databaseManagementStatus: DatabaseManagementStatus | null;
}

export const AdminDashboardContext = createContext<AdminDashboardContext>({
  authenticate: () => Promise.reject(),
  listUsers: () => Promise.reject(),
  addUser: () => Promise.reject(),
  updateUser: () => Promise.reject(),
  deleteUser: () => Promise.reject(),
  databaseManagementStatus: null,
});
