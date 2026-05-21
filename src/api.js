export async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const token = localStorage.getItem('admin_token');
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch('/api' + path, { headers, ...opts });
  try {
    return await res.json();
  } catch {
    return { error: `Server error (${res.status})` };
  }
}
