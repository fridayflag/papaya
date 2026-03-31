import type { JournalEntryRid } from "@/model/schema/namespace-schemas";
import { JournalEntry, Transaction } from "@/model/schema/resource-schemas";
import { Repository, ResourceIntrinsic } from "../Repository";
import { TransactionRepository } from "./TransactionRepository";

export class JournalEntryRepository extends Repository<"JournalEntry"> {
  private transactionRepository: TransactionRepository;

  constructor() {
    super("JournalEntry");
    this.transactionRepository = new TransactionRepository();
  }

  private makeTransaction(entryRid: JournalEntryRid): Transaction {
    return this.transactionRepository.Model.make({
      parent: entryRid,
    });
  }

  factory = (data: Partial<JournalEntry>): ResourceIntrinsic<"JournalEntry"> => {
    const rid: JournalEntryRid = data.rid ?? this.makeRid();

    return {
      journalRid: data.journalRid!,
      rid,
      transactions: data.transactions ?? Object.fromEntries(
        [this.makeTransaction(rid)]
          .map((transaction) => [transaction.rid, transaction])
      ),
    };
  };
}

export const journalEntryRepository = new JournalEntryRepository();
