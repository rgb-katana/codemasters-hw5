const SERVER_URL = 'http://localhost:3000/';

export async function get(url) {
  const api = `${SERVER_URL}${url}`;

  return (await fetch(api)).json();
}
