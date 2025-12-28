import { Entry, EntryIdentifier } from '@/schema/new/document/EntrySchema';
import { Prn } from '@/schema/new/other/PapayaResourceNameSchema';
import { Stack } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import { EntryForm } from '../StemEditor';
import { StemRegistry } from './StemRegistry';

interface StemRenderersProps {
  entryId: EntryIdentifier;
  form: UseFormReturn<EntryForm>;
  stems: Entry['stems'];
  /** If true, only renders inline stems. If false, only renders nested stems. */
  mode?: 'inline' | 'nested';
}

/**
 * Helper function to group stems by render mode
 */
function groupStemsByMode(
  _entryId: EntryIdentifier,
  stems: Entry['stems']
): {
  inline: Array<{ prn: Prn; stem: any; definition: any }>;
  nested: Array<{ prn: Prn; stem: any; definition: any }>;
} {
  const inline: Array<{ prn: Prn; stem: any; definition: any }> = [];
  const nested: Array<{ prn: Prn; stem: any; definition: any }> = [];

  Object.entries(stems || {}).forEach(([stemPrn, stem]: [string, any]) => {
    // Skip invalid or incomplete stems
    if (!stem || !stem.prn || typeof stem.prn !== 'string') {
      return;
    }

    // Extract stem type from PRN (e.g., 'papaya:stem:topic' -> 'topic')
    const stemTypeMatch = stem.prn.match(/^papaya:stem:(.+)$/);
    if (!stemTypeMatch) {
      return;
    }

    const stemType = stemTypeMatch[1];
    const definition = StemRegistry.get(stemType);

    if (!definition) {
      return; // Unknown stem type, skip
    }

    const stemData = {
      prn: stemPrn as Prn,
      stem,
      definition,
    };

    if (definition.renderMode === 'inline' && definition.InlineRenderer) {
      inline.push(stemData);
    } else if (definition.renderMode === 'nested' && definition.NestedRenderer) {
      nested.push(stemData);
    }
  });

  return { inline, nested };
}

/**
 * Component that renders stems attached to an entry.
 * Can render either inline or nested stems based on the mode prop.
 */
export default function StemRenderers({ entryId, form, stems, mode }: StemRenderersProps) {
  const { inline, nested } = groupStemsByMode(entryId, stems);

  const handleRemoveStem = (stemPrn: Prn) => {
    const currentEntry = form.getValues('entry');
    const currentStems = currentEntry.stems || {};
    const { [stemPrn]: _removed, ...remainingStems } = currentStems;
    form.setValue('entry.stems', remainingStems);
  };

  // If mode is specified, only render that mode
  if (mode === 'inline') {
    if (inline.length === 0) return null;
    return (
      <Stack gap={1}>
        {inline.map(({ prn, stem, definition }) => {
          const Renderer = definition.InlineRenderer!;
          return (
            <Renderer
              key={prn}
              stem={stem}
              stemPrn={prn}
              entryId={entryId}
              form={form}
              onRemove={() => handleRemoveStem(prn)}
            />
          );
        })}
      </Stack>
    );
  }

  if (mode === 'nested') {
    if (nested.length === 0) return null;
    return (
      <Stack gap={2}>
        {nested.map(({ prn, stem, definition }) => {
          const Renderer = definition.NestedRenderer!;
          return (
            <Renderer
              key={prn}
              stem={stem}
              stemPrn={prn}
              entryId={entryId}
              form={form}
              onRemove={() => handleRemoveStem(prn)}
            />
          );
        })}
      </Stack>
    );
  }

  // Default: render both (for backwards compatibility)
  return (
    <>
      {inline.length > 0 && (
        <Stack gap={1}>
          {inline.map(({ prn, stem, definition }) => {
            const Renderer = definition.InlineRenderer!;
            return (
              <Renderer
                key={prn}
                stem={stem}
                stemPrn={prn}
                entryId={entryId}
                form={form}
                onRemove={() => handleRemoveStem(prn)}
              />
            );
          })}
        </Stack>
      )}
      {nested.length > 0 && (
        <Stack gap={2}>
          {nested.map(({ prn, stem, definition }) => {
            const Renderer = definition.NestedRenderer!;
            return (
              <Renderer
                key={prn}
                stem={stem}
                stemPrn={prn}
                entryId={entryId}
                form={form}
                onRemove={() => handleRemoveStem(prn)}
              />
            );
          })}
        </Stack>
      )}
    </>
  );
}

