# Free Tier Optimization Guide

## Vercel Blob Storage - 500MB Free Tier

This guide helps you maximize the Vercel Blob Storage free tier (500MB) for storing Drithi's story images and content.

---

## Table of Contents

1. [Storage Limit Breakdown](#storage-limit-breakdown)
2. [Current Usage Analysis](#current-usage-analysis)
3. [Image Optimization Best Practices](#image-optimization-best-practices)
4. [Recommended Settings by Story Type](#recommended-settings-by-story-type)
5. [Storage Scenarios](#storage-scenarios)
6. [Monitoring Dashboard](#monitoring-dashboard)
7. [What to Do When Approaching Limits](#what-to-do-when-approaching-limits)
8. [Cost Comparison](#cost-comparison)

---

## Storage Limit Breakdown

### Free Tier Specifications
- **Total Storage**: 500 MB (524,288,000 bytes)
- **Warning Threshold**: 400 MB (80%)
- **Critical Threshold**: 450 MB (90%)
- **Max File Size**: 5 MB per file
- **Max Images per Story**: 50 images

### Thresholds
```
0-400 MB   (0-80%)   ✅ Safe Zone - Normal operation
400-450 MB (80-90%)  ⚠️  Warning Zone - Optimize existing content
450-500 MB (90-100%) 🚨 Critical Zone - Stop uploads, delete content
```

---

## Current Usage Analysis

### Existing Stories (7 total)

Based on the current 7 stories in `data/stories.json`:

**Story Types:**
- All text-based stories with 2 images each (cover + character)
- Average text length: ~1,500 words (7,500 characters)
- Average story size: ~425 KB per story

**Current Projections:**
```
7 stories × 425 KB = ~2.97 MB total
Percentage of 500 MB: ~0.6%
```

**Estimated Capacity:**
- At current rate: **~1,176 text-only stories** can fit in 500MB
- With 5-page handwritten stories: **~75 stories**
- With 10-page handwritten stories: **~35 stories**

---

## Image Optimization Best Practices

### Current Settings (lib/constants.ts)

```typescript
export const IMAGE_OPTIMIZATION = {
  TARGET_SIZE_KB: 200,      // Target 200KB per image
  MAX_WIDTH: 1200,          // Maximum 1200px width
  MAX_HEIGHT: 1600,         // Maximum 1600px height
  QUALITY: 0.85,            // 85% JPEG quality
}
```

### Optimization Strategy

#### 1. **Image Dimensions**
- **Current**: 1200×1600 px
- **Good for**: High-quality display on tablets/desktops
- **To reduce**: Use 1000×1333 px (saves ~30%)
- **Aggressive**: Use 800×1066 px (saves ~50%)

#### 2. **JPEG Quality**
- **Current**: 85% quality
- **Sweet spot**: 80-85% (imperceptible quality loss)
- **To reduce**: 75% (slight quality loss, 15-20% size reduction)
- **Minimum**: 70% (noticeable but acceptable)

#### 3. **File Format**
- **Best**: JPEG for photographs and handwritten content
- **Avoid**: PNG (3-5× larger for photos)
- **Consider**: WebP (20-30% smaller, but requires conversion)

#### 4. **Pre-Processing**
- Remove metadata (EXIF data)
- Use proper color space (sRGB)
- Apply sharpening before compression
- Crop unnecessary whitespace

### Compression Workflow

The app automatically compresses images on upload using `lib/image-optimizer.ts`:

1. **Resize** to max dimensions (1200×1600)
2. **Convert** to JPEG format
3. **Compress** to target quality (85%)
4. **Target** 200KB per image

---

## Recommended Settings by Story Type

### 1. Text-Only Stories (Current)

**Profile:**
- Cover image: 200 KB
- Character photo: 200 KB
- Text content: ~7.5 KB
- Total: ~410 KB per story

**Capacity:** ~1,176 stories in 500 MB

**Settings:**
```typescript
TARGET_SIZE_KB: 200
MAX_WIDTH: 1200
MAX_HEIGHT: 1600
QUALITY: 0.85
```

---

### 2. Short Handwritten Stories (3-5 pages)

**Profile:**
- Cover + character: 400 KB
- Pages: 3-5 images × 200 KB = 600-1000 KB
- Total: ~1-1.4 MB per story

**Capacity:** ~400-500 stories in 500 MB

**Recommended Settings:**
```typescript
TARGET_SIZE_KB: 180  // Slightly reduce target
MAX_WIDTH: 1200
MAX_HEIGHT: 1600
QUALITY: 0.82
```

**Optimization Tips:**
- Ensure even lighting when scanning
- Use high-contrast settings
- Crop margins tightly

---

### 3. Medium Handwritten Stories (5-10 pages)

**Profile:**
- Cover + character: 400 KB
- Pages: 5-10 images × 200 KB = 1-2 MB
- Total: ~1.4-2.4 MB per story

**Capacity:** ~208-357 stories in 500 MB

**Recommended Settings:**
```typescript
TARGET_SIZE_KB: 160
MAX_WIDTH: 1100
MAX_HEIGHT: 1466
QUALITY: 0.80
```

**Optimization Tips:**
- Consider black & white mode (saves 20-30%)
- Use "document" mode on scanner/phone
- Increase contrast to reduce file size

---

### 4. Long Handwritten Stories (10-20 pages)

**Profile:**
- Cover + character: 400 KB
- Pages: 10-20 images × 200 KB = 2-4 MB
- Total: ~2.4-4.4 MB per story

**Capacity:** ~113-208 stories in 500 MB

**Recommended Settings:**
```typescript
TARGET_SIZE_KB: 140
MAX_WIDTH: 1000
MAX_HEIGHT: 1333
QUALITY: 0.78
```

**Optimization Tips:**
- Strongly consider black & white
- Use dedicated scanning app (e.g., Adobe Scan)
- Split very long stories into parts

---

### 5. Mixed Content (Text + Images)

**Profile:**
- Cover + character: 400 KB
- Content images: 3-5 × 200 KB = 600-1000 KB
- Text: ~10 KB
- Total: ~1-1.4 MB per story

**Capacity:** ~357-500 stories in 500 MB

**Recommended Settings:**
```typescript
TARGET_SIZE_KB: 180
MAX_WIDTH: 1200
MAX_HEIGHT: 1600
QUALITY: 0.82
```

---

## Storage Scenarios

Use the storage optimizer to calculate scenarios:

```typescript
import { generateStorageScenarios } from '@/lib/storage-optimizer';

const scenarios = generateStorageScenarios();
```

### Scenario Analysis

| Scenario | Stories | Avg Images | Total Size | % of 500MB | Feasible |
|----------|---------|------------|------------|------------|----------|
| **Text-only (5000 words)** | 50 | 2 | ~21 MB | 4.2% | ✅ Yes |
| **Text-only (3000 words)** | 100 | 2 | ~41 MB | 8.2% | ✅ Yes |
| **Handwritten (3 pages)** | 75 | 5 | ~75 MB | 15% | ✅ Yes |
| **Handwritten (5 pages)** | 50 | 7 | ~70 MB | 14% | ✅ Yes |
| **Handwritten (10 pages)** | 20 | 12 | ~48 MB | 9.6% | ✅ Yes |
| **Mixed (3 img + text)** | 40 | 5 | ~40 MB | 8% | ✅ Yes |
| **Heavy (20 pages)** | 10 | 22 | ~44 MB | 8.8% | ✅ Yes |

**Key Insights:**
- **Text-only stories** are extremely efficient
- **50 stories with 5 handwritten pages** each fits comfortably
- **Mix of content types** provides best flexibility
- Free tier is **more than sufficient** for typical use

---

## Monitoring Dashboard

### Admin Dashboard Features

Navigate to `/admin/settings` to view:

1. **Current Usage**
   - Total storage used
   - Percentage of limit
   - Number of files
   - Number of stories

2. **Real-Time Metrics**
   - Available space remaining
   - Stories remaining at current average
   - Upload status (allowed/blocked)

3. **Recommendations**
   - Optimization suggestions
   - Warning alerts
   - Action items

### API Endpoints

#### Storage Stats
```bash
GET /api/admin/storage-stats
```

Response:
```json
{
  "totalSize": 104857600,
  "totalSizeFormatted": "100 MB",
  "percentUsed": 20,
  "fileCount": 250,
  "storiesCount": 35,
  "canUpload": true
}
```

#### Storage Report
```bash
GET /api/admin/storage-report
```

Response:
```json
{
  "summary": {
    "totalUsed": "100 MB",
    "percentUsed": 20,
    "storiesCount": 35,
    "avgStorySize": "2.86 MB"
  },
  "capacity": {
    "remaining": "400 MB",
    "storiesRemaining": 140
  },
  "scenarios": [...],
  "recommendations": [...]
}
```

---

## What to Do When Approaching Limits

### At 80% Usage (400 MB)

**Actions:**

1. **Review and Optimize**
   ```bash
   # Run storage report
   curl https://your-app.vercel.app/api/admin/storage-report
   ```

2. **Re-compress Large Images**
   - Download large images
   - Re-upload with lower quality settings
   - Delete old versions

3. **Remove Unused Assets**
   - Check for duplicate images
   - Remove test uploads
   - Archive old stories if not needed

4. **Adjust Settings**
   ```typescript
   // In lib/constants.ts
   TARGET_SIZE_KB: 150  // Reduce from 200
   QUALITY: 0.78        // Reduce from 0.85
   ```

### At 90% Usage (450 MB)

**Immediate Actions:**

1. **Stop New Uploads** (automatic)
2. **Delete Non-Essential Content**
3. **Consider Upgrading** (see Cost Comparison)

**Emergency Optimization:**
```bash
# Calculate optimal settings for target
import { calculateOptimalSettings } from '@/lib/storage-optimizer';

const settings = calculateOptimalSettings(
  desiredStories: 50,
  avgPages: 10
);

console.log(settings.recommendedQuality);
console.log(settings.recommendedTargetSizeKB);
```

### Migration Strategy

If you must upgrade or migrate:

1. **Export Current Content**
   ```bash
   # Download all stories
   curl https://your-blob-url/stories.json > backup.json
   ```

2. **Re-process Images**
   - Batch convert with lower settings
   - Use ImageMagick or similar tool
   ```bash
   mogrify -resize 1000x1333 -quality 75% *.jpg
   ```

3. **Re-upload Optimized Content**

---

## Cost Comparison

### Vercel Blob Pricing

| Tier | Storage | Bandwidth | Price/Month |
|------|---------|-----------|-------------|
| **Free** | 500 MB | 100 GB | $0 |
| **Pro** | 100 GB | 1 TB | Included in Pro plan |
| **Enterprise** | Custom | Custom | Custom pricing |

### When to Upgrade

**Stay on Free Tier if:**
- Fewer than 50 handwritten stories
- Mostly text-based content
- Can optimize images aggressively

**Consider Pro ($20/month) if:**
- Need 50+ long handwritten stories
- Want maximum image quality
- Plan to add video/audio content
- Need more than 100 GB bandwidth

### Alternative Solutions

#### 1. **Hybrid Approach**
- Store text in Vercel Blob (free)
- Store images in Cloudinary (free tier: 25 GB)
- Total: 25.5 GB free storage

#### 2. **Cloudflare R2**
- First 10 GB free
- No egress fees
- $0.015/GB after that

#### 3. **Self-Host Images**
- Use GitHub Pages for images
- Free unlimited bandwidth
- More complex deployment

---

## Tools & Utilities

### Storage Calculator

Use the built-in calculator:

```typescript
import { 
  estimateStorySize,
  calculateCapacity 
} from '@/lib/storage-optimizer';

// Estimate a story
const size = estimateStorySize('images', 10, 0);
console.log(`Story size: ${formatBytes(size)}`);

// Calculate remaining capacity
const capacity = calculateCapacity(currentUsage, avgSize);
console.log(`Can add ${capacity.storiesRemaining} more stories`);
```

### Optimization Analyzer

```typescript
import { calculateOptimalSettings } from '@/lib/storage-optimizer';

const optimal = calculateOptimalSettings(
  targetStoriesCount: 75,
  avgPagesPerStory: 8
);

console.log('Recommended settings:');
console.log(`Quality: ${optimal.recommendedQuality}`);
console.log(`Max Width: ${optimal.recommendedMaxWidth}px`);
console.log(`Target Size: ${optimal.recommendedTargetSizeKB}KB`);
console.log(`Feasible: ${optimal.feasible}`);
```

---

## Best Practices Summary

### Do's

- Monitor storage usage regularly via admin dashboard
- Compress images before upload when possible
- Use appropriate quality settings for content type
- Keep original copies backed up externally
- Test different quality settings to find sweet spot
- Use black & white for handwritten text when appropriate

### Don'ts

- Don't upload raw photos without compression
- Don't use PNG for photographs
- Don't exceed recommended page counts without optimization
- Don't ignore warning alerts
- Don't store large video files in Blob storage

---

## Quick Reference

### Current Settings
```typescript
TARGET_SIZE_KB: 200
MAX_WIDTH: 1200
MAX_HEIGHT: 1600
QUALITY: 0.85
MAX_IMAGES_PER_STORY: 50
```

### Safe Capacity Estimates
- **Text stories**: 1000+ stories
- **5-page handwritten**: 75 stories
- **10-page handwritten**: 35 stories
- **Mixed content**: 400+ stories

### Key Metrics
- Image target: 200 KB
- Storage limit: 500 MB
- Warning at: 400 MB (80%)
- Critical at: 450 MB (90%)

---

## Support & Resources

- **Documentation**: `/docs` directory
- **Admin Dashboard**: `/admin/settings`
- **API Reference**: `/api/admin/*`
- **Vercel Blob Docs**: https://vercel.com/docs/storage/vercel-blob

---

**Last Updated**: January 2026  
**Version**: 1.0.0
