import React, { useState, useEffect } from 'react';

interface ImageSliderProps {
  images: string[];
  interval: number; // 이미지 전환 간격 (밀리초)
  sliderWidth: number; // 슬라이더의 가로 너비
  sliderHeight: number; // 슬라이더의 세로 높이
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  interval,
  sliderWidth,
  sliderHeight,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1: 정방향, -1: 역방향

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + direction;
        if (nextIndex < 0) {
          setDirection(1);
          return 1;
        }
        if (nextIndex >= images.length) {
          setDirection(-1);
          return images.length - 2;
        }
        return nextIndex;
      });
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [images, interval, direction]);

  return (
    <div
      className="image-slider"
      style={{ width: `${sliderWidth}px`, height: `${sliderHeight}px` }}
    >
      <div
        className="image-slider-inner"
        style={{
          transform: `translateX(-${currentIndex * sliderWidth}px)`,
          width: `${images.length * sliderWidth}px`,
          height: `${sliderHeight}px`,
          display: 'flex',
          transition: 'transform 0.5s ease-in-out',
        }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Image ${index + 1}`}
            style={{ width: `${sliderWidth}px`, height: `${sliderHeight}px` }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
