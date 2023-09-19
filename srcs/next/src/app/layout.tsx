import './globals.css';
import type { Metadata } from 'next';
import { io } from 'socket.io-client';

export const metadata: Metadata = {
    title: 'Transcendence',
    description:
        'The titleeeeeeeeeeeeeeeeeee will be Transcendence. But with Nest and Next',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // const socket = io('http://10.14.4.2:3000', {
    //     withCredentials: false,
    // });
    // socket.connect();
    //initSocket();
    return (
        <html>
            <body>{children}</body>
        </html>
    );
}
