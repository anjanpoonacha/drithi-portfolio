# Storage Optimization Quick Reference

## TL;DR

**Free tier (500MB) is MORE than enough!** Current usage: 0.56%

Can comfortably fit **100-400 stories** depending on type. No optimization needed.

---

## Quick Capacity Chart

| Story Type | Stories | Storage | % Used |
|------------|---------|---------|--------|
| Text-only | 100 | 40 MB | 8% |
| Short handwritten (3 pages) | 75 | 73 MB | 15% |
| Medium handwritten (5 pages) | 50 | 69 MB | 14% |
| Medium handwritten (10 pages) | 30 | 70 MB | 14% |
| Long handwritten (15 pages) | 20 | 66 MB | 13% |
| **Balanced mix** | **120** | **155 MB** | **31%** |

---

## Current Settings (Optimal)

```typescript
TARGET_SIZE_KB: 200    // ✅ Keep
MAX_WIDTH: 1200        // ✅ Keep
MAX_HEIGHT: 1600       // ✅ Keep
QUALITY: 0.85          // ✅ Keep
```

**No changes recommended.**

---

## Usage Functions

```typescript
import {
  estimateStorySize,
  calculateCapacity,
  generateStorageReport
} from '@/lib/storage-optimizer';

// Estimate a story
const size = estimateStorySize('images', 10, 0);

// Check capacity
const capacity = calculateCapacity(currentUsage, avgSize);

// Full report
const report = generateStorageReport(usage, count);
```

---

## API Endpoints

```bash
# Current stats
GET /api/admin/storage-stats

# Detailed report
GET /api/admin/storage-report
```

---

## Monitoring Thresholds

```
0-50%   ✅ Perfect
50-70%  ⚡ Monitor monthly
70-80%  ⚠️  Review quarterly
80-90%  🚨 Optimize now
90%+    🛑 Critical
```

**Current: 0.56% - Perfect!**

---

## When to Optimize

**DON'T optimize yet!** Current settings are perfect.

**Consider optimizing when:**
- Usage exceeds 50% (250 MB)
- Planning 200+ handwritten stories
- Image quality requirements change

---

## Maximum Capacities

```
3-page stories:   459 max
5-page stories:   328 max
10-page stories:  191 max
15-page stories:  135 max
20-page stories:  104 max
```

---

## Documentation

- Full guide: `/docs/FREE_TIER_OPTIMIZATION.md`
- Analysis: `/docs/STORAGE_ANALYSIS_REPORT.md`
- This file: `/docs/STORAGE_QUICK_REFERENCE.md`

---

**Last Updated**: January 2026
