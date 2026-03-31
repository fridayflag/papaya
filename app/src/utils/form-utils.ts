import { JOURNAL_ENTRY_DEFAULT_MEMO } from "@/constants/journal-editor-constants";
import { JournalEntryForm, TransactionForm } from "@/model/schema/form-schemas";


export const _getJournalEntryMemoForDisplay = (form: JournalEntryForm): string => {
  if (form.memo?.trim()) {
    return form.memo.trim();
  }

  const transactions: TransactionForm[] = Object.values(form.transactions);

  const transactionMemo: string | undefined = transactions.find((transaction) => !!transaction.memo?.trim())?.memo?.trim();

  if (!transactionMemo) {
    return JOURNAL_ENTRY_DEFAULT_MEMO;
  }

  return transactionMemo;
}
