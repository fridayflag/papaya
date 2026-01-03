import { PapayaConfig, PapayaConfigSchema, UserSettings, UserSettingsSchema } from '@/schema/application/config'
import { Journal } from '@/schema/journal/document/journal'
import { makeDefaultConfig, makeJournal } from '@/schema/support/factory'
import { getDatabaseClient } from './client'

const db = getDatabaseClient()

export const ARBITRARY_MAX_FIND_LIMIT = 10000 as const

export const getOrCreatePapayaConfig = async (): Promise<PapayaConfig> => {
  const configKey = 'papaya:config' as const satisfies PapayaConfig['_id'];
  const config: PapayaConfig | undefined = await db.get<PapayaConfig>(configKey);

  if (config) {
    return config
  }

  const newConfig = makeDefaultConfig();

  /**
   * Assume that because the config wasn't in the database, there must also be
   * no journal to open by default.
   */
  const defaultJournal = makeJournal({ name: 'Default Journal' });
  db.put(defaultJournal)
  console.log('Created new default journal:', defaultJournal);

  newConfig.userSettings.journal.defaultJournal = defaultJournal.urn;
  newConfig.userSettings.journal.journalSelection = 'DEFAULT_JOURNAL';
  db.put(newConfig)
  console.log('Created app config:', newConfig);

  return newConfig
}

export const getJournals = async (): Promise<Journal[]> => {
  console.log('Use Math.infinite() to get all journals');
  const journals = await db.find({
    selector: {
      kind: 'papaya:document:journal',
    },
    limit: ARBITRARY_MAX_FIND_LIMIT,
  });

  return journals.docs as Journal[];
}

export const getLastOpenedJournal = async (): Promise<Journal | undefined> => {
  const journals = await getJournals();
  return journals.sort((a, b) => {
    return (a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0) - (b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0);
  })[0];
}

export const updateSettings = async (settings: UserSettings): Promise<void> => {
  UserSettingsSchema.parse(settings);
  const config = await getOrCreatePapayaConfig();
  config.userSettings = settings;
  PapayaConfigSchema.parse(config);
  await db.put(config);
}
