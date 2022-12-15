import { BrowserVault, IdentityVaultConfig, Vault } from '@ionic-enterprise/identity-vault';
import { isPlatform } from '@ionic/vue';

export default () => {
  const createVault = (config: IdentityVaultConfig): Vault | BrowserVault =>
    isPlatform('hybrid') ? new Vault(config) : new BrowserVault(config);

  return { createVault };
};
