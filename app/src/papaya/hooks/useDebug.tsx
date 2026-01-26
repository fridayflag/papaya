import { getDatabaseClient } from "@/database/client";
import { useQuery } from "@tanstack/react-query";

export function useDebug() {
  const allDbRecordsQuery = useQuery({
    queryKey: ['all-db-records'],
    queryFn: async () => {
      const db = getDatabaseClient()
      return db.allDocs({ include_docs: true })
    },
  });

  return {
    allDbRecordsQuery,
  };
}