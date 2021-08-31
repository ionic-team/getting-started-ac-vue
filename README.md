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

Finally, in order to ensure that a `cap copy` is run with each build, add it to the build script in the `package.json` file as such:

```JSON
  "scripts": {
    "build": "vue-cli-service build && cap copy",
    ...
  },
```

## Install Auth Connect

In order to install Auth Connect, you will need to use `ionic enterprise register` to register your product key. This will create a `.npmrc` file containing the product key.

If you have already performed that step for your production application, you can just copy the `.npmrc` file from your production project. Since this application is for learning purposes only, you don't need to obtain another key.

You can now install Auth Connect and sync the platforms:

```bash
npm install @ionic-enterprise/auth
ionic cap sync
```

## Configure Auth Connect

Our next step is to configure Auth Connect. Create a file named `src/use/auth-config.ts` and fill it with the following boilerplate content:

```typescript
import { IonicAuthOptions } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

export default () => {
  const isNative = isPlatform('hybrid');

  const config: IonicAuthOptions = {
    authConfig: '',
    clientID: '',
    discoveryUrl: '',
    scope: 'openid offline_access email profile',
    audience: '',
    redirectUri: isNative ? '' : '',
    logoutUrl: isNative ? '' : '',
    platform: isNative ? 'capacitor' : 'web',
    iosWebView: isNative ? 'private' : undefined,
    androidToolbarColor: isNative ? '#337ab7' : undefined,
  };

  return { config };
};
```

As you can see, there are several items that we need to fill in. Specifically: `authConfig`, `clientID`, `discoveryUrl`, `redirectUri`, and `logoutUrl`.

The `audience` value can remain blank as it is not used by Azure, but may be used by other providers such as Auth0.

Additionally, Azure requires a custom API scope that we will need to add to the `scope` parameter.

Obtaining this information likely takes a little coordination with whoever administers our backend services. In our case, we have a team that administers our Azure services and they have given us the following information:

- Application ID: `ed8cb65d-7bb2-4107-bc36-557fb680b994`
- Metadata Document URL: `https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/B2C_1_acdemo2/v2.0/.well-known/openid-configuration`
- Web Redirect (for development): `http://localhost:8100`
- Native Redirect (for development): `msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D`
- Custom API Scope: `https://dtjacdemo.onmicrosoft.com/ed8cb65d-7bb2-4107-bc36-557fb680b994/demo.read`

Translating that into our configuration object, we now have this:

```typescript
const config: IonicAuthOptions = {
  authConfig: 'azure',
  clientID: 'ed8cb65d-7bb2-4107-bc36-557fb680b994',
  discoveryUrl:
    'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/B2C_1_acdemo2/v2.0/.well-known/openid-configuration',
  scope:
    'openid offline_access email profile https://dtjacdemo.onmicrosoft.com/ed8cb65d-7bb2-4107-bc36-557fb680b994/demo.read',
  audience: '',
  redirectUri: isNative ? 'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D' : 'http://localhost:8100',
  logoutUrl: isNative ? 'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D' : 'http://localhost:8100',
  platform: isNative ? 'capacitor' : 'web',
  iosWebView: isNative ? 'private' : undefined,
  androidToolbarColor: isNative ? '#4424eb' : undefined,
};
```

The web redirect for development is on port `8100`. Vue uses port `8080` by default, so we will need to make a minor change to our `package.json` file as well:

```json
  "scripts": {
    "build": "vue-cli-service build && cap copy",
    "lint": "vue-cli-service lint",
    "serve": "vue-cli-service serve --port=8100",
    "test:unit": "vue-cli-service test:unit",
    "test:e2e": "vue-cli-service test:e2e"
  },
```

**Note:** you can use your own configuration for this tutorial as well. However, we suggest that you start with our configuration, get the application working, and then try your own configuration after that.

## Create the Auth Connect Service

Now that we have Auth Connect configured, let's instantiate an instance of it using our configuration.

Create a file named `src/use/auth.ts` with the following contents:

```typescript
import { IonicAuth } from '@ionic-enterprise/auth';
import useAuthConfig from './auth-config';

class AuthenticationService extends IonicAuth {
  constructor() {
    const { config } = useAuthConfig();
    super(config);
  }
}

const authService = new AuthenticationService();

export default () => {
  return {
    login: (): Promise<void> => authService.login(),
    logout: (): Promise<void> => authService.logout(),
  };
};
```

This creates an instance of Auth Connect using our configuration and exposes the two operations we would like to perform at this time: `login` and `logout`.

