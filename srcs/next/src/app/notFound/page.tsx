'use client'; // Error components must be Client Components

import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Error() {
  const router = useRouter();
  return (
    <>
      <div>
        <h1>404 NOT FOUND ^^</h1>
      </div>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          router.push('/home');
        }}
      >
        Go Home
      </Button>
    </>
  );
}
