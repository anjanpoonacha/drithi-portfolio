import { NextRequest, NextResponse } from 'next/server';
import { fetchStoriesFromBlob, saveStoriesToBlob, uploadImage, checkStorageLimit } from '@/lib/blob-utils';
import type { Story } from '@/lib/types';
import { ADMIN } from '@/lib/constants';

// GET: List all stories
export async function GET() {
  try {
    const stories = await fetchStoriesFromBlob();
    // Sort by date, newest first
    const sorted = stories.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json({ stories: sorted });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

// POST: Create new story
export async function POST(request: NextRequest) {
  try {
    // Check auth
    const password = request.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check storage limit
    const storageCheck = await checkStorageLimit();
    if (!storageCheck.canUpload) {
      return NextResponse.json({ 
        error: 'Storage limit exceeded', 
        details: storageCheck 
      }, { status: 507 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string || ADMIN.DEFAULT_AUTHOR;
    const description = formData.get('description') as string;
    const contentType = formData.get('contentType') as 'text' | 'images' | 'mixed';
    const labels = JSON.parse(formData.get('labels') as string || '[]');
    const featured = formData.get('featured') === 'true';
    
    // Upload cover and character images
    const coverFile = formData.get('coverImage') as File | null;
    const characterFile = formData.get('characterPhoto') as File | null;
    
    const coverImage = coverFile 
      ? await uploadImage(coverFile, `covers/${Date.now()}-${coverFile.name}`)
      : '';
    const characterPhoto = characterFile
      ? await uploadImage(characterFile, `characters/${Date.now()}-${characterFile.name}`)
      : '';

    // Handle content based on type
    let story: string | undefined;
    let imageUrls: string[] | undefined;
    
    if (contentType === 'text') {
      story = formData.get('storyContent') as string;
    } else if (contentType === 'images') {
      const imageFiles = formData.getAll('pages') as File[];
      imageUrls = [];
      for (const file of imageFiles) {
        const url = await uploadImage(file, `stories/${Date.now()}-${file.name}`);
        imageUrls.push(url);
      }
    }

    // Create new story
    const newStory: Story = {
      id: `story-${Date.now()}`,
      title,
      author,
      description,
      labels,
      featured,
      createdAt: new Date().toISOString(),
      contentType,
      story,
      imageUrls,
      coverImage,
      characterPhoto,
      metadata: {
        uploadDate: new Date().toISOString(),
        imageCount: imageUrls?.length || 0,
      },
    };

    // Add to stories
    const stories = await fetchStoriesFromBlob();
    stories.push(newStory);
    await saveStoriesToBlob(stories);

    return NextResponse.json({ success: true, story: newStory });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
