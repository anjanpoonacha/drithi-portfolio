import { NextRequest, NextResponse } from 'next/server';
import { fetchStoriesFromBlob, saveStoriesToBlob, deleteImage } from '@/lib/blob-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stories = await fetchStoriesFromBlob();
    const story = stories.find((s) => s.id === id);
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    return NextResponse.json({ story });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const password = request.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const updates = await request.json();
    const stories = await fetchStoriesFromBlob();
    const index = stories.findIndex((s) => s.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const existingStory = stories[index];
    if (!existingStory) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    stories[index] = {
      ...existingStory,
      ...updates,
      metadata: {
        ...existingStory.metadata,
        lastModified: new Date().toISOString(),
      },
    };

    await saveStoriesToBlob(stories);
    return NextResponse.json({ success: true, story: stories[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const password = request.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const stories = await fetchStoriesFromBlob();
    const story = stories.find((s) => s.id === id);
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Delete associated images
    if (story.imageUrls) {
      for (const url of story.imageUrls) {
        try {
          await deleteImage(url);
        } catch (e) {
          console.error('Failed to delete image:', url, e);
        }
      }
    }

    // Remove from stories
    const filtered = stories.filter((s) => s.id !== id);
    await saveStoriesToBlob(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
}
