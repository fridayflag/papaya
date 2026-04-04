import z from "zod";

const makeIdentifiers = <K extends string[]>(...keys: K): Record<K[number], z.ZodTemplateLiteral<`papaya:${K[number]}:${string}`>> => {
  return Object.fromEntries(
    keys.map((key) => {
      return [key, z.templateLiteral(['papaya:', key, ':', z.uuid()])] as const satisfies [K[number], z.ZodTemplateLiteral<`papaya:${K[number]}:${string}`>];
    })
  ) as Record<K[number], z.ZodTemplateLiteral<`papaya:${K[number]}:${string}`>>;
}

export const IdentifiersSchema = makeIdentifiers('config', 'journal', 'entry', 'person', 'transaction', 'task', 'relation', 'attachment', 'stamp', 'gratuity', 'note', 'obligation', 'recurrence', 'tasklist');

export const ResourceIdentifierSchema = z.union([
  z.templateLiteral(['papaya:currency:', z.string()]),
  z.templateLiteral(['papaya:journal:', z.string()]),
]);