To test this out, we will replace the `ExploreContainer` with "Login" and "Logout" buttons in the `src/views/Tab1.vue` file. :

```html
<ion-button @click="login">Login</ion-button> <ion-button @click="logout">Logout</ion-button>
```

Within the `script` area, import the our `useAuth` and expose the `login` and `logout` functions:

```typescript
<script lang="ts">
import { IonButton, IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import useAuth from '@/use/auth';

export default {
  name: 'Tab1',
  components: { IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonPage },
  setup() {
    return {
      ...useAuth(),
    };
  },
};
</script>
```

Test that with the following credentials:

- Email Address: `test@ionic.io`
- Password: `Ion54321`

You should be able to login and and logout successfully. Open the devtools and look in the `Application` tab. You should see keys being created when the user logs in and being removed when the user logs out.

## Configure the Native Projects

Build the application for a native device and try the login there as well. This currently behaves as follows:

1. Clicking "Login" takes you to the login page.
1. Entering the email and password and clicking "Sign in" does the sign in process (so far as we can tell).
1. Azure does not redirect back to the application once the login completes.

If you inspect the login page via the devtools, you will notice a message in the console similar to the this: `Navigation is unreachable: msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D?state=...`

The problem is that we need to let the native device know which application(s) are allowed to handle navigation to the `msauth://` scheme. To do this, we need to modify our `AndroidManifest.xml` and `Info.plist` files <a href="https://ionic.io/docs/auth-connect/install" target="_blank">as noted here</a>. Use `msauth` in place of `$AUTH_URL_SCHEME`.

## Determine Current Auth Status

Right now, the user is shown both the login and logout buttons, and you don't really know if the user is logged in or not. Let's change that.

Auth Connect includes a method called <a href="https://ionic.io/docs/auth-connect/classes/ionicauth#isauthenticated" target="_blank">`isAuthenticated()`</a>. This method resolves `true` if a valid access token exists, and `false` otherwise. If the current access token has expired, this method will attempt to refresh the token before determining if it should resolve `true` or `false`.

Let's add a line to our return value in `src/use/auth.ts`:

```typescript
export default () => {
  return {
    isAuthenticated: (): Promise<boolean> => authService.isAuthenticated(),
    login: (): Promise<void> => authService.login(),
    logout: (): Promise<void> => authService.logout(),
  };
};
```

We will use this in the Tab1 page to display only the Login or the Logout button, depending on the current login status. First, update the bindings on the buttons:

```html
<ion-button v-if="authenticated === false" @click="loginClicked">Login</ion-button>
<ion-button v-if="authenticated" @click="logoutClicked">Logout</ion-button>
```

Notice that we added the `v-if` conditions and also changed the `@click` event bindings. The reason for this is that our click logic is going to do a little more work than before.

What we want to do is:

- upon creating the page, check the current auth status
- after performing a login or logout operation, refresh the auth status

Here is one way to code all of that:

```typescript
  setup() {
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

    return {
      authenticated,
      loginClicked,
      logoutClicked,
    };
  },
```

Notice the `try ... catch` in `loginClicked()`. The `login()` will throw an error if the user fails to log in. Production applications should have some kind of handling here, but our sample can get away with simply logging the fact.

At this point, you should see the Login button if you are not logged in and the Logout button if you are. Furthermore, you should see the proper button after refreshing your browser or after successfully logging in or out.

## Guarding the Routes

Let's pretend that Tab2 and Tab3 had super secret information that only logged in users could see (they don't, of course, but we can pretend). We would not want users getting there if they were not currently authenticated.

We can use our newly exposed `isAuthenticated()` function to build a guard for those routes.

Open `src/router/index.ts`. At the top of the file, import `useAuth`.

```typescript
import useAuth from '@/use/auth';

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

```
router.beforeEach(checkAuthStatus);
```

Now if you are not logged in and try to click on tabs 2 or 3, the application will not navigate and you will stay on tab 1. Furthermore, if you try to manually load `http://localhost:8100/tabs/tab2` (or `tab3`), you will be redirected to `tab1`.

## Get the Tokens

We can now log in and out, but what about getting at the tokens that our OIDC provider gave us? There are a handful of methods available that get us wht we need:

- <a href="https://ionic.io/docs/auth-connect/classes/ionicauth#getaccesstoken" target="_blank">`getAccessToken()`</a>
- <a href="https://ionic.io/docs/auth-connect/classes/ionicauth#getidtoken" target="_blank">`getIdToken()`</a>
- <a href="https://ionic.io/docs/auth-connect/classes/ionicauth#getrefreshtoken" target="_blank">`getRefreshToken()`</a>

