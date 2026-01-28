
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true // If URL() does not throw, the URL is valid
  } catch {
    return false // Invalid URL
  }
}

export const ensureHttps = (url: string): string => {
  // Check if the URL starts with 'http://' or 'https://'
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }
  return url // Return the URL as-is if it already starts with 'http://' or 'https://'
}

export const parseServerUrl = (url: string | null): string => {
  if (!url) {
    return ''
  }
  try {
    // Parse the URL
    const parsedUrl = new URL(url)
    return parsedUrl.toString()
  } catch {
    return ''
  }
}

export const prettyPrintServerUrl = (url: string | null): string => {
  // If the URL is null, return an empty string
  if (!url) {
    return ''
  }

  try {
    // Parse the URL and return the hostname
    const parsedUrl = new URL(url)
    return parsedUrl.hostname
  } catch {
    return ''
  }
}

export const getServerApiUrl = (url: string | null): string => {
  // If the URL is null, return null
  if (!url) {
    return ''
  }

  try {
    // Parse the URL and return the API URL
    const parsedUrl = new URL(url)
    return `${parsedUrl.origin}/api/`
  } catch {
    return ''
  }
}

export const getServerDatabaseUrl = (url: string | null): string => {
  // If the URL is null, return null
  if (!url) {
    return ''
  }

  try {
    // Parse the URL and return the database URL
    const parsedUrl = new URL(url)
    return `${parsedUrl.origin}/proxy`
  } catch {
    return ''
  }
}
