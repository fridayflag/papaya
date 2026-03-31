'use client';

import { PapayaResource } from '@/model/orm/Repository';
import { OrmDocument } from '@/model/types/orm-types';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

declare function emit(key: string, value: string): void;

const POUCH_DB_NAME = 'papaya'

PouchDB.plugin(PouchDBFind)

let db: PouchDB.Database | null = null

type PapayaDocument = OrmDocument<PapayaResource>;

const initializeDatabaseClient = async () => {
  db = new PouchDB(POUCH_DB_NAME)

  db.createIndex({
    index: {
      fields: [
        'rid',
        'kind',
        'updatedAt',
        '@version',
      ],
    },
  })


  const designDoc = {
    '_id': '_design/papaya',
    views: {
      'journal_entries_by_rid': {
        map: function (doc: PapayaDocument) {
          if (doc.kind === 'papaya:journalentry') {
            emit(doc.rid, doc.rid);
          }
        }.toString(),
      },
    }
  }

  await db.put(designDoc);

  return db;
}

export const getDatabaseClient = async () => {
  if (!db) {
    return initializeDatabaseClient();
  }
  return db
}
