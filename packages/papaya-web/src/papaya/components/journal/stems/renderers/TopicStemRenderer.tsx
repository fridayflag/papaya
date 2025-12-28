import { TextField } from '@mui/material';
import { StemRendererProps } from '../StemRegistry';
import { TopicStemSchema } from '@/schema/new/stem/TopicStemSchema';

type TopicStemRendererProps = StemRendererProps<typeof TopicStemSchema>;

export default function TopicStemRenderer({ stem, stemPrn, form }: TopicStemRendererProps) {
  return (
    <TextField
      {...form.register(`entry.stems.${stemPrn}.slug`)}
      size="small"
      placeholder="#groceries"
      fullWidth
      label="Topic"
    />
  );
}


