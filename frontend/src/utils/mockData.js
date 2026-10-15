// Standalone Mock Data Provider for LinkUp Frontend Exploration

export const MOCK_USER = {
  id: 1,
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  title: 'Senior Full Stack Engineer',
  headline: 'Building scalable microservices & modern web applications | React, Java, Spring Boot, Kafka',
  location: 'San Francisco, CA',
  connectionsCount: 428,
};

// Valid JWT token format with far future exp (2050)
export const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhbGV4Lm1vcmdhbkBleGFtcGxlLmNvbSIsImV4cCI6MjUyNDYwODAwMCwibmFtZSI6IkFsZXggTW9yZ2FuIn0.mock_signature';

export const MOCK_CONNECTIONS_INITIAL = [
  { id: 101, userId: 2, name: 'Sarah Chen', title: 'Lead Staff Architect @ CloudScale', mutuals: 14 },
  { id: 102, userId: 3, name: 'David Miller', title: 'Senior Backend Engineer @ DataStream', mutuals: 8 },
  { id: 103, userId: 4, name: 'Emily Watson', title: 'Product Design Lead @ CraftUI', mutuals: 22 },
  { id: 104, userId: 5, name: 'Michael Brown', title: 'DevOps & Platform Tech Lead', mutuals: 5 },
  { id: 105, userId: 6, name: 'Jessica Taylor', title: 'Engineering Manager @ AI Vanguard', mutuals: 31 },
];

export const MOCK_POSTS_INITIAL = [
  {
    id: 1,
    userId: 1,
    content:
      '🚀 Thrilled to announce the launch of our new event-driven microservice architecture built with Spring Boot, Kafka, and React! We handled 100k+ concurrent websocket events seamlessly in testing. Massive thanks to the team for pushing the boundaries of real-time performance!',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    likesCount: 34,
    likedByMe: true,
  },
  {
    id: 2,
    userId: 2,
    content:
      'Designing clean API gateways with Spring Cloud Gateway & Discovery Server. Here are 3 design patterns I use every day to keep routing fast, dynamic, and resilient across 20+ microservices 👇\n\n1. Centralized Auth filter at Gateway level\n2. Rate-limiting using Redis token bucket\n3. Circuit breaker fallbacks with Resilience4j',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    likesCount: 89,
    likedByMe: false,
  },
  {
    id: 3,
    userId: 4,
    content:
      'UI/UX Design tip: Consistent micro-interactions and dark mode color palettes raise user retention by up to 40%. Always ensure contrast ratios pass AAA guidelines! 🎨✨',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    likesCount: 142,
    likedByMe: true,
  },
  {
    id: 4,
    userId: 3,
    content:
      'PostgreSQL vs Neo4j vs Kafka: Choosing the right tool for the job. Relational for ACID user transactions, Graph DB for multi-degree network connections, and Kafka for asynchronous messaging streams.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    likesCount: 67,
    likedByMe: false,
  },
];

// Helper functions for persistent Mock Storage during frontend testing
const POSTS_KEY = 'mock_posts_store';
const CONNS_KEY = 'mock_conns_store';

export function getStoredMockPosts() {
  const data = localStorage.getItem(POSTS_KEY);
  if (!data) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(MOCK_POSTS_INITIAL));
    return MOCK_POSTS_INITIAL;
  }
  try {
    return JSON.parse(data);
  } catch {
    return MOCK_POSTS_INITIAL;
  }
}

export function saveStoredMockPosts(posts) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function getStoredMockConnections() {
  const data = localStorage.getItem(CONNS_KEY);
  if (!data) {
    localStorage.setItem(CONNS_KEY, JSON.stringify(MOCK_CONNECTIONS_INITIAL));
    return MOCK_CONNECTIONS_INITIAL;
  }
  try {
    return JSON.parse(data);
  } catch {
    return MOCK_CONNECTIONS_INITIAL;
  }
}

export function saveStoredMockConnections(conns) {
  localStorage.setItem(CONNS_KEY, JSON.stringify(conns));
}
