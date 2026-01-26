import { getDatabaseClient } from "@/database/client";
import { useQuery } from "@tanstack/react-query";

export function useDebug() {
  const allDbRecordsQuery = useQuery({
    queryKey: ['all-db-records'],
    queryFn: async () => {
      const allRecords = await getDatabaseClient().allDocs();
      return allRecords;
    },
  });

  return {
    allDbRecordsQuery,
  };
}