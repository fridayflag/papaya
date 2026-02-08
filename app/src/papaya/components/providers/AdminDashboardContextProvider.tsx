import { AdminDashboardContext } from "@/contexts/AdminDashboardContext";
import { DatabaseManagementStatus, DatabaseManagementStatusSchema } from "@/schema/application/remote-schemas";
import { UserCredentialsForm } from "@/schema/form-schemas";
import { PropsWithChildren, useState } from "react";


export default function AdminDashboardContextProvider(props: PropsWithChildren) {
  const [adminCredentials, setAdminCredentials] = useState<UserCredentialsForm | null>(null);

  const authenticate = async (adminCredentials: UserCredentialsForm): Promise<DatabaseManagementStatus> => {
    const response = await fetch('/api/admin/authenticate', {
      method: 'POST',
      body: JSON.stringify(adminCredentials),
    });
    if (!response.ok) {
      throw new Error('Failed to authenticate');
    }
    setAdminCredentials(adminCredentials);
    const json = await response.json();
    return DatabaseManagementStatusSchema.parse(json);
  }

  const context: AdminDashboardContext = {
    authenticate,
  }

  return (
    <AdminDashboardContext.Provider
      value={context}
    >
      {props.children}
    </AdminDashboardContext.Provider>
  );
}
