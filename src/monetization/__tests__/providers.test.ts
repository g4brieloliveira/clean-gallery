import {
  requestRewardedReviewBonus,
  type RewardedAdProvider,
  type RewardedAdResult,
} from '../providers';

function providerReturning(result: RewardedAdResult): RewardedAdProvider {
  return {
    mode: 'fake',
    show: async () => result,
  };
}

describe('rewarded ad orchestration', () => {
  it('credits only after a completed reward callback', async () => {
    const grant = jest.fn(() => true);
    const result = await requestRewardedReviewBonus(
      providerReturning('completed'),
      grant,
    );
    expect(result).toEqual({ adResult: 'completed', granted: true });
    expect(grant).toHaveBeenCalledTimes(1);
  });

  it.each(['cancelled', 'unavailable', 'failed'] as const)(
    'does not credit when the ad is %s',
    async (adResult) => {
      const grant = jest.fn(() => true);
      const result = await requestRewardedReviewBonus(
        providerReturning(adResult),
        grant,
      );
      expect(result).toEqual({ adResult, granted: false });
      expect(grant).not.toHaveBeenCalled();
    },
  );
});
