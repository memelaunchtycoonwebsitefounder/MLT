import { Hono } from 'hono';
import { readFile } from 'fs/promises';
import { join } from 'path';

const landing = new Hono();

// Serve new landing page
landing.get('/', async (c) => {
  try {
    // Read the new landing page HTML
    const html = await readFile(join(process.cwd(), 'public', 'landing-new.html'), 'utf-8');
    return c.html(html);
  } catch (error) {
    console.error('Error loading landing page:', error);
    // Fallback to basic HTML
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MemeLaunch Tycoon</title>
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen flex items-center justify-center">
          <div class="text-center">
              <h1 class="text-4xl font-bold mb-4">MemeLaunch Tycoon</h1>
              <p class="text-gray-400 mb-6">Loading...</p>
              <a href="/signup" class="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold transition">
                  Get Started
              </a>
          </div>
      </body>
      </html>
    `);
  }
});

export default landing;
