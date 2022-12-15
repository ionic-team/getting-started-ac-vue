import useVault from '@/composables/vault';
import { IonicAuthOptions } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

export default () => {
  const { vault } = useVault();
  const isNative = isPlatform('hybrid');

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
    androidToolbarColor: isNative ? '#337ab7' : undefined,
    tokenStorageProvider: vault,
  };

  return { config };
};
