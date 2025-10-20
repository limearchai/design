// netlify/functions/generate.js

exports.handler = async function (event, context) {
  // Sadece POST isteklerine izin ver
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { model, payload } = JSON.parse(event.body);
    const apiKey = process.env.GOOGLE_API_KEY; // API Anahtarını güvenli ortam değişkeninden al

    if (!apiKey) {
        throw new Error('API anahtarı bulunamadı.');
    }

    let apiUrl;
    if (model === 'gemini') {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    } else if (model === 'imagen') {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
    } else {
        return { statusCode: 400, body: JSON.stringify({ error: 'Geçersiz model belirtildi.' }) };
    }

    const fetch = (await import('node-fetch')).default;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Google API Error:', errorData);
        return {
            statusCode: response.status,
            body: JSON.stringify(errorData),
        };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};