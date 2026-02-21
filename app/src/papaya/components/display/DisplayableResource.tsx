
import { AdornedResource, DecoratedSlug } from "@/schema/journal/display";
import { Typography } from "@mui/material";

interface DisplayableResourceProps {
  resource: AdornedResource | DecoratedSlug
}

export default function DisplayableResource(props: DisplayableResourceProps) {
  const { resource } = props
  if ('decorator' in resource) {
    return <Typography>{resource.decorator} {resource.slug}</Typography>
  }
  return <Typography>{resource.label}</Typography>
}
