import { AdminDashboardContext } from "@/contexts/AdminDashboardContext";
import { UserCredentialsForm } from "@/schema/form-schemas";
import { PropsWithChildren, useState } from "react";


export default function AdminDashboardContextProvider(props: PropsWithChildren) {
  const [adminCredentials, setAdminCredentials] = useState<UserCredentialsForm | null>(null);

  const context: AdminDashboardContext = {
    adminCredentials,
    setAdminCredentials,
  }

  return (
    <AdminDashboardContext.Provider
      value={context}
    >
      {props.children}
    </AdminDashboardContext.Provider>
  );
}
