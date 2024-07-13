const API_BASE_URL = "http://localhost:3001/api";

// search for papers
export const searchSemanticScholar = async (query) => {
  const url = `${API_BASE_URL}/paper/search?query=${encodeURIComponent(
    query
  )}&limit=7&fields=paperId,title`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data;
};

// get paper details
export const getPaperDetails = async (paperId) => {
  const url = `${API_BASE_URL}/paper/${paperId}?fields=citationStyles`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};