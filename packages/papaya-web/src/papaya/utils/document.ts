
/**
 * @deprecated infer directly via `kind` discriminator
 */
export const documentIsJournalEntry = (doc: PapayaDocument): doc is JournalEntry => {
  return 'kind' in doc && doc.kind === 'papaya:entry'
}

/**
 * @deprecated infer directly via `kind` discriminator
 */
export const documentIsCategory = (doc: PapayaDocument): doc is Category => {
  return 'kind' in doc && doc.kind === 'papaya:category'
}

