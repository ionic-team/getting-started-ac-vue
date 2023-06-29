import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions, TokenType } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
import { useSessionVault } from './session-vault';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
let initializing: Promise<void>;
const { clearSessionVault, getSession, setSession } = useSessionVault();

const options: ProviderOptions = {
  audience: import.meta.env.VITE_AUDIENCE,
  clientId: import.meta.env.VITE_CLIENTID,
  discoveryUrl: import.meta.env.VITE_DISCOVERYURL,
  logoutUrl: isNative ? import.meta.env.VITE_LOGOUTURLMOBILE : import.meta.env.VITE_LOGOUTURLWEB,
  redirectUri: isNative ? import.meta.env.VITE_REDIRECTURIMOBILE : import.meta.env.VITE_REDIRECTURIWEB,
  scope: import.meta.env.VITE_SCOPE,
};

const performInit = async (): Promise<void> => {
  await AuthConnect.setup({
    platform: isNative ? 'capacitor' : 'web',
    logLevel: 'DEBUG',
    ios: {
      webView: 'private',
    },
    web: {
      uiMode: 'popup',
      authFlow: 'implicit',
    },
  });
};

const initialize = async (): Promise<void> => {
  if (!initializing) {
    initializing = new Promise((resolve) => {
      performInit().then(() => resolve());
    });
  }
  return initializing;
};

const refreshAuth = async (authResult: AuthResult): Promise<AuthResult | null> => {
  let newAuthResult: AuthResult | null = null;

  if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
    try {
      newAuthResult = await AuthConnect.refreshSession(provider, authResult);
    } catch (err) {
      null;
    }
  }
  saveAuthResult(newAuthResult);

  return newAuthResult;
};

const saveAuthResult = async (authResult: AuthResult | null): Promise<void> => {
  if (authResult) {
    await setSession(authResult);
  } else {
    await clearSessionVault();
  }
};

const getAuthResult = async (): Promise<AuthResult | null> => {
  let authResult = await getSession();
  if (authResult && (await AuthConnect.isAccessTokenExpired(authResult))) {
    authResult = await refreshAuth(authResult);
  }
  return authResult;
};

const isAuthenticated = async (): Promise<boolean> => {
  await initialize();
  return !!(await getAuthResult());
};

const getAccessToken = async (): Promise<string | undefined> => {
  await initialize();
  const res = await getAuthResult();
  return res?.accessToken;
};

const getUserName = async (): Promise<string | undefined> => {
  await initialize();
  const res = await getAuthResult();
  if (res) {
    const data = (await AuthConnect.decodeToken(TokenType.id, res)) as { name: string };
    return data?.name;
  }
};

const login = async (): Promise<void> => {
  await initialize();
  const authResult = await AuthConnect.login(provider, options);
  await saveAuthResult(authResult);
};

const logout = async (): Promise<void> => {
  await initialize();
  const authResult = await getAuthResult();
  if (authResult) {
    await AuthConnect.logout(provider, authResult);
    await saveAuthResult(null);
  }
};

initialize();

export const useAuth = () => ({
  getAccessToken,
  getUserName,
  isAuthenticated,
  login,
  logout,
});
