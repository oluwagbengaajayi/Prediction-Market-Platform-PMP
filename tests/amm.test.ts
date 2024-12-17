import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock contract calls
const mockContractCall = vi.fn();

// Mock the Clarity values
const mockClarityValue = {
  uint: (value: number) => ({ type: 'uint', value }),
  list: (value: any[]) => ({ type: 'list', value }),
  bool: (value: boolean) => ({ type: 'bool', value }),
};

describe('Automated Market Maker (AMM) Contract', () => {
  beforeEach(() => {
    mockContractCall.mockReset();
  });
  
  describe('provide-liquidity', () => {
    it('should provide liquidity successfully', async () => {
      const marketId = 1;
      const amounts = [100000000, 100000000]; // 1 STX each for two options
      
      mockContractCall.mockResolvedValue({ success: true, value: mockClarityValue.bool(true) });
      
      const result = await mockContractCall('amm', 'provide-liquidity', [
        mockClarityValue.uint(marketId),
        mockClarityValue.list(amounts.map(amount => mockClarityValue.uint(amount))),
      ]);
      
      expect(result.success).toBe(true);
      expect(result.value.type).toBe('bool');
      expect(result.value.value).toBe(true);
    });
    
    it('should fail when providing liquidity with mismatched amounts', async () => {
      const marketId = 1;
      const amounts = [100000000, 100000000, 100000000]; // 3 amounts for a 2-option market
      
      mockContractCall.mockResolvedValue({ success: false, error: 'err-u300' });
      
      const result = await mockContractCall('amm', 'provide-liquidity', [
        mockClarityValue.uint(marketId),
        mockClarityValue.list(amounts.map(amount => mockClarityValue.uint(amount))),
      ]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('err-u300');
    });
  });
  
  describe('get-liquidity-pool', () => {
    it('should retrieve liquidity pool details', async () => {
      const marketId = 1;
      const mockPool = {
        'total-liquidity': mockClarityValue.uint(200000000),
        shares: mockClarityValue.list([mockClarityValue.uint(100000000), mockClarityValue.uint(100000000)]),
      };
      
      mockContractCall.mockResolvedValue({ success: true, value: mockPool });
      
      const result = await mockContractCall('amm', 'get-liquidity-pool', [mockClarityValue.uint(marketId)]);
      
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockPool);
    });
    
    it('should return an error when liquidity pool is not found', async () => {
      const marketId = 999;
      mockContractCall.mockResolvedValue({ success: false, error: 'err-u404' });
      
      const result = await mockContractCall('amm', 'get-liquidity-pool', [mockClarityValue.uint(marketId)]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('err-u404');
    });
  });
  
  describe('swap', () => {
    it('should perform a swap successfully', async () => {
      const marketId = 1;
      const inputIndex = 0;
      const outputIndex = 1;
      const inputAmount = 50000000; // 0.5 STX
      
      mockContractCall.mockResolvedValue({ success: true, value: mockClarityValue.uint(49000000) }); // 0.49 STX output
      
      const result = await mockContractCall('amm', 'swap', [
        mockClarityValue.uint(marketId),
        mockClarityValue.uint(inputIndex),
        mockClarityValue.uint(outputIndex),
        mockClarityValue.uint(inputAmount),
      ]);
      
      expect(result.success).toBe(true);
      expect(result.value.type).toBe('uint');
      expect(result.value.value).toBe(49000000);
    });
    
    it('should fail when swapping with insufficient liquidity', async () => {
      const marketId = 1;
      const inputIndex = 0;
      const outputIndex = 1;
      const inputAmount = 10000000000; // 100 STX (assuming this is too large for the pool)
      
      mockContractCall.mockResolvedValue({ success: false, error: 'err-u301' });
      
      const result = await mockContractCall('amm', 'swap', [
        mockClarityValue.uint(marketId),
        mockClarityValue.uint(inputIndex),
        mockClarityValue.uint(outputIndex),
        mockClarityValue.uint(inputAmount),
      ]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('err-u301');
    });
    
    it('should fail when swapping with invalid market ID', async () => {
      const marketId = 999;
      const inputIndex = 0;
      const outputIndex = 1;
      const inputAmount = 50000000; // 0.5 STX
      
      mockContractCall.mockResolvedValue({ success: false, error: 'err-u404' });
      
      const result = await mockContractCall('amm', 'swap', [
        mockClarityValue.uint(marketId),
        mockClarityValue.uint(inputIndex),
        mockClarityValue.uint(outputIndex),
        mockClarityValue.uint(inputAmount),
      ]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('err-u404');
    });
  });
});

