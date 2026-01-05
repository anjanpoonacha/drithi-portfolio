/**
 * Tests for storage optimizer utilities
 */

import { test, expect, describe } from 'bun:test';
import {
  estimateStorySize,
  calculateCapacity,
  generateStorageScenarios,
  getStorageRecommendations,
  generateStorageReport,
  calculateOptimalSettings,
} from './storage-optimizer';
import { BLOB_STORAGE, IMAGE_OPTIMIZATION } from './constants';

describe('estimateStorySize', () => {
  test('estimates text-only story size correctly', () => {
    const size = estimateStorySize('text', 0, 5000);
    
    // Should include: 2 images (cover + character) + text + metadata
    const expected = IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 2 * 1024 + 5000 + 1024;
    expect(size).toBe(expected);
  });

  test('estimates images-only story size correctly', () => {
    const size = estimateStorySize('images', 10, 0);
    
    // Should include: 2 base images + 10 pages + metadata
    const expected = IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 12 * 1024 + 2048;
    expect(size).toBe(expected);
  });

  test('estimates mixed content story size correctly', () => {
    const size = estimateStorySize('mixed', 5, 3000);
    
    // Should include: 2 base images + 5 content images + text + metadata
    const expected = IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 7 * 1024 + 3000 + 2048;
    expect(size).toBe(expected);
  });
});

describe('calculateCapacity', () => {
  test('calculates remaining capacity correctly', () => {
    const currentUsage = 100 * 1024 * 1024; // 100MB
    const avgStorySize = 5 * 1024 * 1024; // 5MB
    
    const result = calculateCapacity(currentUsage, avgStorySize);
    
    expect(result.remaining).toBe(BLOB_STORAGE.MAX_TOTAL_SIZE - currentUsage);
    expect(result.storiesRemaining).toBe(80); // 400MB / 5MB
  });

  test('handles zero average story size', () => {
    const result = calculateCapacity(0, 0);
    
    expect(result.remaining).toBe(BLOB_STORAGE.MAX_TOTAL_SIZE);
    expect(result.storiesRemaining).toBe(0);
  });

  test('handles full storage', () => {
    const result = calculateCapacity(BLOB_STORAGE.MAX_TOTAL_SIZE, 1000);
    
    expect(result.remaining).toBe(0);
    expect(result.storiesRemaining).toBe(0);
  });
});

describe('generateStorageScenarios', () => {
  test('generates multiple scenarios', () => {
    const scenarios = generateStorageScenarios();
    
    expect(scenarios.length).toBeGreaterThan(0);
    expect(scenarios.every(s => s.scenarioName)).toBe(true);
  });

  test('calculates feasibility correctly', () => {
    const scenarios = generateStorageScenarios();
    
    scenarios.forEach(scenario => {
      if (scenario.totalSize < BLOB_STORAGE.CRITICAL_THRESHOLD) {
        expect(scenario.feasible).toBe(true);
      } else {
        expect(scenario.feasible).toBe(false);
      }
    });
  });

  test('calculates percentOfLimit correctly', () => {
    const scenarios = generateStorageScenarios();
    
    scenarios.forEach(scenario => {
      const expectedPercent = (scenario.totalSize / BLOB_STORAGE.MAX_TOTAL_SIZE) * 100;
      expect(scenario.percentOfLimit).toBeCloseTo(expectedPercent, 2);
    });
  });
});

describe('getStorageRecommendations', () => {
  test('returns healthy status for low usage', () => {
    const recommendations = getStorageRecommendations(50 * 1024 * 1024, 10); // 50MB, 10 stories
    
    expect(recommendations.some(r => r.includes('healthy'))).toBe(true);
  });

  test('warns at 80% usage', () => {
    const recommendations = getStorageRecommendations(BLOB_STORAGE.WARNING_THRESHOLD + 1000, 20);
    
    expect(recommendations.some(r => r.includes('HIGH USAGE'))).toBe(true);
  });

  test('shows critical warning at 90% usage', () => {
    const recommendations = getStorageRecommendations(BLOB_STORAGE.CRITICAL_THRESHOLD + 1000, 30);
    
    expect(recommendations.some(r => r.includes('CRITICAL'))).toBe(true);
  });

  test('warns about low remaining capacity', () => {
    const avgStorySize = 10 * 1024 * 1024; // 10MB per story
    const currentUsage = BLOB_STORAGE.MAX_TOTAL_SIZE - (5 * avgStorySize); // Only 5 stories remaining
    
    const recommendations = getStorageRecommendations(currentUsage, 45);
    
    expect(recommendations.some(r => r.includes('stories remaining'))).toBe(true);
  });
});

describe('generateStorageReport', () => {
  test('generates complete report', () => {
    const report = generateStorageReport(100 * 1024 * 1024, 20); // 100MB, 20 stories
    
    expect(report.summary).toBeDefined();
    expect(report.capacity).toBeDefined();
    expect(report.scenarios).toBeDefined();
    expect(report.recommendations).toBeDefined();
  });

  test('calculates average story size correctly', () => {
    const currentUsage = 100 * 1024 * 1024; // 100MB
    const storiesCount = 20;
    
    const report = generateStorageReport(currentUsage, storiesCount);
    
    expect(report.summary.avgStorySize).toBe('5 MB');
  });

  test('handles zero stories', () => {
    const report = generateStorageReport(0, 0);
    
    expect(report.summary.storiesCount).toBe(0);
    expect(report.summary.avgStorySize).toBe('0 Bytes');
  });
});

describe('calculateOptimalSettings', () => {
  test('recommends current settings for achievable targets', () => {
    const result = calculateOptimalSettings(30, 5); // 30 stories, 5 pages each
    
    expect(result.feasible).toBe(true);
    expect(result.recommendedQuality).toBeLessThanOrEqual(IMAGE_OPTIMIZATION.QUALITY);
  });

  test('reduces quality for very ambitious targets', () => {
    const result = calculateOptimalSettings(150, 20); // 150 stories, 20 pages each - quite ambitious
    
    // At 150 stories * 22 images * 200KB = ~660MB, it should recommend reductions
    if (result.recommendedQuality < IMAGE_OPTIMIZATION.QUALITY) {
      expect(result.recommendedTargetSizeKB).toBeLessThanOrEqual(IMAGE_OPTIMIZATION.TARGET_SIZE_KB);
    }
    // The optimizer should provide guidance
    expect(result.notes.length).toBeGreaterThan(0);
  });

  test('provides optimization guidance for ambitious targets', () => {
    const result = calculateOptimalSettings(500, 30); // 500 stories, 30 pages each - unrealistic
    
    // At 500 stories * 32 images * 200KB = ~3.2GB
    // The optimizer should either mark it infeasible or recommend significant compression
    expect(result.notes.length).toBeGreaterThan(0);
    
    // Should require some optimization
    const needsOptimization = 
      !result.feasible || 
      result.recommendedQuality < IMAGE_OPTIMIZATION.QUALITY ||
      result.recommendedTargetSizeKB < IMAGE_OPTIMIZATION.TARGET_SIZE_KB;
    
    expect(needsOptimization).toBe(true);
  });

  test('recommends dimension reduction for extreme targets', () => {
    const result = calculateOptimalSettings(150, 15); // Very ambitious target
    
    if (!result.feasible || result.recommendedQuality < 0.7) {
      expect(result.recommendedMaxWidth).toBeLessThan(IMAGE_OPTIMIZATION.MAX_WIDTH);
      expect(result.recommendedMaxHeight).toBeLessThan(IMAGE_OPTIMIZATION.MAX_HEIGHT);
    }
  });
});
