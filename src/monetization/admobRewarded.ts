import mobileAds, {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { resolveRewardedUnitId } from './adsConfig';
import type { RewardedAdProvider, RewardedAdResult } from './providers';

let sdkReady: Promise<boolean> | null = null;

async function ensureAdsSdk(): Promise<boolean> {
  if (!sdkReady) {
    sdkReady = (async () => {
      try {
        await mobileAds().initialize();
        return true;
      } catch (error) {
        console.warn('[admob] initialize failed', error);
        return false;
      }
    })();
  }
  return sdkReady;
}

/**
 * Native rewarded ads (AdMob). Uses Google TestIds until production unit IDs
 * are set via EXPO_PUBLIC_ADMOB_*_REWARDED_UNIT_ID.
 */
export class AdMobRewardedAdProvider implements RewardedAdProvider {
  readonly mode = 'native' as const;

  async show(): Promise<RewardedAdResult> {
    const ready = await ensureAdsSdk();
    if (!ready) return 'unavailable';

    const unitId = resolveRewardedUnitId(TestIds.REWARDED);
    const rewarded = RewardedAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    return new Promise<RewardedAdResult>((resolve) => {
      let settled = false;
      let earned = false;
      const finish = (result: RewardedAdResult) => {
        if (settled) return;
        settled = true;
        unsubscribe();
        resolve(result);
      };

      const unsubLoaded = rewarded.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          rewarded.show().catch((error) => {
            console.warn('[admob] show failed', error);
            finish('failed');
          });
        },
      );

      const unsubEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earned = true;
        },
      );

      const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        finish(earned ? 'completed' : 'cancelled');
      });

      const unsubError = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
        console.warn('[admob] load/show error', error);
        finish('failed');
      });

      const unsubscribe = () => {
        unsubLoaded();
        unsubEarned();
        unsubClosed();
        unsubError();
      };

      try {
        rewarded.load();
      } catch (error) {
        console.warn('[admob] load threw', error);
        finish('unavailable');
      }
    });
  }
}

export async function warmUpAdMob(): Promise<void> {
  try {
    await ensureAdsSdk();
  } catch (error) {
    console.warn('[admob] warm-up skipped', error);
  }
}
