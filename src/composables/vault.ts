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
