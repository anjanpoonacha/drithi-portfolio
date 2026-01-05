import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, checkStorageLimit } from '@/lib/blob-utils';
import { compressImage } from '@/lib/image-optimizer';

export async function POST(request: NextRequest) {
  try {
    const password = request.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storageCheck = await checkStorageLimit();
    if (!storageCheck.canUpload) {
      return NextResponse.json({ 
        error: 'Storage limit exceeded', 
        details: storageCheck 
      }, { status: 507 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const url = await uploadImage(file, `uploads/${Date.now()}-${file.name}`);
      uploadedUrls.push(url);
    }

    return NextResponse.json({ 
      success: true, 
      urls: uploadedUrls,
      count: uploadedUrls.length 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
