import { DEFAULT_CURRENCY } from "@/constants/settings";
import { PapayaAppConfig, UserSettings } from "@/schema/resource-schemas";
import { OrmDocument } from "@/types/orm-types";
import { Repository, ResourceIntrinsic } from "../Repository";
import { journalRepository } from "./JournalRepository";
import { userSettingsRepository } from "./UserSettingsRepository";

export class AppConfigRepository extends Repository<"AppConfig"> {
  constructor() {
    super("AppConfig");
  }

  factory = (data: Partial<PapayaAppConfig>): ResourceIntrinsic<"AppConfig"> => {
    return {
      userSettings: data.userSettings ?? userSettingsRepository.Model.make({}),
    };
  };

  async getAppConfig(): Promise<OrmDocument<PapayaAppConfig> | undefined> {
    const result = await this.db.find({
      selector: { kind: this.schema.shape.kind.value },
      limit: 1,
    });
    return result.docs[0] as OrmDocument<PapayaAppConfig>;
  }

  async getOrCreateAppConfig(): Promise<PapayaAppConfig & { _id: string; _rev?: string }> {
    const existing = await this.getAppConfig();
    if (existing) {
      return existing;
    }

    const defaultJournal = await journalRepository.Model.create({
      name: "Default Journal",
      currency: DEFAULT_CURRENCY,
    });

    const userSettings: UserSettings = userSettingsRepository.Model.make({
      journal: {
        selection: "DEFAULT_JOURNAL_ELSE_PROMPT",
        defaults: {
          defaultJournalRid: defaultJournal.rid,
        },
      },
    });

    return this.Model.create({
      userSettings,
    });
  }

  async updateSettings(settings: UserSettings) {
    const config = await this.getOrCreateAppConfig();
    return this.Model.save({ ...config, userSettings: settings });
  }
}

export const appConfigRepository = new AppConfigRepository();
