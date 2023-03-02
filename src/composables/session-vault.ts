import { AuthResult } from '@ionic-enterprise/auth';
import { DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import { useVaultFactory } from './vault-factory';

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

const clearSessionVault = (): Promise<void> => {
  return vault.clear();
};

const getSession = (): Promise<AuthResult | null> => {
  return vault.getValue<AuthResult>(key);
};

const setSession = (value: AuthResult): Promise<void> => {
  return vault.setValue(key, value);
};

export const useSessionVault = () => ({
  clearSessionVault,
  getSession,
  setSession,
});
