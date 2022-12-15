# Getting Started with Auth Connect in @ionic/vue

In this tutorial we will walk through the basic setup and use of Ionic's Auth Connect in an `@ionic/vue` application.

In this tutorial, you will learn how to:

- Install and configure Auth Connect
- Perform Login and Logout operations
- Check if the user is authenticated
- Obtain the tokens from Auth Connect
- Integrate Identity Vault with Auth Connect

## Generate the Application

The first step to take is to generate the application:

```bash
ionic start getting-started-ac-vue tabs --type=vue
```

Now that the application has been generated, let's also add the iOS and Android platforms.

Open the `capacitor.config.ts` file and change the `appId` to something unique like `io.ionic.gettingstartedacvue`:

```TypeScript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.gettingstartedacvue',
  appName: 'getting-started-ac-vue',
  webDir: 'dist',
  bundledWebRuntime: false
};

export default config;
```

Next, build the application, then install and create the platforms:

```bash
npm run build
ionic cap add android
ionic cap add ios
```

Finally, in order to ensure that a `cap sync` is run with each build, add it to the build script in the `package.json` file as such:

```JSON
  "scripts": {
    "build": "vue-cli-service build && cap sync",
    ...
  },
```

## Install Auth Connect

In order to install Auth Connect, you will need to use `ionic enterprise register` to register your product key. This will create a `.npmrc` file containing the product key.

If you have already performed that step for your production application, you can just copy the `.npmrc` file from your production project. Since this application is for learning purposes only, you don't need to obtain another key.

You can now install Auth Connect and sync the platforms:

```bash
npm install @ionic-enterprise/auth
```

## Configure Auth Connect

Our next step is to configure Auth Connect. Create a file named `src/composables/auth.ts` and fill it with the following boilerplate content:

```typescript
import { ProviderOptions } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

const isNative = isPlatform('hybrid');

const options: ProviderOptions = {
  clientId: '',
  discoveryUrl: '',
  scope: 'openid offline_access',
  audience: '',
  redirectUri: isNative ? '' : '',
  logoutUrl: isNative ? '' : '',
};

export default () => ({});
```

### Auth Connect Options

The `options` object is passed to the `login()` function when we establish the authentication session. As you can see, there are several items that we need to fill in. Specifically: `audience`, `clientId`, `scope`, `discoveryUrl`, `redirectUri`, and `logoutUrl`.

Obtaining this information likely takes a little coordination with whoever administers our backend services. In our case, we have a team that administers our Auth0 services and they have given us the following information:

- Application ID: `yLasZNUGkZ19DGEjTmAITBfGXzqbvd00`
- Audience: `https://io.ionic.demo.ac`
- Metadata Document URL: `https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration`
- Web Redirect (for development): `http://localhost:8100/login`
- Native Redirect (for development): `msauth://login`
- Additional Scopes: `email picture profile`

Translating that into our configuration object, we now have this:

```typescript
const options: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative ? 'msauth://login' : 'http://localhost:8100/login',
  redirectUri: isNative ? 'msauth://login' : 'http://localhost:8100/login',
  scope: 'openid offline_access email picture profile',
};
```

The web redirect for development is on port `8100`. Vue uses port `8080` by default, so we will need to make a minor change to our `package.json` file as well:

```json
  "scripts": {
    "build": "vue-cli-service build && cap sync",
    "lint": "vue-cli-service lint",
    "serve": "vue-cli-service serve --port=8100",
    "test:unit": "vue-cli-service test:unit",
    "test:e2e": "vue-cli-service test:e2e"
  },
```

**Note:** you can use your own configuration for this tutorial as well. However, we suggest that you start with our configuration, get the application working, and then try your own configuration after that.

### Initialization

Before we can use any `AuthConnect` functions we need to make sure we have performed the initialization. Add the code to do this after the setting of the `options` value in `src/composables/auth.ts`.

```typescript
import { AuthConnect, ProviderOptions } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

const isNative = isPlatform('hybrid');

const options: ProviderOptions = {
  // see the options setting above
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

let initializing: Promise<void> | undefined;
const initialize = async (): Promise<void> => {
  if (!initializing) {
    initializing = new Promise((resolve) => {
      performInit().then(() => resolve());
    });
  }
  return initializing;
};

initialize();

export default () => ({});
```

