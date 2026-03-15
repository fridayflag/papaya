import { CurrencyIso4217 } from "@/schema/etc-schemas";

// TODO should pull this from .env
export const DEFAULT_CURRENCY = 'CAD' as const satisfies CurrencyIso4217;
