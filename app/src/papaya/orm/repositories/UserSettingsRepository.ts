import { UserSettings } from "@/schema/resource-schemas";
import { Repository, ResourceIntrinsic } from "../Repository";

export class UserSettingsRepository extends Repository<"UserSettings"> {
  constructor() {
    super("UserSettings");
  }

  factory = (data: Partial<UserSettings>): ResourceIntrinsic<"UserSettings"> => {
    return {
      journal: data.journal ?? {
        selection: "LAST_OPENED",
        defaults: {
          defaultJournalRid: undefined,
        },
      },
    };
  };
}

export const userSettingsRepository = new UserSettingsRepository();