This will get Auth Connect ready to use within our application. Notice that this is also where we supply any platform specific Auth Connect options. Right now, the `logLevel` is set to `DEBUG` since this is a demo application. In a production environment, we probably would set it to `DEBUG` in development and `ERROR` in production.

The `initialize()` function will be called from several locations to ensure the setup is complete before making any further `AuthConnect` calls.

### The Provider

Auth Connect requires a provider object that specifies details pertaining to communicating with the OIDC service. Auth Connect offers several common providers out of the box: `Auth0Provider`, `AzureProvider`, `CognitoProvider`, `OktaProvider`, and `OneLoginProvider`. You can also create your own provider, though doing so is beyond the scope of this tutorial.

Since we are using Auth0, we will create an `Auth0Provider`:

```typescript
import { Auth0Provider, ProviderOptions } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
...
const provider = new Auth0Provider();
...
export default () => ({});
```

### Login and Logout

Login and logout are the two most fundamental operations in the authentication flow.

For the `login()`, we need to pass both the `provider` and the `options` we established above. The `login()` call resolves an `AuthResult` if the operation succeeds. The `AuthResult` contains the auth tokens as well as some other information. This object needs to be passed to almost all other Auth Connect functions. As such, it needs to be saved.

The `login()` call rejects with an error if the user cancels the login or if something else prevents the login to complete.

Add the following code to `src/composables/auth.ts`:

```typescript
import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
...
let authResult: AuthResult | undefined;
...
const login = async (): Promise<void> => {
  await initialize();
  authResult = await AuthConnect.login(provider, options);
}
...
export default () => ({
  login
});
```

For the logout operation, we pass the `provider` and the `authResult` that was returned by the `login()` call.

```typescript
const logout = async (): Promise<void> => {
  await initialize();
  if (authResult) {
    await AuthConnect.logout(provider, authResult);
    authResult = undefined;
  }
};
...
export default () => ({
  login,
  logout,
});
```

To test these new function, replace the `ExploreContainer` with "Login" and "Logout" buttons in the `src/views/Tab1Page.vue` file. :

```html
<ion-button @click="login">Login</ion-button> <ion-button @click="logout">Logout</ion-button>
```

Within the `script` area, import `useAuth` and expose the `login` and `logout` functions:

```vue
<script setup lang="ts">
import { IonButton, IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import useAuth from '@/use/auth';

const { login, logout } = useAuth();
</script>
```

If you are using our Auth0 provider, you can use the following credentials for the test:

- Email Address: `test@ionic.io`
- Password: `Ion54321`

You should be able to login and and logout successfully.

### Configure the Native Projects

Build the application for a native device and try the login there as well. You should notice that this does not work on your device.

The problem is that we need to let the native device know which application(s) are allowed to handle navigation to the `msauth://` scheme. To do this, we need to modify our `AndroidManifest.xml` and `Info.plist` files <a href="https://ionic.io/docs/auth-connect/install" target="_blank">as noted here</a>. Use `msauth` in place of `$AUTH_URL_SCHEME`.

### Determine Current Auth Status

Right now, the user is shown both the login and logout buttons, and you don't really know if the user is logged in or not. Let's change that.

A simple strategy to use is if we have an `AuthResult` then we are logged in, otherwise we are not. Add code to do that in `src/composables/auth.ts`. Ignore the extra complexity with the `getAuthResult()` function. We will expand on that as we go.

```typescript
const getAuthResult = async (): Promise<AuthResult | undefined> => {
  return authResult;
}

const isAuthenticated = async (): Promise<boolean> => {
  await initialize();
  return !!(await getAuthResult());
}
...
export default () => ({
  isAuthenticated,
  login,
  logout,
});
```

Use this in the Tab1Page to display only the Login or the Logout button, depending on the current login status. First, update the bindings on the buttons:

```html
<ion-button v-if="authenticated === false" @click="loginClicked">Login</ion-button>
<ion-button v-if="authenticated" @click="logoutClicked">Logout</ion-button>
```

Notice the newly added `v-if` conditions. Also notice the changes to the `@click` event bindings. The reason for this is that our click logic is going to do a little more work than before.

What we want to do in the `script setup` node of the `Tab1Page` is:

- upon creating the page, check the current auth status
- after performing a login or logout operation, refresh the auth status

