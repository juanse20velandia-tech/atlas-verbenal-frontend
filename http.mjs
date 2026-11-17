export async function request(path, { method = 'GET', key, value, revision } = {}) {
  const headers = {};
  if (key) headers.Authorization = key;
  if (revision) headers['If-Match'] = String(revision);
  if (value) headers['Content-Type'] = 'application/json';
  const response = await fetch('/api/' + path, {
    method, headers, body: value ? JSON.stringify(value) : undefined
  });
  if (response.status === 204) return;
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Ocurrió un error al consultar el atlas.');
  return data;
}
