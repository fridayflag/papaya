import { AdminDashboardContext } from "@/contexts/AdminDashboardContext";
import { DatabaseManagementStatus, UserDocument, UserIdentifier } from "@/schema/application/remote-schemas";
import { UserCredentialsForm } from "@/schema/form-schemas";
import { PropsWithChildren, useMemo, useState } from "react";

export default function AdminDashboardContextProvider(props: PropsWithChildren) {
  const [adminCredentials, setAdminCredentials] = useState<UserCredentialsForm | null>(null);
  const [databaseManagementStatus, setDatabaseManagementStatus] = useState<DatabaseManagementStatus | null>(null);

  const authHeaders = useMemo(() => {
    if (!adminCredentials) {
      return undefined;
    }
    return {
      'Authorization': `Basic ${btoa(`${adminCredentials.username}:${adminCredentials.password}`)}`,
    };
  }, [adminCredentials]);

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

  const listUsers = async (): Promise<UserDocument[]> => {
    const response = await fetch('/api/admin/users', {
      method: 'GET',
      credentials: 'include',
      headers: authHeaders,
    });
    if (!response.ok) {
      throw new Error('Failed to list users');
    }
    const data: UserDocument[] = await response.json();
    return data;
  }

  const saveUser = async (user: UserDocument): Promise<void> => {
    const response = await fetch(`/api/admin/users`, {
      method: 'PUT',
      credentials: 'include',
      headers: authHeaders,
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('Failed to add or update user');
    }
  }

  const deleteUser = async (userId: UserIdentifier): Promise<void> => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: authHeaders,
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }

  const context: AdminDashboardContext = {
    authenticate,
    listUsers,
    saveUser,
    deleteUser,
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
