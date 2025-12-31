import z from "zod";
import { RelationTypeSchema } from "../../relation";
import { PapayaGenericResourceIdentifierSchema } from "../other/PapayaGenericResourceIdentifierSchema";
import { makeStemSchema } from "../schema-utils";


export const RelationStemSchema = makeStemSchema('papaya:stem:relation', {
  relatesTo: PapayaGenericResourceIdentifierSchema,
  relation: RelationTypeSchema,
});
export type RelationStem = z.infer<typeof RelationStemSchema>;
