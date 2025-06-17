export default async function sitemap() {
    const events = await API.getAllEvents(); // Implement this API call
    
    const eventUrls = events.map((event) => ({
      url: `https://byro.africa/${event.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  
    return [
      {
        url: 'https://byro.africa',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      ...eventUrls,
    ];
  }