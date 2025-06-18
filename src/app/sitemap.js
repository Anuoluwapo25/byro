export default async function sitemap() {
  try {
    // Fetch events from your API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    const events = await response.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://byro.vercel.app';
    
    const eventUrls = events.map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      ...eventUrls,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return just the homepage if there's an error
    return [
      {
        url: process.env.NEXT_PUBLIC_BASE_URL || 'https://byro.vercel.app',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
  }