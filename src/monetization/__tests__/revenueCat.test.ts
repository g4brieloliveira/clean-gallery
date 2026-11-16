import type { CustomerInfo } from 'react-native-purchases';
import { PRO_ENTITLEMENT_ID } from '../config';
import { isPremiumFromCustomerInfo, premiumStatusFromCustomerInfo } from '../revenueCat';

function infoWithEntitlements(
  active: Record<string, object>,
): CustomerInfo {
  return {
    entitlements: {
      active,
      all: active,
      verification: 'NOT_REQUESTED',
    },
  } as unknown as CustomerInfo;
}

describe('RevenueCat entitlement mapping', () => {
  it('detects the Kleen Pro entitlement', () => {
    const info = infoWithEntitlements({
      [PRO_ENTITLEMENT_ID]: { identifier: PRO_ENTITLEMENT_ID },
    });
    expect(isPremiumFromCustomerInfo(info)).toBe(true);
    expect(premiumStatusFromCustomerInfo(info)).toBe('active');
  });

  it('treats missing entitlement as inactive', () => {
    const info = infoWithEntitlements({});
    expect(isPremiumFromCustomerInfo(info)).toBe(false);
    expect(premiumStatusFromCustomerInfo(info)).toBe('inactive');
  });
});
