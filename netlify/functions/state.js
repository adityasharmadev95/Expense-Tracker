const { getStore } = require('@netlify/blobs');

const DEFAULT_STATE = { tripName: 'Our Trip', friends: [], expenses: [] };
const JSON_HEADERS = { 'Content-Type': 'application/json' };

exports.handler = async (event) => {
  const store = getStore('trip-ledger');

  if (event.httpMethod === 'GET') {
    const data = await store.get('state', { type: 'json' });
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(data || DEFAULT_STATE),
    };
  }

  if (event.httpMethod === 'PUT') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }
    if (!body || typeof body !== 'object') {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid state payload' }) };
    }
    await store.setJSON('state', body);
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
};