Here is one way to code all of that. Integrate this into the existing `Tab1Page` code.

```typescript
const authenticated = ref<boolean | undefined>();
const { login, logout, isAuthenticated } = useAuth();

const checkAuth = async () => {
  authenticated.value = await isAuthenticated();
};

const loginClicked = async () => {
  try {
    await login();
    checkAuth();
  } catch (err) {
    console.log('Error logging in:', err);
  }
};

const logoutClicked = async () => {
  await logout();
  checkAuth();
};

checkAuth();
```

Notice the `try ... catch` in `loginClicked()`. The `login()` will throw an error if the user fails to log in. Production applications should have some kind of handling here, but our sample can get away with simply logging the fact.

At this point, you should see the Login button if you are not logged in and the Logout button if you are.

### Get the Tokens

We can now log in and out, but what about getting at the tokens that our OIDC provider gave us? This information is stored as part of the `AuthResult`. Auth Connect also includes some methods that allow us to easily look at the contents of the tokens. For example:

```typescript
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
```

**Note:** the format and data stored in the ID token may changed based on your provider and configuration. Check the documentation and configuration of your own provider for details.

Add these to `src/composables/auth.ts` and export them at the end of the file like we did the other functions.

You can use these wherever you need to supply a specific token. For example, if you are accessing a backend API that requires you to include a bearer token (and you probably are if you are using Auth Connect), then you can use the `getAccessToken()` method and <a href="https://github.com/ionic-team/tea-taster-vue/blob/feature/auth-connect/src/use/backend-api.ts#L15-L22" target="_blank">create in interceptor</a> that adds the token.

We don't need an interceptor for this app, but as a challenge to you, update the Tab1Page to show the current user's name when they are logged in. You could also display the access token if you want (though you would _never_ do that in a real app).

### Refreshing the Authentication

In a typical OIDC implementation, access tokens are very short lived. In such a case, it is common to use a longer lived refresh token to obtain a new `AuthResult`.

Let's add a function to `src/composables/auth.ts` that does the refresh, and then modify `getAuthResult()` to call it when needed.

```typescript
const refreshAuth = async (authResult: AuthResult): Promise<AuthResult | undefined> => {
  let newAuthResult: AuthResult | undefined;

  if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
    try {
      newAuthResult = await AuthConnect.refreshSession(provider, authResult);
    } catch (err) {
      null;
    }
  }

  return newAuthResult;
};

const getAuthResult = async (): Promise<AuthResult | undefined> => {
  if (authResult && (await AuthConnect.isAccessTokenExpired(authResult))) {
    authResult = await refreshAuth(authResult);
  }
  return authResult;
};
```

Now anything using `getAuthResult()` to get the current auth result will automatically handle a refresh if needed.

## Store the Auth Result

Up until this point, we have been storing our `AuthResult` in a local state variable in `src/composables/auth.ts`. This has a couple of disadvantages:

- Our tokens could show up in a stack trace.t
- Our tokens do not survive a browser refresh or application restart.

There are several options we could use to store the `AuthResult`, but one that handles persistence as well as storing the data in a secure location on native devices is Identity Vault.

For our application we will install identity vault and use it in "secure storage" mode to store the tokens. The first step is to install the product.

```bash
npm i @ionic-enterprise/identity-vault
```

Next we will create a factory that builds either the actual vault if we are on a device or a browser based "vault" that is suitable for development if we are in the browser. The following code should go in `src/composables/vault-factory.ts`.

```typescript
import { isPlatform } from '@ionic/vue';
import { BrowserVault, IdentityVaultConfig, Vault } from '@ionic-enterprise/identity-vault';

export default () => {
  const createVault = (config: IdentityVaultConfig): Vault | BrowserVault =>
    isPlatform('hybrid') ? new Vault(config) : new BrowserVault(config);

  return { createVault };
};
```

This provides us with a secure vault on our devices, or a <a href="https://ionic.io/docs/identity-vault/classes/browservault" target="_blank">fallback vault</a> that allows us to keep using our browser-based development flow.

Now that we have a factory in place to build our vaults, let's create some functions that allow us to manage our authentication result.

Create a file called `src/composable/session-vault.ts` with the following contents:

