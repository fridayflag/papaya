import { getDatabaseClient } from "@/database/client";
import { ResourceRegistry } from "@/orm/ResourceRegistry";
import { OrmDocument } from "@/types/orm-types";
import dayjs from "dayjs";
import { v6 as uuidv6 } from 'uuid';
import z from "zod";

type ResourceRegistryKey = keyof typeof ResourceRegistry.shape;

type ResourceBaseShapeKeys = 'rid' | 'kind' | 'updatedAt' | '@version'

type Resource<N extends ResourceRegistryKey> = z.infer<typeof ResourceRegistry.shape[N]>;
type IntrinsicResource<N extends ResourceRegistryKey> =
  & Omit<Resource<N>, ResourceBaseShapeKeys>
  & Partial<Pick<Resource<N>, ResourceBaseShapeKeys>>;

export abstract class Repository<N extends ResourceRegistryKey> {
  private db: PouchDB.Database = getDatabaseClient();

  private readonly schema: (typeof ResourceRegistry.shape)[N];

  constructor(key: N) {
    this.schema = ResourceRegistry.shape[key]
  }

  public validate(data: Resource<N>) {
    return this.schema.safeParse(data)
  }


  /**
   * Abstract factory method that describes how to make a new resource,
   * excluding the resource base.
   */
  abstract factory(data: Partial<Resource<N>>): IntrinsicResource<N>;

  /**
   * Static object that contains the methods for the model.
   */
  Model = {
    /**
     * Returns a new resource without persisting.
     */
    make: (data: Partial<Resource<N>>): Resource<N> => {
      const resource: IntrinsicResource<N> = this.factory(data);
      const kind = this.schema.shape.kind.value;
      return {
        rid: `${kind}:${uuidv6()}`,
        kind,
        updatedAt: dayjs().toISOString(),
        '@version': 0,
        ...resource,
      } as Resource<N>;
    },

    /**
     * Creates a new resource and persists it to the database.
     */
    create: async (data: Partial<Resource<N>>): Promise<OrmDocument<Resource<N>>> => {
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

      const response = await this.db.put(doc as PouchDB.Core.PutDocument<Resource<N>>) as PouchDB.Core.Response;

      return {
        ...doc,
        _rev: response.rev,
      };
    },
  } as const;

}
