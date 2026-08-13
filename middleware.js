import { next } from '@vercel/functions';

// Gate the whole deployment behind HTTP basic auth. This is a development
// preview: nothing here is meant to be publicly reachable, and Vercel's own
// Standard Protection leaves the production alias open — it only covers the
// per-deployment hash URLs.
//
// No `config.matcher`: the gate has to run on every request, including
// robots.txt and the hashed asset files, or the lock has holes in it.

const USER = 'dev';

function unauthorized(message = 'Auth required') {
  return new Response(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="nana-mvp2", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export default function middleware(request) {
  const password = process.env.DEV_PASSWORD;

  // Fail closed. A missing env var must not silently serve the site to
  // everyone — that is the exact failure this file exists to prevent.
  if (!password) return unauthorized('DEV_PASSWORD is not configured');

  const header = request.headers.get('authorization');
  if (header !== `Basic ${btoa(`${USER}:${password}`)}`) return unauthorized();

  return next();
}
