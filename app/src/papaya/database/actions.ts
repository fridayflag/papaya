import { PapayaConfig, PapayaConfigSchema, UserSettings, UserSettingsSchema } from '@/schema/application/config'
import { Entry, Journal } from '@/schema/journal/resource/document'
import { makeDefaultConfig, makeJournal } from '@/schema/support/factory'
import { JournalUrn } from '@/schema/support/urn'
import { getDatabaseClient } from './client'

const db = getDatabaseClient()

export const ARBITRARY_MAX_FIND_LIMIT = 10000 as const

const configNamespace = 'papaya:document:config' as const satisfies PapayaConfig['kind'];

export const getOrCreatePapayaConfig = async (): Promise<PapayaConfig> => {

  const result = await db.find({
    selector: {
      kind: configNamespace,
    },
    limit: 2,
  });

  if (result.docs.length > 1) {
    console.warn('Multiple papaya:entity:config documents found.')
  }

  const config = result.docs[0] as PapayaConfig;

  if (config) {
    return config
  }

  const newConfig = makeDefaultConfig();

  /**
   * Assume that because the config wasn't in the database, there must also be
   * no journal to open by default.
   */
  const defaultJournal = makeJournal({
    name: 'Default Journal',
    settings: {
      currency: { ...newConfig.userSettings.journal.currency }
    },
  });
  db.put(defaultJournal)
  console.log('Created new default journal:', defaultJournal);

  newConfig.userSettings.journal.defaultJournal = defaultJournal.urn;
  newConfig.userSettings.journal.journalSelection = 'DEFAULT_JOURNAL';
  db.put(newConfig)
  console.log('Created new app config:', newConfig);

  return newConfig
}

export const getJournal = async (journalId: JournalUrn | null): Promise<Journal | null> => {
  if (!journalId) {
    return null;
  }
  return db.get<Journal>(journalId);
}

export const getJournals = async (): Promise<Journal[]> => {
  console.log('Use Math.infinite() to get all journals');
  const result = await db.find({
    selector: {
      kind: 'papaya:document:journal',
    },
    limit: ARBITRARY_MAX_FIND_LIMIT,
  });

  const journals = result.docs as Journal[];
  return journals;
}

export const getLastOpenedJournal = async (): Promise<Journal | null> => {
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

export const getJournalEntries = async (journalId: JournalUrn | null): Promise<Entry[]> => {
  if (!journalId) {
    return [];
  }
  const entries = await db.find({
    selector: {
      kind: 'papaya:document:entry',
      journalId: journalId,
    },
    limit: ARBITRARY_MAX_FIND_LIMIT,
  });

  return entries.docs as Entry[];
};
