import { ForkStemSchema } from '@/schema/new/stem/ForkStemSchema';
import { TopicStemSchema } from '@/schema/new/stem/TopicStemSchema';
import { AccountTree, Category } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { StemRegistry } from './StemRegistry';
import ForkStemRenderer from './renderers/ForkStemRenderer';
import TopicStemRenderer from './renderers/TopicStemRenderer';

/**
 * Register all stem types with the registry.
 * This should be called once during app initialization.
 */
export function registerStems() {
  // Register Topic stem
  StemRegistry.register({
    id: 'topic',
    label: 'Topic',
    icon: <Category />,
    schema: TopicStemSchema,
    renderMode: 'inline',
    allowMultiple: false, // Only one topic per entry
    InlineRenderer: TopicStemRenderer,
    createDefault: () => ({
      prn: `papaya:stem:topic:${uuidv4()}` as const,
      '@version': 1,
      slug: '#' as const,
    }),
  });

  // Register Fork stem
  StemRegistry.register({
    id: 'fork',
    label: 'Fork',
    icon: <AccountTree />,
    schema: ForkStemSchema,
    renderMode: 'nested',
    allowMultiple: false, // Only one fork per entry
    NestedRenderer: ForkStemRenderer,
    createDefault: () => ({
      prn: `papaya:stem:fork:${uuidv4()}` as const,
      '@version': 1,
      subentries: {},
    }),
  });

  // TODO: Register other stems (Note, Flag, Obligation, etc.)
  // Example:
  // StemRegistry.register({
  //   id: 'note',
  //   label: 'Note',
  //   icon: <Note />,
  //   schema: NoteStemSchema,
  //   renderMode: 'inline',
  //   allowMultiple: true,
  //   InlineRenderer: NoteStemRenderer,
  //   createDefault: (entryId) => ({
  //     _id: `papaya:stem:note:${uuidv4()}`,
  //     parentId: entryId,
  //     '@version': 1,
  //     content: '',
  //   }),
  // });
}