You can use these wherever you need to supply a specific token. For example, if you are accessing a backend API that requires you to include a bearer token (and you probably are if you are using Auth Connect), then you can expose the `getAccessToken()` method and <a href="https://github.com/ionic-team/tea-taster-vue/blob/feature/auth-connect/src/use/backend-api.ts#L15-L22" target="_blank">create in interceptor</a> that adds the token.

Since we don't have a backend API that will need the access token, let's instead modify `src/use/auth.ts` to grab the user's name from the ID token. Here is the code in context. Add the parts you need:

```typescript
// imports and whatnot up here...
...

export default () => {
  const getUserName = async (): Promise<string | undefined> => {
    const token = await authService.getIdToken();
    return token && token.name;
  };

  return {
    getUserName,
    isAuthenticated: (): Promise<boolean> => authService.isAuthenticated(),
    login: (): Promise<void> => authService.login(),
    logout: (): Promise<void> => authService.logout(),
  };
};
```

As a challenge to you, update the Tab1 page to show the current user's name when they are logged in.

## Use a Token Storage Provider

Up until now, we haven't really been worrying about where the tokens are being stored. By default, Auth Connect is just using localstorage. This has two disadvantages: it is not secure, and on mobile devices the OS can wipe out localstorage any time it feels like it needs a little extra space.

The default token storage provider is OK for development purposes, but it is not a good option for a production application. To rectify this, there are two solid options:

- Create your own service that conforms the the <a href="https://ionic.io/docs/auth-connect/interfaces/tokenstorageprovider" target="_blank">Token Storage Provider interface</a>.
- Or, use <a href="https://ionic.io/docs/identity-vault" target="_blank">Identity Vault</a>.

Using Identity Vault is the clear winner here in all categories: security, ease of use, and ease of maintenance.

As such, for our application we will install identity vault and use it in "secure storage" mode to store the tokens. The first step is to install the product and sync the platforms.

```bash
npm i @ionic-enterprise/identity-vault
ionic cap sync
```

Next we will create a factory that builds either the actual vault if we are on a device or a browser based "vault" that is suitable for development if we are in the browser.

```typescript
import { isPlatform } from '@ionic/vue';
import { BrowserVault, IdentityVaultConfig, Vault } from '@ionic-enterprise/identity-vault';

export default () => {
  const createVault = (config: IdentityVaultConfig): Vault | BrowserVault =>
    isPlatform('hybrid') ? new Vault(config) : new BrowserVault(config);

  return { createVault };
};
```

This provides us with a vault that is usable on our devices, or a <a href="https://ionic.io/docs/identity-vault/classes/browservault" target="_blank">fallback vault</a> that will allow us to keep using our browser-based development flow.

Now that we have a factory in place to build our vaults, let's instantiate a vault and include it in our Auth Connect configuration.

Create a file called `src/use/vault.ts` with the following contents:

```typescript
import { DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import useVaultFactory from './vault-factory';

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

export default () => ({ vault });
```

Then modify `src/use/auth-config.ts` to include the `tokenStorageProvider`:

```typescript
import { IonicAuthOptions } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
import useVault from '@/use/vault';

export default () => {
  const { vault } = useVault();
  const isNative = isPlatform('hybrid');

  const config: IonicAuthOptions = {
    ...
    tokenStorageProvider: vault,
  };

  return { config };
};
```

Now when you run the application on a device, the device's secure key storage mechanisms are used to store the key rather than `localstorage`. The browser is still using `localstorage`, but the browser implementation is just there for developer convenience.

## Conclusion

At this point, you should have a good idea of how Auth Connect and Identity Vault work together to provide a complete and secure authentication solution. There is still more functionality that can be implemented. Be sure to check out our other documentation and demos to see how to expand on this to offer expanded functionality such as Biometric based authentication.

- <a href="https://ionic.io/docs/auth-connect" target="_blank">Auth Connect</a>
- <a href="https://ionic.io/docs/identity-vault" target="_blank">Identity Vault</a> - check out its <a href="https://ionic.io/docs/identity-vault/getting-started-vue" target="_blank">Getting Started guide</a> as well.
- <a href="https://github.com/ionic-team/tea-taster-vue/tree/feature/auth-connect" target="_blank">Tea Taster with Auth Connect and Identity Vault</a>
