import { CurrencyIso4217 } from "@/schema/journal/money";

// TODO could pull this from .env
export const DEFAULT_CURRENCY = 'CAD' as const satisfies CurrencyIso4217;
