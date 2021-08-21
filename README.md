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
npm install @ionic-enterprise/auth-connect
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

## Conclusion

At this point, you should have a good idea of how Auth Connect and Identity Vault work together to provide a complete and secure authentication solution. There is still more functionality that can be implemented. Be sure to check out our other documentation to determine how to facilitate specific areas of functionality within your application.
