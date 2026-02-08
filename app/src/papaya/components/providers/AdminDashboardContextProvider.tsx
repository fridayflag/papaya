import { AdminDashboardContext } from "@/contexts/AdminDashboardContext";
import { DatabaseManagementStatus } from "@/schema/application/remote-schemas";
import { UserCredentialsForm } from "@/schema/form-schemas";
import { PropsWithChildren, useState } from "react";


export default function AdminDashboardContextProvider(props: PropsWithChildren) {
  const [adminCredentials, setAdminCredentials] = useState<UserCredentialsForm | null>(null);
  const [databaseManagementStatus, setDatabaseManagementStatus] = useState<DatabaseManagementStatus | null>(null);

  const authenticate = async (credentials: UserCredentialsForm): Promise<Response> => {
    // Credentials are passed via Basic auth
    const response = await fetch('/api/admin', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to authenticate');
    }
    setAdminCredentials(credentials);
    const json = await response.json();
    setDatabaseManagementStatus(json as DatabaseManagementStatus);
    return response;
  }

  const _addUser = async (_user: UserCredentialsForm): Promise<Response> => {
    // TODO
    return Promise.resolve(new Response());
  }

  const context: AdminDashboardContext = {
    authenticate,
    databaseManagementStatus,
  }

  return (
    <AdminDashboardContext.Provider
      value={context}
    >
      {props.children}
    </AdminDashboardContext.Provider>
  );
}
