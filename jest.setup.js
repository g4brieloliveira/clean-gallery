jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-purchases', () => {
  const LOG_LEVEL = { DEBUG: 'DEBUG', INFO: 'INFO', VERBOSE: 'VERBOSE' };
  const PURCHASES_ERROR_CODE = { NETWORK_ERROR: 'NETWORK_ERROR' };
  return {
    __esModule: true,
    default: {
      setLogLevel: jest.fn(),
      configure: jest.fn(async () => undefined),
      getCustomerInfo: jest.fn(async () => ({
        entitlements: { active: {}, all: {}, verification: 'NOT_REQUESTED' },
      })),
      restorePurchases: jest.fn(async () => ({
        entitlements: { active: {}, all: {}, verification: 'NOT_REQUESTED' },
      })),
      getOfferings: jest.fn(async () => ({ current: null })),
      addCustomerInfoUpdateListener: jest.fn(),
      removeCustomerInfoUpdateListener: jest.fn(() => true),
    },
    LOG_LEVEL,
    PURCHASES_ERROR_CODE,
  };
});

jest.mock('react-native-purchases-ui', () => {
  const PAYWALL_RESULT = {
    NOT_PRESENTED: 'NOT_PRESENTED',
    ERROR: 'ERROR',
    CANCELLED: 'CANCELLED',
    PURCHASED: 'PURCHASED',
    RESTORED: 'RESTORED',
  };
  return {
    __esModule: true,
    default: {
      presentPaywall: jest.fn(async () => PAYWALL_RESULT.CANCELLED),
      presentPaywallIfNeeded: jest.fn(async () => PAYWALL_RESULT.CANCELLED),
      presentCustomerCenter: jest.fn(async () => undefined),
    },
    PAYWALL_RESULT,
  };
});
