import { JournalForm } from "@/schema/form/journal";
import { Entry } from "@/schema/journal/resource/document";
import { EntryUrn } from "@/schema/support/urn";

/**
 * Marshals a journal form into a set of entries
 * 
 * @param form The form to marshal
 * @param context The original context 
 * @returns 
 */
export const marshalJournalForm = (form: JournalForm, context: Record<EntryUrn, Entry>): Record<EntryUrn, Entry> => {


  return {};
}

export const unmarshalJournalForm = (base: Entry, context: Record<EntryUrn, Entry>): JournalForm => {


}

// export const serializeJournalForm = (form: JournalForm): Entry => {
//   const { context, baseEntry, childEntries } = form;
//   const { currency, journalId } = context;

//   const baseEntryUrn = baseEntry.urn ?? makePapayaUrn('papaya:document:entry');

//   return {
//     _id: baseEntryUrn,
//     kind: 'papaya:document:entry',
//     '@version': SCHEMA_VERSION,
//     journalId,
//     urn: baseEntryUrn,
//     memo: form.baseEntry.memo,
//     amount: parseJournalEntryAmount(baseEntry.amount, currency) ?? makeFigure(0, currency),
//     date: baseEntry.date,
//     topics: baseEntry.topics,
//     sourceAccount: baseEntry.sourceAccount,
//     destinationAccount: baseEntry.destinationAccount,
//     children: childEntries.map((child) => {
//       return {
//         kind: 'papaya:resource:subentry',
//         '@version': SCHEMA_VERSION,
//         urn: child.urn ?? makePapayaUrn('papaya:resource:subentry'),
//         memo: child.memo,
//         amount: parseJournalEntryAmount(child.amount, currency) ?? makeFigure(0, currency),
//         date: child.date,
//         topics: child.topics,
//         sourceAccount: child.sourceAccount,
//         destinationAccount: child.destinationAccount,
//         children: [],
//       } satisfies SubEntry;
//     }),
//   } satisfies Entry;
// }
