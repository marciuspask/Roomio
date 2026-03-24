type TokenGetter = () => Promise<string | null>;

let _tokenGetter: TokenGetter | null = null;

export function setTokenGetter(fn: TokenGetter): void {
  _tokenGetter = fn;
}

export async function getAuthToken(): Promise<string | null> {
  if (!_tokenGetter) return null;
  return _tokenGetter();
}
