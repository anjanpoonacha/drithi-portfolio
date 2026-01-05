import { NextRequest, NextResponse } from 'next/server';
import { fetchStoriesFromBlob, saveStoriesToBlob, deleteImage, uploadImage } from '@/lib/blob-utils';

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
    const formData = await request.formData();
    const stories = await fetchStoriesFromBlob();
    const index = stories.findIndex((s) => s.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const existingStory = stories[index];
    if (!existingStory) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Extract form fields
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const description = formData.get('description') as string;
    const contentType = formData.get('contentType') as 'text' | 'images' | 'mixed';
    const labels = JSON.parse(formData.get('labels') as string || '[]');
    const featured = formData.get('featured') === 'true';

    // Handle file uploads for cover and character images
    const coverFile = formData.get('coverImage') as File | null;
    const characterFile = formData.get('characterPhoto') as File | null;
    
    let coverImage = existingStory.coverImage;
    let characterPhoto = existingStory.characterPhoto;

    // Upload new cover image if provided
    if (coverFile && coverFile.size > 0) {
      // Delete old cover image if it exists
      if (existingStory.coverImage) {
        try {
          await deleteImage(existingStory.coverImage);
        } catch (e) {
          console.error('Failed to delete old cover image:', e);
        }
      }
      coverImage = await uploadImage(coverFile, `covers/${Date.now()}-${coverFile.name}`);
    }

    // Upload new character photo if provided
    if (characterFile && characterFile.size > 0) {
      // Delete old character photo if it exists
      if (existingStory.characterPhoto) {
        try {
          await deleteImage(existingStory.characterPhoto);
        } catch (e) {
          console.error('Failed to delete old character photo:', e);
        }
      }
      characterPhoto = await uploadImage(characterFile, `characters/${Date.now()}-${characterFile.name}`);
    }

    // Handle content based on type
    let story = existingStory.story;
    let imageUrls = existingStory.imageUrls;
    
    if (contentType === 'text') {
      story = formData.get('storyContent') as string;
      // If switching from images to text, delete old images
      if (existingStory.imageUrls) {
        for (const url of existingStory.imageUrls) {
          try {
            await deleteImage(url);
          } catch (e) {
            console.error('Failed to delete old image:', url, e);
          }
        }
      }
      imageUrls = undefined;
    } else if (contentType === 'images') {
      const imageFiles = formData.getAll('pages') as File[];
      if (imageFiles.length > 0 && imageFiles[0] instanceof File && imageFiles[0].size > 0) {
        // Delete old images if replacing
        if (existingStory.imageUrls) {
          for (const url of existingStory.imageUrls) {
            try {
              await deleteImage(url);
            } catch (e) {
              console.error('Failed to delete old image:', url, e);
            }
          }
        }
        // Upload new images
        imageUrls = [];
        for (const file of imageFiles) {
          const url = await uploadImage(file, `stories/${Date.now()}-${file.name}`);
          imageUrls.push(url);
        }
      }
      story = undefined;
    }

    // Update story with new data
    stories[index] = {
      ...existingStory,
      title,
      author,
      description,
      labels,
      featured,
      contentType,
      story,
      imageUrls,
      coverImage,
      characterPhoto,
      metadata: {
        uploadDate: existingStory.metadata?.uploadDate || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        imageCount: imageUrls?.length || 0,
      },
    };

    await saveStoriesToBlob(stories);
    return NextResponse.json({ success: true, story: stories[index] });
  } catch (error) {
    console.error('Error updating story:', error);
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
