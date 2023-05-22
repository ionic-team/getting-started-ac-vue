import { IdentityVaultConfig } from '@ionic-enterprise/identity-vault';
import { vi } from 'vitest';

let onLockCallback: undefined | (() => Promise<void>);
let onUnlockCallback: undefined | (() => Promise<void>);

const mockVault = {
  config: undefined as IdentityVaultConfig | undefined,
  clear: vi.fn().mockResolvedValue(undefined),
  setValue: vi.fn().mockResolvedValue(undefined),
  getValue: vi.fn().mockResolvedValue(undefined),
  getKeys: vi.fn().mockResolvedValue([]),
  updateConfig: vi.fn().mockResolvedValue(undefined),
  isEmpty: vi.fn().mockResolvedValue(false),
  isLocked: vi.fn().mockResolvedValue(false),
  onLock: vi.fn().mockImplementation((cb: () => Promise<void>) => (onLockCallback = cb)),
  onPasscodeRequested: vi.fn().mockResolvedValue(undefined),
  setCustomPasscode: vi.fn(),
  onUnlock: vi.fn().mockImplementation((cb: () => Promise<void>) => (onUnlockCallback = cb)),
  lock: vi.fn().mockImplementation(() => {
    if (onLockCallback) {
      onLockCallback();
    }
  }),
  unlock: vi.fn().mockImplementation(() => {
    if (onUnlockCallback) {
      onUnlockCallback();
    }
  }),
};

export const useVaultFactory = vi.fn().mockReturnValue({
  createVault: vi.fn().mockImplementation((config: IdentityVaultConfig) => {
    mockVault.config = config;
    return mockVault;
  }),
});
