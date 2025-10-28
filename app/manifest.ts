import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'xpylon',
        short_name: "xpilon app",
        description: "Go Global, Expand Boundaries",
        start_url: '/?v=2.1.0',
        display: 'standalone',
        icons: [
            {
                "src": '/favicon.ico',
                "sizes": "64x64 32x32 24x24 16x16",
                "type": 'image/x-icon',
            },
            {
                "src": "/icon-192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/icon-512.png",
                "sizes": "512x512",
                "type": "image/png"
            },
        ],
    }
}