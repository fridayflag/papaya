import nano from "nano";
import CouchDbConnection from "./CouchDbConnection.js";

export default class Controller {
  protected get couch(): nano.ServerScope {
    return CouchDbConnection.getInstance().couch;
  }
}
