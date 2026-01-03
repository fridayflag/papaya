import nano from "nano";
import { PAPAYA_COUCHDB_ADMIN_PASS, PAPAYA_COUCHDB_ADMIN_USER, PAPAYA_COUCHDB_URL } from "./env.js";

/**
 * Singleton class for managing CouchDB connection
 */
export default class CouchDbConnection {
  private static instance: CouchDbConnection;
  private _couch: nano.ServerScope;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    const url = PAPAYA_COUCHDB_URL;
    const adminUser = PAPAYA_COUCHDB_ADMIN_USER;
    const adminPass = PAPAYA_COUCHDB_ADMIN_PASS;

    this._couch = nano(`http://${adminUser}:${adminPass}@${url.split('//')[1]}`);
  }

  /**
   * Get the singleton instance of CouchDbConnection
   * @returns The singleton instance
   */
  public static getInstance(): CouchDbConnection {
    if (!CouchDbConnection.instance) {
      CouchDbConnection.instance = new CouchDbConnection();
    }
    return CouchDbConnection.instance;
  }

  /**
   * Get the CouchDB connection
   * @returns The nano ServerScope instance
   */
  public get couch(): nano.ServerScope {
    return this._couch;
  }
}
