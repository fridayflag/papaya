import { DEFAULT_CURRENCY } from "@/constants/settings";
import type { PapayaResourceRid } from "@/schema/namespace-schemas";
import { Journal } from "@/schema/resource-schemas";
import { Repository, ResourceIntrinsic } from "../Repository";

export class JournalRepository extends Repository<"Journal"> {
  constructor() {
    super("Journal");
  }

  factory = (data: Partial<Journal>): ResourceIntrinsic<"Journal"> => {
    const defaultCurrency = DEFAULT_CURRENCY;
    return {
      name: data.name ?? "",
      notes: data.notes ?? "",
      lastOpenedAt: data.lastOpenedAt ?? null,
      currency: data.currency ?? defaultCurrency,
      createdAt: data.createdAt ?? new Date().toISOString(),
    };
  };

  async get(rid: PapayaResourceRid<"Journal">): Promise<(Journal & { _id: string; _rev?: string }) | null> {
    try {
      return (await this.db.get(rid)) as Journal & { _id: string; _rev?: string };
    } catch {
      return null;
    }
  }

  async getAll(): Promise<(Journal & { _id: string; _rev?: string })[]> {
    const result = await this.db.find({
      selector: { kind: this.schema.shape.kind.value },
    });
    return result.docs as (Journal & { _id: string; _rev?: string })[];
  }

  async getLastOpened(): Promise<(Journal & { _id: string; _rev?: string }) | null> {
    const journals = await this.getAll();
    const sorted = journals.sort((a, b) => {
      const ta = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
      const tb = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;
      return tb - ta;
    });
    return sorted[0] ?? null;
  }
}

export const journalRepository = new JournalRepository();
