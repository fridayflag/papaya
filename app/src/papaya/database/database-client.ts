import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'

const POUCH_DB_NAME = 'papaya'

PouchDB.plugin(PouchDBFind)

let db: PouchDB.Database | null = null

export const initializeDatabaseClient = () => {
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

  return db
}

export const getDatabaseClient = () => {
  if (!db) {
    return initializeDatabaseClient()
  }
  return db
}
