import { SCHEMA_VERSION } from '@/database/SchemaMigration';
import { v6 as uuidv6 } from 'uuid';
import { PapayaConfig } from '../application/config';
import { Figure } from '../journal/entity/figure';
import { CurrencyIso4217 } from '../journal/money';
import { Entry, Journal } from '../journal/resource/document';
import { PapayaResourceNamespace } from './namespace';
import { JournalUrn, PapayaUrn } from './urn';

export const makePapayaUrn = <N extends PapayaResourceNamespace>(namespace: N): `${N}:${string}` => {
  const uuid = uuidv6();
  return `${namespace}:${uuid}` as const satisfies PapayaUrn
}

export const makeJournal = (journal: Pick<Journal, 'name' | 'settings'>): Journal => {
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
    settings: journal.settings,
  }
}

export const makeDefaultConfig = (): PapayaConfig => {
  const id = makePapayaUrn('papaya:document:config');
  const defaultCurrency = decideDefaultCurrency();
  return {
    _id: id,
    urn: id,
    kind: 'papaya:document:config',
    '@version': SCHEMA_VERSION,
    userSettings: {
      kind: 'papaya:entity:usersettings',
      '@version': SCHEMA_VERSION,
      journal: {
        journalSelection: 'DEFAULT_JOURNAL',
        defaultJournal: null,
        currency: {
          display: defaultCurrency,
          entry: defaultCurrency,
        },
      },
    },
  } as const satisfies PapayaConfig
}

const decideDefaultCurrency = (): CurrencyIso4217 => {
  // TODO try Intl.DateTimeFormat().resolvedOptions().timeZone 
  return 'CAD';
}

export const makeFigure = (amount: number, currency: CurrencyIso4217): Figure => {
  return {
    kind: 'papaya:entity:figure',
    '@version': SCHEMA_VERSION,
    currency,
    amount,
  }
}

export const _makeTempJournalEntries = (journalId: JournalUrn): Entry[] => {
  const date = new Date().toISOString();
  const memos = ['Groceries', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 'Food', 'Other'];

  const entries = []
  for (let i = 0; i < 10; i++) {
    const id = makePapayaUrn('papaya:document:entry');
    const memo = memos[Math.floor(Math.random() * memos.length)];
    const amount = makeFigure(Math.random() * 1000, 'CAD');
    const entry: Entry = {
      _id: id,
      journalId,
      urn: id,
      kind: 'papaya:document:entry',
      '@version': SCHEMA_VERSION,
      date,
      memo,
      amount,
    }
    entries.push(entry);
  }
  return entries;
}
