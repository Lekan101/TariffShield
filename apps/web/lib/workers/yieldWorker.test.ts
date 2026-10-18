import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { projectYield } from './yieldWorker';
import type { YieldProjectionRequest } from './yieldWorker.types';

const input = (overrides: Partial<YieldProjectionRequest> = {}): YieldProjectionRequest => ({
  currentBalanceStroops: '1000000000',
  monthlyTopUpStroops: '100000000',
  months: 2,
  annualYieldBps: 1200,
  ...overrides,
});

describe('projectYield', () => {
  it('applies interest before the recurring top-up and excludes top-up principal from yield', () => {
    const result = projectYield(input());
    assert.deepEqual(result.monthly.map((entry) => entry.balanceStroops), ['1110000000', '1121100000']);
    assert.equal(result.totalYieldStroops, '21100000');
  });

  it('returns the requested number of one-based monthly numeric-string balances', () => {
    const result = projectYield(input({ months: 12 }));
    assert.equal(result.monthly.length, 12);
    assert.equal(result.monthly[0].month, 1);
    assert.equal(result.monthly[11].month, 12);
    for (const entry of result.monthly) assert.doesNotThrow(() => BigInt(entry.balanceStroops));
    assert.equal(result.monthly.at(-1)?.balanceStroops, result.projectedBalanceStroops);
  });
});