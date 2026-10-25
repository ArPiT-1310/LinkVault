import api from './axios.js';

/*
 * BACKEND CONTRACT (what Spring Boot must return)
 * ------------------------------------------------
 * POST /auth/register   body {name,email,password}  -> { token, name, email }
 * POST /auth/login      body {email,password}       -> { token, name, email }
 *
 * GET  /bookmarks?search&category&tag&favorite&sort=createdAt,desc&page=0&size=10
 *      -> Spring Page<BookmarkResponse>: { content:[...], totalPages, totalElements, number }
 * POST   /bookmarks            body BookmarkRequest  -> BookmarkResponse
 * PUT    /bookmarks/{id}       body BookmarkRequest  -> BookmarkResponse
 * DELETE /bookmarks/{id}                             -> 204
 * PATCH  /bookmarks/{id}/favorite                    -> BookmarkResponse (toggled)
 * GET    /bookmarks/meta?url=                        -> { title, description }
 * GET    /tags                                       -> [ { name, count } ]
 *
 * BookmarkRequest:  { url, title, description, category, tags: string[], favorite }
 * BookmarkResponse: { id, url, title, description, category, tags: string[], favorite, createdAt }
 */

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
};

export const bookmarkApi = {
  list: (params) => api.get('/bookmarks', { params }).then((r) => r.data),
  create: (data) => api.post('/bookmarks', data).then((r) => r.data),
  update: (id, data) => api.put(`/bookmarks/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/bookmarks/${id}`),
  toggleFavorite: (id) => api.patch(`/bookmarks/${id}/favorite`).then((r) => r.data),
  meta: (url) => api.get('/bookmarks/meta', { params: { url } }).then((r) => r.data),
};

export const tagApi = {
  list: () => api.get('/tags').then((r) => r.data),
};
