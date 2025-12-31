import z from "zod";



const TopicSlugSchema = z.templateLiteral(['#', z.string()]);

// ====




const createPapayaObjectShapeSchema = <N extends PapayaNsid>(nsidSchema: N) => {
  return {
    '@nsid': nsidSchema,
    '@journalId': JournalNsidSchema,
  };
};

const TopicSetStemSchema = z.object({
  topiclist: z.object({
    ...createPapayaObjectShapeSchema(TopicSetNsidSchema),
    topics: z.array(TopicSlugSchema)
  })
});


// Root objects
const PapayaTemplateNsidSchema = z.templateLiteral(['papaya:', z.string(), ':', z.uuid()]);
const JournalNsidSchema = z.templateLiteral(['papaya:journal:', z.uuid()]) satisfies typeof PapayaTemplateNsidSchema;

// Stems
const PapayaStemTemplateNsidSchema = z.templateLiteral(['papaya:stem:', z.string(), ':', z.uuid()]);
const TopicSetStemNsidSchema = z.templateLiteral(['papaya:stem:topiclist:', z.uuid()]) satisfies typeof PapayaStemTemplateNsidSchema;

const PapayaStemNsidSchema = z.union([
  TopicSetStemNsidSchema,
]);

type PapayaStemNsid = z.infer<typeof PapayaStemNsidSchema>;

const PapayaNsidSchema = z.union([
  // Root objects
  JournalNsidSchema,

  // Stems
  PapayaStemNsidSchema,
])

type PapayaNsid = z.infer<typeof PapayaNsidSchema>;



const createStemSchema = <N extends string>(name: N, schema: z.ZodRawShape) => {
  return z.object({
    [name]: z.object({
      ...createPapayaObjectShapeSchema(nsidSchema),
      ...schema,
    }),
  });
};

const TopicSetStemSchema = createStemDefinition('topiclist', {
  topics: z.array(TopicSlugSchema),
});