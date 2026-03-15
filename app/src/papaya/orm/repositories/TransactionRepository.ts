import { DEFAULT_CURRENCY } from "@/constants/settings";
import { Transaction } from "@/schema/resource-schemas";
import dayjs from "dayjs";
import { Repository, ResourceIntrinsic } from "../Repository";

export class TransactionRepository extends Repository<"Transaction"> {
  constructor() {
    super("Transaction");
  }

  factory = (data: Partial<Transaction>): ResourceIntrinsic<"Transaction"> => {
    const currency = data.price?.currency ?? DEFAULT_CURRENCY;
    return {
      parent: data.parent ?? null,
      memo: data.memo ?? "",
      price: data.price ?? {
        currency,
        amount: 0,
      },
      date: data.date ?? dayjs().format("YYYY-MM-DD"),
      time: data.time ?? null,
      sourceAccount: data.sourceAccount ?? null,
      destinationAccount: data.destinationAccount ?? null,
      topics: data.topics ?? null,
    };
  };
}

export const transactionRepository = new TransactionRepository();
