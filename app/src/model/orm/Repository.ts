import { getDatabaseClient } from "@/model/database/database-client";
import { ResourceSchemaRegistry } from "@/model/orm/ResourceSchemaRegistry";
import { PapayaResourceNamespace, PapayaResourceRid } from "@/model/schema/namespace-schemas";
import { OrmDocument } from "@/model/types/orm-types";
import dayjs from "dayjs";
import { v6 as uuidv6 } from "uuid";
import z from "zod";

// TODO determine programmatically
type ResourceBaseShapeKeys = 'rid' | 'kind' | 'updatedAt' | '@version'

type Resource<N extends PapayaResourceNamespace> = z.infer<typeof ResourceSchemaRegistry[N]>;

export type PapayaResource = Resource<PapayaResourceNamespace>

export type ResourceIntrinsic<N extends PapayaResourceNamespace> =
  & Omit<Resource<N>, ResourceBaseShapeKeys>
  & Partial<Pick<Resource<N>, ResourceBaseShapeKeys>>;

export abstract class Repository<N extends PapayaResourceNamespace> {
  protected readonly getDb = getDatabaseClient;

  protected readonly schema: (typeof ResourceSchemaRegistry)[N];

  constructor(ns: N) {
    this.schema = ResourceSchemaRegistry[ns];
  }

  /**
   * Abstract factory method that describes how to make a new resource,
   * excluding the resource base.
   */
  protected abstract factory(data: Partial<Resource<N>>): ResourceIntrinsic<N>;

  public validate(data: Resource<N>) {
    return this.schema.safeParse(data)
  }

  public makeRid() {
    return `${this.schema.shape.kind.value}:${uuidv6()}` as PapayaResourceRid<N>;
  }

  /**
   * Static object that contains the methods for the model.
   */
  Model = {
    /**
     * Returns a new resource without persisting.
     */
    make: (data: Partial<Resource<N>> = {}): Resource<N> => {
      const resource: ResourceIntrinsic<N> = this.factory(data);
      const kind = this.schema.shape.kind.value;
      return {
        rid: this.makeRid(),
        kind,
        updatedAt: dayjs().toISOString(),
        '@version': 0,
        ...resource,
      } as Resource<N>;
    },

    /**
     * Creates a new resource and persists it to the database.
     */
    create: async (data: Partial<Resource<N>> = {}): Promise<OrmDocument<Resource<N>>> => {
      const resource = this.Model.make(data);
      return this.Model.save(resource as Resource<N> & Partial<OrmDocument<Resource<N>>>);
    },

    /**
     * Updates a resource and persists it to the database.
     */
    save: async (data: Resource<N> & Partial<OrmDocument>): Promise<OrmDocument<Resource<N>>> => {

      const doc: OrmDocument<Resource<N>> = {
        ...data,
        _id: data._id ?? data.rid,
        _rev: data._rev ?? undefined,
      };

      const db = await this.getDb();

      const response = await db.put(doc as PouchDB.Core.PutDocument<Resource<N>>) as PouchDB.Core.Response;

      return {
        ...doc,
        _rev: response.rev,
      };
    },
  } as const;

}
