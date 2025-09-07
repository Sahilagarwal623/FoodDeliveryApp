import Pusher from 'pusher';
import { decode } from '@googlemaps/polyline-codec'; // Import the decoder

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Location = { lat: number; lng: number; };

export async function simulateDriver(orderId: number, encodedPolyline: string) {
    console.log(`Starting REALISTIC simulation for order #${orderId}`);

    // Decode the polyline string into an array of [lat, lng] pairs
    const realisticRoute = decode(encodedPolyline);

    for (const point of realisticRoute) {
        // Broadcast the event with the decoded coordinates
        await pusher.trigger(`order-${orderId}`, 'location-update', {
            lat: point[0], // The decoded format is [latitude, longitude]
            lng: point[1],
        });

        // A shorter delay makes the movement on the real route look smoother
        await sleep(1000); // Wait for 1 second
    }

    console.log(`Simulation finished for order #${orderId}`);

    await pusher.trigger(`order-${orderId}`, 'status-update', {
        status: 'DELIVERED',
    });
}