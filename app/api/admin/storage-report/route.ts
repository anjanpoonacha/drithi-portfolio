/**
 * API endpoint for comprehensive storage optimization report
 * @module api/admin/storage-report
 */

import { NextResponse } from 'next/server';
import { calculateStorageUsage } from '@/lib/blob-utils';
import { generateStorageReport } from '@/lib/storage-optimizer';

/**
 * GET /api/admin/storage-report
 * Returns detailed storage analysis with scenarios and recommendations
 */
export async function GET() {
  try {
    const usage = await calculateStorageUsage();
    const report = generateStorageReport(usage.totalSize, usage.storiesCount);

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        currentFiles: usage.fileCount,
      },
    });
  } catch (error) {
    console.error('Failed to generate storage report:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate storage report' 
      },
      { status: 500 }
    );
  }
}
