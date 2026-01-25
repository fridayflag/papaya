import z from "zod";
import { type JournalEntryForm, JournalEntryFormSchema } from "./form-schemas";
import { type Entry, EntrySchema } from "./journal/resource/documents";

export const JournalFormCodec = z.codec(
  EntrySchema,
  JournalEntryFormSchema,
  {
    decode: (entry: Entry): JournalEntryForm => {
      return {

      }
    },
    encode: (form: JournalEntryForm): Entry => {
      //;
    },

  }
);
