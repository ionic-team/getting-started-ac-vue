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

You can now install Auth Connect:

```bash
npm install @ionic-enterprise/auth-connect
```

## Configure Auth Connect

## Conclusion

At this point, you should have a good idea of how Auth Connect and Identity Vault work together to provide a complete and secure authentication solution. There is still more functionality that can be implemented. Be sure to check out our other documentation to determine how to facilitate specific areas of functionality within your application.