```typescript
import { AuthResult } from '@ionic-enterprise/auth';
import { DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import useVaultFactory from './vault-factory';

const key = 'auth-result';

const { createVault } = useVaultFactory();
const vault = createVault({
  key: 'io.ionic.gettingstartedacvue',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 5000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
});

const clear = (): Promise<void> => {
  return vault.clear();
};

const getSession = (): Promise<AuthResult | undefined> => {
  return vault.getValue(key) as <AuthResult | undefined>;
};

const setSession = (value: AuthResult | undefined): Promise<void> => {
  return vault.setValue(key, value);
};

export default () => ({
  clear,
  getSession,
  setSession,
});
```

Then modify `src/composables/auth.ts` to use the `sessionVault` functions. The goal is to no longer store the auth result in a session variable. Instead, we will use the session vault to store the result and retrieve it from the vault as needed.

Remove the `let authResult: AuthResult | undefined;` line and replace it with the following:

```typescript
import useSessionVault from './session-vault';

const { clearSessionVault, getSession, setSession } = useSessionVault();
```

Create a new local function called `saveAuthResult()`:

```typescript
const saveAuthResult = async (authResult: AuthResult | undefined): Promise<void> => {
  if (authResult) {
    await setSession(authResult);
  } else {
    await clearSessionVault();
  }
};
```

Modify `refreshAuth` to save the results of an attempted refresh:

```typescript
const refreshAuth = async (authResult: AuthResult): Promise<AuthResult | undefined> => {
  let newAuthResult: AuthResult | undefined;

  if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
    try {
      newAuthResult = await AuthConnect.refreshSession(provider, authResult);
    } catch (err) {
      // You could also log this, or otherwise mark the failure.
      // This app just makes the user redo their login since that is about
      // the only action a user could take.
      null;
    }
    saveAuthResult(newAuthResult);
  }

  return newAuthResult;
};
```

Modify `getAuthResult()` to obtain the auth result from the vault:

```typescript
const getAuthResult = async (): Promise<AuthResult | undefined> => {
  let authResult = await getSession();
  if (authResult && (await AuthConnect.isAccessTokenExpired(authResult))) {
    authResult = await refreshAuth(authResult);
  }
  return authResult;
};
```

Finally, modify `login()` and `logout()` to both save the results of the operation accordingly:

```typescript
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
```

You should now be able to refresh the app and have a persistent session.

## Guard the Routes

Let's pretend that Tab2Page and Tab3Page had super secret information that only logged in users could see (they don't, of course, but we can pretend). We would not want users getting there if they were not currently authenticated.

We can use our `isAuthenticated()` function to build a guard for those routes.

Open `src/router/index.ts`. At the top of the file, import `useAuth`.

```typescript
import useAuth from '@/composables/auth';

const { isAuthenticated } = useAuth();
```

Then add some metadata to the `tab2` and `tab3` routes to indicate that they require authentication:

```typescript
      {
        path: 'tab2',
        component: () => import('@/views/Tab2.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3.vue'),
        meta: { requiresAuth: true },
      },
```

Create a guard function (you _will_ need to add more import statements):

```typescript
const checkAuthStatus = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (to.matched.some((r) => r.meta.requiresAuth)) {
    if (!(await isAuthenticated())) {
      return next('/');
    }
  }
  next();
};
```

Finally, after the `router` is created, but before it is exported, add the guard:

```typescript
router.beforeEach(checkAuthStatus);
```

Now if you are not logged in and try to click on tabs 2 or 3, the application will not navigate and you will stay on tab 1. Furthermore, if you try to manually load `http://localhost:8100/tabs/tab2` (or `tab3`), you will be redirected to `tab1`.

## Conclusion

At this point, you should have a good idea of how Auth Connect and Identity Vault work together to provide a complete and secure authentication solution. There is still more functionality that can be implemented. Be sure to check out our other documentation and demos to see how to expand on this to offer expanded functionality such as Biometric based authentication.

- <a href="https://ionic.io/docs/auth-connect" target="_blank">Auth Connect</a>
- <a href="https://ionic.io/docs/identity-vault" target="_blank">Identity Vault</a> - check out its <a href="https://ionic.io/docs/identity-vault/getting-started-vue" target="_blank">Getting Started guide</a> as well.
- <a href="https://github.com/ionic-team/tea-taster-vue/tree/feature/auth-connect" target="_blank">Tea Taster with Auth Connect and Identity Vault</a>
