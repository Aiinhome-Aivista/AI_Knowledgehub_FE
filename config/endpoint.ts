const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  // Remove trailing slash if present
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
};

export const API_BASE_URL = getApiBaseUrl();

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  CHAT: `${API_BASE_URL}/chat`,
  SETTINGS: `${API_BASE_URL}/settings`,
  TEST_LLM: `${API_BASE_URL}/test-llm`,
  SCHEDULER_STATUS: `${API_BASE_URL}/scheduler-status`,
  INGESTION_LOGS: `${API_BASE_URL}/ingestion-logs`,
  SCHEDULER_LOGS: `${API_BASE_URL}/scheduler-logs`,
  TRIGGER_SCRAPE: `${API_BASE_URL}/trigger-scrape`,
  TOPICS: `${API_BASE_URL}/topics`,
  CONNECTORS: `${API_BASE_URL}/connectors`,
  STREAM_LOGS: `${API_BASE_URL}/stream-logs`,
  LANDING_DATA: `${API_BASE_URL}/landing-data`,
  GRAPH_DATA: `${API_BASE_URL}/graph-data`,
  ARTICLES: `${API_BASE_URL}/articles`,
};