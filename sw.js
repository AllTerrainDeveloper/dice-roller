/*
 * Dice Roller service worker.
 * - App shell (this site's files) is precached and served network-first, so updates land immediately.
 * - Pinned CDN libraries (three.js, Rapier) and Google Fonts are cached on first use and served cache-first,
 *   which makes the app work fully offline after one online visit.
 */
const VERSION = 'dice-v20';
const SHELL = [ './', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png' ];
const CDN = [ 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com' ];

self.addEventListener( 'install', ( event ) => {
	event.waitUntil( caches.open( VERSION ).then( ( c ) => c.addAll( SHELL ) ).then( () => self.skipWaiting() ) );
} );

self.addEventListener( 'activate', ( event ) => {
	event.waitUntil(
		caches.keys().then( ( keys ) => Promise.all( keys.filter( ( k ) => k !== VERSION ).map( ( k ) => caches.delete( k ) ) ) ).then( () => self.clients.claim() )
	);
} );

self.addEventListener( 'fetch', ( event ) => {
	const req = event.request;
	if ( req.method !== 'GET' ) return;
	const url = new URL( req.url );

	// Versioned third-party assets never change: cache first.
	if ( CDN.includes( url.hostname ) ) {
		event.respondWith(
			caches.open( VERSION ).then( async ( cache ) => {
				const hit = await cache.match( req );
				if ( hit ) return hit;
				const res = await fetch( req );
				if ( res.ok || res.type === 'opaque' ) cache.put( req, res.clone() );
				return res;
			} )
		);
		return;
	}

	if ( url.origin !== self.location.origin ) return;

	// App shell: network first, fall back to cache (any query string maps to the same page).
	event.respondWith(
		fetch( req ).then( ( res ) => {
			if ( res.ok && res.type === 'basic' ) {
				const copy = res.clone();
				const key = req.mode === 'navigate' ? './index.html' : req;
				caches.open( VERSION ).then( ( c ) => c.put( key, copy ) );
			}
			return res;
		} ).catch( async () => {
			const cache = await caches.open( VERSION );
			if ( req.mode === 'navigate' ) return ( await cache.match( './index.html' ) ) || ( await cache.match( './' ) );
			return cache.match( req, { ignoreSearch: true } );
		} )
	);
} );
