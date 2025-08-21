import API from './api';

// Constants for event types
export const EventType = {
  ONLINE: "ONLINE EVENT",
  IN_PERSON: "IN-PERSON EVENT",

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





export const fetchHappeningEvents = async () => {
  try {
    const data = await API.getEvents();
    
    // Handle different response structures
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.events)) {
      return data.events;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn('Unexpected API response structure:', data);
      return [];
    }
    
  } catch (error) {
    console.error('Error fetching happening events:', error);
    return []; // Always return empty array on error
  }
  }



/**
 * Fetch all events
 * @returns {Promise<Array>} - Promise resolving to array of events
 */
export const fetchEvents = async () => {
try {
    const response = await fetch('/api/events');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.events || data;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
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
// export const fetchHappeningEvents = async () => {
//   // In a real app, you would make an API call with filters
//   // return await fetch('/api/events?status=upcoming').then(res => res.json());

//   // For demo purposes, return empty array to show empty state
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(happeningEvents);
//     }, 500); // Simulating API call latency
//   });
// };


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
  try {
    console.log('Sending event data:', eventData);
    
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: eventData,
    });
    
    console.log('Backend response:', response.data);
    console.log('Returned image URL:', response.data.image);
    
    return response.data;
  } catch (error) {
    console.error('Event creation error:', error.response?.data);
    throw error;
  }

  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     const newEvent = {
  //       id: Math.floor(Math.random() * 1000) + 4,
  //       ...eventData,
  //     };
  //     resolve(newEvent);
  //   }, 500);
  // });
};
