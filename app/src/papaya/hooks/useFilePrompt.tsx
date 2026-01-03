import { useCallback } from 'react'

export const useFilePrompt = () => {
  const promptForFile = useCallback((accept: string = '*', multiple: boolean = false): Promise<File | File[]> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = accept
      input.multiple = multiple

      input.addEventListener('change', (event) => {
        const files = (event.target as HTMLInputElement).files
        if (files) {
          resolve(multiple ? Array.from(files) : files[0])
        } else {
          reject(new Error('No file selected'))
        }
      })

      input.click()
    })
  }, [])

  return promptForFile
}
