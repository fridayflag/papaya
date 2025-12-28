import z from "zod";


export const PapayaGenericResourceIdentifierSchema = z.templateLiteral(['papaya:', z.string()]);

export type PapayaGenericResourceIdentifier = z.infer<typeof PapayaGenericResourceIdentifierSchema>;