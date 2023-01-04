import { AuthResult } from '@ionic-enterprise/auth';
import { DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import useVaultFactory from './useVaultFactory';

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

const getSession = (): Promise<AuthResult | undefined> => {
  return vault.getValue(key) as Promise<AuthResult | undefined>;
};

const setSession = (value: AuthResult | undefined): Promise<void> => {
  return vault.setValue(key, value);
};

export default () => ({
  clearSessionVault,
  getSession,
  setSession,
});
