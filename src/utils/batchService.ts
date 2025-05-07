// src/utils/batchService.ts
const BATCH_INTERVAL = 1000 // 1 second
const nominatimQueue = new Map<string, Function>()

const processBatch = async () => {
  try {
    const batch = Array.from(nominatimQueue.entries());
    const searchParams = new URLSearchParams({
      q: batch.map(([query]) => query).join('|'),
      format: 'jsonv2',
      limit: batch.length.toString(),
      addressdetails: '1'
    });

    console.log('Batch search params:', `https://nominatim.openstreetmap.org/search?${encodeURIComponent(searchParams)}`);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${encodeURIComponent(searchParams)}`,
      {
        headers: {
          'User-Agent': 'YourAppName/1.0 (contact@yourdomain.com)',
          'Accept-Language': 'en'
        }
      }
    );

    console.log('Batch response:', response);

    if (response.status === 429) {
      // Handle rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
      return processBatch();
    }

    const results = await response.json();
    batch.forEach(([query, resolve], index) => {
      resolve(results[index] || null);
    });
  } catch (error) {
    batch.forEach(([_, reject]) => reject(error));
  }
};

setInterval(processBatch, BATCH_INTERVAL)

export const enqueueNominatimRequest = (query: string) => 
  new Promise((resolve, reject) => {
    nominatimQueue.set(query, resolve)
  })
