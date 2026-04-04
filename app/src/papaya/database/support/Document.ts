import { ResourceIdentifierSchema } from "@/schema/identifier-schema";
import z from "zod";

type ResoureceIdentifier = z.infer<typeof ResourceIdentifierSchema>;

interface Resource<K extends ResoureceIdentifier> {
  urn: K;
  version: number;
}



type DocumentBase<K extends ResoureceIdentifier, R extends Re> = R & {
  _id: string;
  _rev: string;
}

// export abstract class Document<R extends Resource> {
//   _id!: string;
//   _rev!: string;

//   constructor(data: Partial<DocumentBase<R>>) {
//     Object.assign(this, data);
//   }

//   abstract save(): Promise<this>;
//   abstract delete(): Promise<void>;

// }

export abstract class Document<R extends Resource> {
  declare _id: string;
  declare _rev: string;

  constructor(data: Partial<DocumentBase<R>>) {
    Object.assign(this, data);
  }
}

