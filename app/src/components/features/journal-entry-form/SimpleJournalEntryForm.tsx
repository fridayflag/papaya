import { JournalEntryTransactionForm } from "@/components/features/journal-entry-form/JournalEntryTransactionForm";
import { JournalEntryForm } from "@/model/schema/form-schemas";
import { TransactionRid } from "@/model/schema/namespace-schemas";
import { useFormContext } from "react-hook-form";


export function SimpleJournalEntryForm() {
  const { watch } = useFormContext<JournalEntryForm>()

  const transactions = watch('transactions');

  const transactionRid = Object.keys(transactions)[0] as TransactionRid | undefined;

  if (!transactionRid) {
    return null;
  }

  return (
    <JournalEntryTransactionForm transactionRid={transactionRid} />
  )
}
