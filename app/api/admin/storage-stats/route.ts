import { NextResponse } from 'next/server';
import { calculateStorageUsage, checkStorageLimit } from '@/lib/blob-utils';
import { BLOB_STORAGE } from '@/lib/constants';
import { formatBytes } from '@/lib/image-optimizer';

export async function GET() {
  try {
    const usage = await calculateStorageUsage();
    const limit = await checkStorageLimit();

    return NextResponse.json({
      totalSize: usage.totalSize,
      totalSizeFormatted: formatBytes(usage.totalSize),
      maxSize: BLOB_STORAGE.MAX_TOTAL_SIZE,
      maxSizeFormatted: formatBytes(BLOB_STORAGE.MAX_TOTAL_SIZE),
      percentUsed: limit.percentUsed,
      fileCount: usage.fileCount,
      storiesCount: usage.storiesCount,
      canUpload: limit.canUpload,
      warning: limit.warning,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch storage stats' }, { status: 500 });
  }
}
