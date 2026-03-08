import { Repository } from "../Repository";

class JournalEntryRepository extends Repository<'JournalEntrySchema'> {

  constructor() {
    super('JournalEntrySchema');
  }

  factory = (data: Partial<JournalEntry>) => {
    const name = data.name ?? '';
    const email = data.email ?? `${name}@example.com`;
    return {
      name,
      email,
    }
  }
}

export const journalEntryRepository = new JournalEntryRepository();
