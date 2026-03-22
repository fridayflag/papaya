import { PapayaConfigContext } from "@/contexts/PapayaConfigContext";
import { UserSettings } from "@/schema/application/config";
import { useContext } from "react";


export function useUserPreferences(): UserSettings | undefined {
  const { papayaConfig } = useContext(PapayaConfigContext);
  return papayaConfig?.userSettings;
}
