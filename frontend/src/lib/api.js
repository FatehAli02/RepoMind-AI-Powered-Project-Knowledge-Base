
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

function parseErrorDetail(body, fallback) {
  if (!body) return fallback;
  const { detail } = body;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {

    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : null;
        const msg = d.msg || d.message || JSON.stringify(d);
        return field ? `${field}: ${msg}` : msg;
      })
      .join(" | ");
  }
  return fallback;
}

/**
 * Core request function.
 * @param {string} path 
 * @param {object} options
 * @param {string} options.method
 * @param {object|FormData} [options.body]
 * @param {boolean} [options.isForm] 
 * @param {boolean} [options.isMultipart] 
 * @param {boolean} [options.auth] 
 */
async function request(
  path,
  { method = "GET", body, isForm = false, isMultipart = false, auth = true } = {}
) {
  const headers = {};
  const token = getToken();

  if (auth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let payload = body;

  if (isMultipart) {
    payload = body;
  } else if (isForm) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = body instanceof URLSearchParams ? body : new URLSearchParams(body);
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: payload,
    });
  } catch (networkErr) {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }

  if (response.status === 401 && auth) {
    localStorage.removeItem("access_token");
    if (window.location.pathname !== "/auth") {
      window.location.href = "/auth";
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    throw new Error(parseErrorDetail(data, `Request failed (${response.status})`));
  }

  return data;
}

export const api = {
  register: (email, password) =>
    request("/auth/register", { method: "POST", body: { email, password }, auth: false }),

  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      isForm: true,
      auth: false,
      body: { username: email, password },
    }),

  getProjects: () => request("/projects/"),
  createProject: (name) => request("/projects/", { method: "POST", body: { name } }),
  deleteProject: (id) => request(`/projects/${id}`, { method: "DELETE" }),

  uploadDocument: (projectId, file) => {
    const form = new FormData();
    form.append("file", file);
    return request(`/documents/uploads/${projectId}`, {
      method: "POST",
      isMultipart: true,
      body: form,
    });
  },
  getDocuments: (projectId) => request(`/documents/project/${projectId}`),
  deleteDocument: (id) => request(`/documents/${id}`, { method: "DELETE" }),

  ask: (projectId, question) =>
    request(`/projects/${projectId}/ask`, { method: "POST", body: { question } }),
  getHistory: (projectId) => request(`/projects/${projectId}/history`),
};

export { BASE_URL };
