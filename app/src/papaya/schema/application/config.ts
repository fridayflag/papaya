import z from "zod";
import { CurrencyIso4217Schema } from "../journal/money";
import { createPapayaDocumentSchema, createPapayaEntitySchema } from "../support/template";
import { JournalUrnSchema } from "../support/urn";

export const CurrencyPrefererencesSchema = z.object({
  display: CurrencyIso4217Schema,
  entry: CurrencyIso4217Schema,
});

export const UserSettingsSchema = createPapayaEntitySchema('papaya:entity:usersettings', {
  journal: z.object({
    journalSelection: z.enum([
      /**
       * When starting a new session, always prompt the user to select a journal.
       */
      'ALWAYS_PROMPT',
      /**
       * When starting a new session, open the default journal.
       */
      'DEFAULT_JOURNAL',
      /**
       * When starting a new session, open the last opened journal.
       */
      'LAST_OPENED'
    ]).default('DEFAULT_JOURNAL'),

    /**
     * The journal to open by default.
     */
    defaultJournal: JournalUrnSchema.nullish(),

    /**
     * Currency preferences
     */
    currency: CurrencyPrefererencesSchema,
  }),
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const JournalSettingsSchema = z.object({
  currency: CurrencyPrefererencesSchema,
});

export const PapayaConfigSchema = createPapayaDocumentSchema('papaya:document:config', {
  userSettings: UserSettingsSchema,
}).omit({
  journalId: true,
});

export type PapayaConfig = z.infer<typeof PapayaConfigSchema>;
