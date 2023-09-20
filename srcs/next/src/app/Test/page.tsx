import Link from 'next/link';
import WrappedAdd from './TestAdd';
import WrappedPrint from './TestPrint';
import { getChatSocket } from '../SSock';

export default function TestHome() {
    return (
        <main>
            <Link href="../"> to Main </Link>
            <WrappedAdd />
            {/* <WrappedPrint /> */}
        </main>
    );
}
