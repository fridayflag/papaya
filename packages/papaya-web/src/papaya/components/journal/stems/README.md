# Stem Registry Architecture

This document describes the extensible stem registry system for Journal Entry editing.

## Overview

Stems are root-level documents that act as "plugins" or auxiliary behavior on top of journal entries. They can be as simple as associating a topic with an entry, or as complex as attaching multiple nested entries.

## Architecture Components

### 1. StemRegistry (`StemRegistry.ts`)

The central registry that manages all stem type definitions. It provides:

- **Registration**: Register new stem types with metadata, schemas, and renderers
- **Discovery**: Query available stems for an entry
- **Rendering**: Get appropriate renderer components for stems

Key concepts:
- **Render Modes**: 
  - `inline`: Renders as part of the main card content (e.g., Topic as a text field)
  - `nested`: Renders as nested cards beneath the entry (e.g., Fork with subentries)
- **Multiple Instances**: Some stems can be attached multiple times (e.g., Note), others only once (e.g., Topic)

### 2. Stem Definitions (`registerStems.ts`)

Each stem type is registered with:
- `id`: Unique identifier (e.g., 'topic', 'fork')
- `label`: Display name
- `icon`: React icon component
- `schema`: Zod schema for validation
- `renderMode`: 'inline' or 'nested'
- `allowMultiple`: Whether multiple instances are allowed
- `InlineRenderer` / `NestedRenderer`: Component to render the stem
- `createDefault`: Function to create default stem values
- `canAdd`: Optional function to conditionally allow adding stems

### 3. Stem Renderers (`renderers/`)

Individual renderer components for each stem type:

- **TopicStemRenderer**: Renders a text field for topic input
- **ForkStemRenderer**: Renders nested EntryEditableCards for subentries

Each renderer receives:
- `stem`: The stem instance data
- `stemId`: The stem's resource identifier
- `entryId`: The entry this stem is attached to
- `form`: React Hook Form context
- `onRemove`: Callback to remove the stem

### 4. StemActions (`StemActions.tsx`)

Component that renders buttons to add available stems to an entry. It:
- Queries the registry for available stems
- Shows "Add [Stem]" buttons for stems that can be added
- Handles adding new stems to the form

### 5. StemRenderers (`StemRenderers.tsx`)

Component that renders all stems attached to an entry. It:
- Separates inline and nested stems
- Renders appropriate components based on render mode
- Handles stem removal

### 6. EntryEditableCard Integration

The `EntryEditableCard` component:
- Uses `StemActions` to show add buttons in the card actions
- Uses `StemRenderers` with `mode="inline"` to render inline stems within the card
- Uses `StemRenderers` with `mode="nested"` to render nested stems as descendants

## Usage Example

### Adding a New Stem Type

1. **Create the schema** (if not already exists):
```typescript
// schema/new/stem/NoteStemSchema.ts
export const NoteStemSchema = makeStemSchema('papaya:stem:note', {
  content: z.string(),
});
```

2. **Create the renderer component**:
```typescript
// components/journal/stems/renderers/NoteStemRenderer.tsx
export default function NoteStemRenderer({ stem, stemId, form }: NoteStemRendererProps) {
  return (
    <TextField
      {...form.register(`stems.${stemId}.content`)}
      multiline
      rows={3}
      label="Note"
    />
  );
}
```

3. **Register the stem**:
```typescript
// components/journal/stems/registerStems.ts
StemRegistry.register({
  id: 'note',
  label: 'Note',
  icon: <Note />,
  schema: NoteStemSchema,
  renderMode: 'inline',
  allowMultiple: true,
  InlineRenderer: NoteStemRenderer,
  createDefault: (entryId) => ({
    _id: `papaya:stem:note:${uuidv4()}`,
    parentId: entryId,
    '@version': 1,
    content: '',
  }),
});
```

## Form Structure

The `EntryForm` schema includes:
- `entry`: The main entry document
- `stems`: A record mapping stem IDs to stem instances

```typescript
const EntryFormSchema = EntrySchema.extend({
  entry: EntrySchema,
  stems: z.record(PapayaGenericResourceIdentifierSchema, z.union([
    TopicStemSchema,
    ForkStemSchema,
    // ... other stems
  ])),
});
```

## Initialization

Stems are registered when the app initializes via `registerStems()` in `PapayaProviders`. This ensures all stem types are available throughout the application.

## Future Enhancements

- **Stem Dependencies**: Some stems might require or conflict with others
- **Stem Validation**: Cross-stem validation rules
- **Stem Templates**: Pre-configured stem combinations
- **Stem Plugins**: External stem definitions via plugins



