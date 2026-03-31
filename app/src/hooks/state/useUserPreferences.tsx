import { PapayaConfigContext } from "@/model/contexts/PapayaConfigContext";
import { UserSettings } from "@/model/schema/application/config";
import { useContext } from "react";


export function useUserPreferences(): UserSettings | undefined {
  const { papayaConfig } = useContext(PapayaConfigContext);
  return papayaConfig?.userSettings;
}
