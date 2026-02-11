import { DatabaseManagementStatus, UserDocument, UserIdentifier } from "@/schema/application/remote-schemas";
import { UserCredentialsForm } from "@/schema/form-schemas";
import { createContext } from "react";

export interface AdminDashboardContext {
  authenticate: (adminCredentials: UserCredentialsForm) => Promise<Response>;
  listUsers: () => Promise<UserDocument[]>;
  saveUser: (user: UserDocument) => Promise<void>;
  deleteUser: (id: UserIdentifier) => Promise<void>;
  databaseManagementStatus: DatabaseManagementStatus | null;
}

export const AdminDashboardContext = createContext<AdminDashboardContext>({
  authenticate: () => Promise.reject(),
  listUsers: () => Promise.reject(),
  saveUser: () => Promise.reject(),
  deleteUser: () => Promise.reject(),
  databaseManagementStatus: null,
});
