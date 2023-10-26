'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { BACK_URL } from './globals';
import { Box, CssBaseline, Grid, Paper, Typography } from '@mui/material';
import ImageSlider from './imageSlider';
import { getCookie } from './cookie';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    if (getCookie('access_token')) router.push('/home');
  }, []);

  const images = [
    '/slider/001.png',
    '/slider/002.png',
    '/slider/003.png',
    '/slider/004.png',
    '/slider/005.png',
    '/slider/006.png',
    '/slider/007.png',
  ];

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t: any) =>
            t.palette.mode === 'light'
              ? t.palette.grey[50]
              : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <main>
              <img
                src="/tsenLogo.png"
                alt="pingpong"
                style={{
                  width: '400px',
                }}
              />
              <br />
              <Link
                href={`${BACK_URL}/auth/42login`}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="outlined"
                  className="yellow-hover"
                  sx={{
                    width: '400px',
                    height: '50px',
                    borderRadius: '15px',
                    color: 'black',
                    borderColor: 'black',
                  }}
                >
                  <Typography variant="body2">42 login</Typography>
                </Button>
              </Link>
            </main>
            <ImageSlider
              images={images}
              interval={1800}
              sliderWidth={320}
              sliderHeight={240}
            />
          </Box>
        </>
      </Grid>
    </Grid>
  );
};

export default Home;
