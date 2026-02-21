import { Folder } from '@mui/icons-material'
import { Avatar, Card, CardMedia } from '@mui/material'
import { useEffect, useState } from 'react'

interface FilePreviewProps {
  file: File | undefined
}

export default function FilePreview(props: FilePreviewProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  console.log('FilePreview props:', props)

  useEffect(() => {
    if (!props.file) {
      return
    }

    if (props.file.type.startsWith('image')) {
      const objectURL = URL.createObjectURL(props.file)
      setImageSrc(objectURL)
    }

    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc)
      }
    }
  }, [props.file])

  return (
    <Card sx={{ aspectRatio: 4 / 5, width: 128 }}>
      {imageSrc ? (
        <CardMedia component="img" sx={{ objectFit: 'cover' }} height={'100%'} image={imageSrc} />
      ) : (
        <Avatar>
          <Folder />
        </Avatar>
      )}
    </Card>
  )
}
