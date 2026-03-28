import { Transaction } from "@/model/schema/resource-schemas";
import { Repository, ResourceIntrinsic } from "../Repository";

export class TransactionRepository extends Repository<"Transaction"> {
  constructor() {
    super("Transaction");
  }

  factory = (data: Partial<Transaction>): ResourceIntrinsic<"Transaction"> => {
    return {
      parent: data.parent!,
      memo: data.memo ?? "",
      amount: data.amount ?? 0,
    };
  };
}

export const transactionRepository = new TransactionRepository();
