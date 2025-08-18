// services/eventService.js

// Constants for event types
export const EventType = {
  ONLINE: "ONLINE EVENT",
  IN_PERSON: "IN-PERSON EVENT",
  HYBRID: "HYBRID EVENT",
};

// Sample event data - in a real application, this would come from an API
export const sampleEvents = [
  {
    id: 1,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: true,
    image: "/images/event-bonfire.jpg",
    category: "Education",
    location: "Lucknow",
  },
  {
    id: 2,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: false,
    image: "/images/event-concert.jpg",
    category: "Education",
    location: "Lucknow",
  },
  {
    id: 3,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: true,
    image: "/images/event-crowd.jpg",
    category: "Education",
    location: "Lucknow",
  },
];


export const happeningEvents = [
  {
    id: 1,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: true,
    image: "/src/app/assets/images/event-image-fire.png",
    category: "Education",
    location: "Lucknow",
  },
  {
    id: 2,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: true,
    image: "/src/appassets/images/event-fire.png",
    category: "Education",
    location: "Lucknow",
  },
  {
    id: 3,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: true,
    image: "/src/app/assets/images/eventimage.png",
    category: "Education",
    location: "Lucknow",
  },
  {
    id: 4,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: true,
    image: "/src/app/assets/images/eventimage.png",
    category: "Education",
    location: "Lucknow",
  },
  {
    id: 5,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: true,
    image: "/src/app/assets/images/eventimage.png",
    category: "Education",
    location: "Lucknow",
  },
  {
    id: 6,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: true,
    image: "/src/app/assets/images/eventimage.png",
    category: "Education",
    location: "Lucknow",
  },
];


/**
 * Fetch all events
 * @returns {Promise<Array>} - Promise resolving to array of events
 */
export const fetchEvents = async () => {
  // In a real app, you would make an API call here
  // return await fetch('/api/events').then(res => res.json());

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleEvents);
    }, 500); // Simulating API call latency
  });
};

/**
 * Fetch upcoming events
 * @returns {Promise<Array>} - Promise resolving to array of upcoming events
 */
export const fetchUpcomingEvents = async () => {
  // In a real app, you would make an API call with filters
  // return await fetch('/api/events?status=upcoming').then(res => res.json());

  // For demo purposes, return empty array to show empty state
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 500);
  });
};

/**
 * Fetch events happening around me
 * @returns {Promise<Array>} - Promise resolving to array of upcoming events
 */
export const fetchHappeningEvents = async () => {
  // In a real app, you would make an API call with filters
  // return await fetch('/api/events?status=upcoming').then(res => res.json());

  // For demo purposes, return empty array to show empty state
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(happeningEvents);
    }, 500); // Simulating API call latency
  });
};


/**
 * Fetch past events
 * @returns {Promise<Array>} - Promise resolving to array of past events
 */
export const fetchPastEvents = async () => {
  // In a real app, you would make an API call with filters
  // return await fetch('/api/events?status=past').then(res => res.json());

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleEvents);
    }, 500);
  });
};

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} - Promise resolving to created event
 */
export const createEvent = async (eventData) => {
  // In a real app, you would make a POST request
  // return await fetch('/api/events', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(eventData),
  // }).then(res => res.json());

  return new Promise((resolve) => {
    setTimeout(() => {
      const newEvent = {
        id: Math.floor(Math.random() * 1000) + 4,
        ...eventData,
      };
      resolve(newEvent);
    }, 500);
  });
};
