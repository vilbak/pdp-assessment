// Stand-in auth-token getter (a real app would mint/refresh via Auth0 + secure storage).
// Issue 10: the token comes from here, not hardcoded into every fetch.
export const getAuthToken = (): string => 'token-from-secure-storage';
