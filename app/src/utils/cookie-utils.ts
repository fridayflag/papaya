
export const hasSessionCookie = () => {
  return document.cookie.split(';').some(cookie => cookie.trim().startsWith('papaya_token='));
}

export const hasRefreshCookie = () => {
  return document.cookie.split(';').some(cookie => cookie.trim().startsWith('papaya_refresh='));
}

export const hasSessionOrRefreshCookie = () => {
  return hasSessionCookie() || hasRefreshCookie();
}

