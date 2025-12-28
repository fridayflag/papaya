import { Entry, EntryIdentifier } from '@/schema/new/document/EntrySchema';
import { Prn } from '@/schema/new/other/PapayaResourceNameSchema';
import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { EntryForm } from '../StemEditor';

/**
 * Defines how a stem is rendered within the entry card
 */
export type StemRenderMode =
  | 'inline'      // Renders as part of the main card content (e.g., Topic as a text field)
  | 'nested';     // Renders as nested cards beneath the entry (e.g., Fork with subentries)

/**
 * Configuration for a stem type in the registry
 */
export interface StemDefinition<T extends z.ZodTypeAny = z.ZodTypeAny> {
  /** Unique identifier for the stem type (e.g., 'topic', 'fork') */
  id: string;

  /** Display label for the stem */
  label: string;

  /** Icon component to display */
  icon: ReactNode;

  /** Zod schema for this stem type */
  schema: T;

  /** How this stem should be rendered */
  renderMode: StemRenderMode;

  /** Whether multiple instances of this stem can be attached to the same entry */
  allowMultiple: boolean;

  /** 
   * Component that renders the stem's UI when in 'inline' mode.
   * Receives the stem data and form context.
   */
  InlineRenderer?: React.ComponentType<StemRendererProps<T>>;

  /** 
   * Component that renders the stem's UI when in 'nested' mode.
   * Receives the stem data and form context.
   */
  NestedRenderer?: React.ComponentType<StemRendererProps<T>>;

  /** 
   * Function to create default values for a new stem instance.
   */
  createDefault: () => z.infer<T>;

  /** 
   * Optional function to determine if this stem can be added to an entry.
   * Useful for conditional availability based on entry state or other stems.
   */
  canAdd?: (entryId: EntryIdentifier, existingStems: Entry['stems']) => boolean;
}

/**
 * Props passed to stem renderer components
 */
export interface StemRendererProps<T extends z.ZodTypeAny = z.ZodTypeAny> {
  /** The stem instance data */
  stem: z.infer<T>;

  /** The stem's PRN */
  stemPrn: Prn;

  /** The entry ID this stem is attached to */
  entryId: EntryIdentifier;

  /** React Hook Form context */
  form: UseFormReturn<EntryForm>;

  /** Callback to remove this stem */
  onRemove: () => void;
}

/**
 * Registry of all available stem types
 */
export const StemRegistry = {
  /**
   * Map of stem definitions by ID
   */
  stems: new Map<string, StemDefinition>(),

  /**
   * Register a new stem type
   */
  register<T extends z.ZodTypeAny>(definition: StemDefinition<T>): void {
    StemRegistry.stems.set(definition.id, definition);
  },

  /**
   * Get a stem definition by ID
   */
  get(id: string): StemDefinition | undefined {
    return StemRegistry.stems.get(id);
  },

  /**
   * Get all registered stem definitions
   */
  getAll(): StemDefinition[] {
    return Array.from(StemRegistry.stems.values());
  },

  /**
   * Get all stems that can be added to an entry
   */
  getAvailableStems(entryId: EntryIdentifier, existingStems: Entry['stems']): StemDefinition[] {
    return StemRegistry.getAll().filter(stem => {
      // Check if already attached
      const stems = existingStems || {};
      const stemPrn = `papaya:stem:${stem.id}` as Prn;
      const isAttached = stemPrn in stems;

      // If only one instance allowed and already attached, skip
      if (!stem.allowMultiple && isAttached) {
        return false;
      }

      // Check custom canAdd function if provided
      if (stem.canAdd) {
        return stem.canAdd(entryId, existingStems || {});
      }

      return true;
    });
  },

  /**
   * Find stems attached to an entry by type
   */
  findStemsByType(_entryId: EntryIdentifier, stemType: string, stems: Entry['stems']): Array<{ prn: Prn; stem: any }> {
    const stemPrn = `papaya:stem:${stemType}` as Prn;
    return Object.entries(stems || {})
      .filter(([prn, stem]: [string, any]) =>
        prn === stemPrn && stem
      )
      .map(([prn, stem]) => ({ prn: prn as Prn, stem }));
  },
};

