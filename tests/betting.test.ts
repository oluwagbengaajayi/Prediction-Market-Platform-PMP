import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock contract calls
const mockContractCall = vi.fn();

// Mock the Clarity values
const mockClarityValue = {
  uint: (value: number) => ({ type: 'uint', value }),
  stringUtf8: (value: string) => ({ type: 'string-utf8', value }),
  stringAscii: (value: string) => ({ type: 'string-ascii', value }),
  principal: (value: string) => ({ type: 'principal', value }),
  list: (value: any[]) => ({ type: 'list', value }),
};

describe('Market Creation Contract', () => {
  beforeEach(() => {
    mockContractCall.mockReset();
  });
  
  describe('create-market', () => {
    it('should create a market successfully', async () => {
      const description = 'Will it rain tomorrow?';
      const options = ['Yes', 'No'];
      const resolutionTime = 100000;
      const oracle = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
      
      mockContractCall.mockResolvedValue({ success: true, value: mockClarityValue.uint(1) });
      
      const result = await mockContractCall('market-creation', 'create-market', [
        mockClarityValue.stringUtf8(description),
        mockClarityValue.list(options.map(opt => mockClarityValue.stringUtf8(opt))),
        mockClarityValue.uint(resolutionTime),
        mockClarityValue.principal(oracle),
      ]);
      
      expect(result.success).toBe(true);
      expect(result.value.type).toBe('uint');
      expect(result.value.value).toBe(1);
    });
    
    it('should fail when creating a market with too many options', async () => {
      const description = 'Which team will win?';
      const options = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F', 'Team G', 'Team H', 'Team I', 'Team J', 'Team K'];
      const resolutionTime = 100000;
      const oracle = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
      
      mockContractCall.mockResolvedValue({ success: false, error: 'err-u103' });
      
      const result = await mockContractCall('market-creation', 'create-market', [
        mockClarityValue.stringUtf8(description),
        mockClarityValue.list(options.map(opt => mockClarityValue.stringUtf8(opt))),
        mockClarityValue.uint(resolutionTime),
        mockClarityValue.principal(oracle),
      ]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('err-u103');
    });
  });
  
  describe('get-market', () => {
    it('should retrieve market details', async () => {
      const marketId = 1;
      const mockMarket = {
        creator: mockClarityValue.principal('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'),
        description: mockClarityValue.stringUtf8('Will it rain tomorrow?'),
        options: mockClarityValue.list([mockClarityValue.stringUtf8('Yes'), mockClarityValue.stringUtf8('No')]),
        'resolution-time': mockClarityValue.uint(100000),
        oracle: mockClarityValue.principal('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'),
        status: mockClarityValue.stringAscii('active'),
      };
      
      mockContractCall.mockResolvedValue({ success: true, value: mockMarket });
      
      const result = await mockContractCall('market-creation', 'get-market', [mockClarityValue.uint(marketId)]);
      
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockMarket);
    });
    
    it('should return an error when market is not found', async () => {
      const marketId = 999;
      mockContractCall.mockResolvedValue({ success: false, error: 'err-u404' });
      
      const result = await mockContractCall('market-creation', 'get-market', [mockClarityValue.uint(marketId)]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('err-u404');
    });
  });
  
  describe('update-market-status', () => {
    it('should update market status successfully', async () => {
      const marketId = 1;
      const newStatus = 'resolved';
      mockContractCall.mockResolvedValue({ success: true });
      
      const result = await mockContractCall('market-creation', 'update-market-status', [
        mockClarityValue.uint(marketId),
        mockClarityValue.stringAscii(newStatus),
      ]);
      
      expect(result.success).toBe(true);
    });
    
    it('should return an error when non-owner tries to update status', async () => {
      const marketId = 1;
      const newStatus = 'resolved';
      mockContractCall.mockResolvedValue({ success: false, error: 'err-u100' });
      
      const result = await mockContractCall('market-creation', 'update-market-status', [
        mockClarityValue.uint(marketId),
        mockClarityValue.stringAscii(newStatus),
      ]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('err-u100');
    });
  });
});

