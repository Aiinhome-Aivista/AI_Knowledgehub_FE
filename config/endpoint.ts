const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

export const API_BASE_URL = baseUrl;

export const endpoint = {
  LOGIN: `${baseUrl}/login`,
  TOPICS: `${baseUrl}/topics`,
  SCHEDULER_STATUS: `${baseUrl}/scheduler-status`,
  INGESTION_LOGS: `${baseUrl}/ingestion-logs`,
  ARTICLES: `${baseUrl}/articles`,
  GRAPH_DATA: `${baseUrl}/graph-data`,
  STREAM_LOGS: `${baseUrl}/stream-logs`,
  CHAT: `${baseUrl}/chat`,
  LANDING_DATA: `${baseUrl}/landing-data`,
  CONNECTORS: `${baseUrl}/connectors`,
  SCHEDULER_LOGS: `${baseUrl}/scheduler-logs`,
  SETTINGS: `${baseUrl}/settings`,
  TRIGGER_SCRAPE: `${baseUrl}/trigger-scrape`,
  TEST_LLM: `${baseUrl}/test-llm`,
};

export const ENDPOINTS = endpoint;