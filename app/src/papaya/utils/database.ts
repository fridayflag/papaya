export const dbNameToUsername = (prefixedHexName: string) => {
  const hex = prefixedHexName.replace('userdb-', '');
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
};

export const usernameToDbName = (name: string) => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(name);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `userdb-${hex}`;
};

export const getUrlPartsFromCouchDbConnectionString = (couchDbConnectionString: string) => {
  try {
    const parsedUrl = new URL(couchDbConnectionString)

    const protocol = parsedUrl.protocol // includes ':' at the end
    const user = parsedUrl.username || null
    const password = parsedUrl.password || null
    const hostname = parsedUrl.hostname
    const port = parsedUrl.port || null
    const database = parsedUrl.pathname.replace(/^\//, '') || null

    const portString = `:${port}`
    return {
      url: `${protocol}//${hostname}${port ? portString : ''}/${database}`,
      user,
      password,
    }
  } catch (_error: any) {
    throw new Error('Invalid CouchDB connection string')
  }
}

export const getBasicAuthHeader = (username: string, password: string) => {
  const hash = `${username}:${password}`
  return `Basic ${btoa(hash)}`
}

export const testCouchDbConnection = async (couchDbConnectionString: string): Promise<boolean> => {
  const { url, user, password } = getUrlPartsFromCouchDbConnectionString(couchDbConnectionString)
  console.log({ url, user, password })

  if (!user || !password || !url) {
    console.log('invalid input')
    return false
  }

  let response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: getBasicAuthHeader(user, password),
        'Content-Type': 'application/json',
      },
    })
  } catch {
    return false
  }

  return Boolean(response?.ok)
}
