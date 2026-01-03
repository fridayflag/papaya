import { SCHEMA_VERSION } from '@/database/SchemaMigration';
import { v6 as uuidv6 } from 'uuid';
import { PapayaConfig } from '../application/config';
import { Journal } from '../journal/document/journal';
import { PapayaEntityNamespace } from './namespace';
import { PapayaUrn } from './urn';

export const makePapayaUrn = <N extends PapayaEntityNamespace>(namespace: N): `${N}:${string}` => {
  const uuid = uuidv6();
  return `${namespace}:${uuid}` as const satisfies PapayaUrn
}

export const makeJournal = (journal: Pick<Journal, 'name'>): Journal => {
  const id = makePapayaUrn('papaya:document:journal');

  return {
    _id: id,
    journalId: id,
    urn: id,
    kind: 'papaya:document:journal',
    '@version': SCHEMA_VERSION,
    name: journal.name,
    notes: '',
    lastOpenedAt: null,
    createdAt: new Date().toISOString(),
  }
}

export const makeDefaultConfig = (): PapayaConfig => {
  return {
    _id: 'papaya:config',
    '@version': SCHEMA_VERSION,
    userSettings: {
      kind: 'papaya:entity:usersettings',
      '@version': SCHEMA_VERSION,
      journal: {
        journalSelection: 'DEFAULT_JOURNAL',
        defaultJournal: null,
        currency: {
          display: 'CAD',
          journaling: 'CAD',
        },
      },
    },
  } as const satisfies PapayaConfig
}
