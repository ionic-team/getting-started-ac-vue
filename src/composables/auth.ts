import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions, TokenType } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
import { useSessionVault } from './session-vault';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
let initializing: Promise<void> | undefined;
const { clearSessionVault, getSession, setSession } = useSessionVault();

const options: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative ? 'msauth://login' : 'http://localhost:8100/login',
  redirectUri: isNative ? 'msauth://login' : 'http://localhost:8100/login',
  scope: 'openid offline_access email picture profile',
};

const performInit = async (): Promise<void> => {
  await AuthConnect.setup({
    platform: isNative ? 'capacitor' : 'web',
    logLevel: 'DEBUG',
    ios: {
      webView: 'private',
    },
    web: {
      implicitLogin: 'popup',
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

const refreshAuth = async (authResult: AuthResult): Promise<AuthResult | undefined> => {
  let newAuthResult: AuthResult | undefined;

  if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
    try {
      newAuthResult = await AuthConnect.refreshSession(provider, authResult);
    } catch (err) {
      null;
    }
    saveAuthResult(newAuthResult);
  }

  return newAuthResult;
};

const saveAuthResult = async (authResult: AuthResult | undefined): Promise<void> => {
  if (authResult) {
    await setSession(authResult);
  } else {
    await clearSessionVault();
  }
};

const getAuthResult = async (): Promise<AuthResult | undefined> => {
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
    await saveAuthResult(undefined);
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
