import { EntryIdentifier } from "@/schema/new/document/EntrySchema";
import { Stack, TextField } from "@mui/material";
import { useFormContext } from "react-hook-form";
import PapyaCard from "../../stems/PapayaCard";
import { EntryForm } from "./StemEditor";
import StemActions from "./stems/StemActions";
import StemRenderers from "./stems/StemRenderers";

interface EntryEditableCardProps {
  entryId: EntryIdentifier
}

export default function EntryEditableCard(props: EntryEditableCardProps) {
  const form = useFormContext<EntryForm>();
  const entry = form.watch('entry');
  const stems = entry.stems;

  return (
    <PapyaCard
      variantTitle='Entry'
      actions={
        <StemActions
          entryId={props.entryId}
          form={form}
          existingStems={stems}
        />
      }
      descendants={
        <StemRenderers
          entryId={props.entryId}
          form={form}
          stems={stems}
          mode="nested"
        />
      }
    >
      <Stack direction={'row'} gap={1}>
        <TextField
          {...form.register('entry.amount.@ephemeral.rawValue')}
          size='small'
          fullWidth
          sx={{ flex: 1 }}
          label='Amount'
        />

        <TextField
          {...form.register('entry.memo')}
          size='small'
          fullWidth
          sx={{ flex: 2 }}
          label='Memo'
        />
      </Stack>

      {/* Render inline stems within the card */}
      <StemRenderers
        entryId={props.entryId}
        form={form}
        stems={stems}
        mode="inline"
      />
    </PapyaCard>
  );
}
