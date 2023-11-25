const SERVER_URL = 'http://localhost:3000/';

export async function get<T>(url: string): Promise<T> {
  const api = `${SERVER_URL}${url}`;

  return (await fetch(api)).json();
}
