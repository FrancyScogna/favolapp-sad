import './AboutSwiper.css';
import PropTypes from 'prop-types';
import { Typography, useMediaQuery } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useEffect, useState } from 'react';

function AboutSwiper({ nSlidesDesktop, nSlidesMobile }) {
  const mobile = useMediaQuery('(max-width: 650px)');

  const [slideImages, setSlideImages] = useState([]);

  useEffect(() => {
    const importImages = (folder, n) => {
      const images =
        folder === 'DesktopImgs'
          ? import.meta.glob('/public/images/AboutSwiper/DesktopImgs/*.png')
          : import.meta.glob('/public/images/AboutSwiper/MobileImgs/*.png');
      return Object.keys(images)
        .slice(0, n)
        .map((path) => path.replace('/public', ''));
    };

    const fetchImages = () => {
      const mobileSlides = importImages('MobileImgs', nSlidesMobile);
      const desktopSlides = importImages('DesktopImgs', nSlidesDesktop);
      const images = mobile ? mobileSlides : desktopSlides;
      setSlideImages(images);
    };

    fetchImages();
  }, [mobile, nSlidesDesktop, nSlidesMobile]);

  return (
    <div className='aboutswiper-main-div'>
      <Typography className='title'>Cosa puoi trovare?</Typography>
      <Swiper
        className='swiper'
        modules={[Navigation, Pagination]}
        navigation
        pagination
        spaceBetween={1200}
        slidesPerView={1}
      >
        {slideImages.map((image, index) => (
          <SwiperSlide key={index} className='swiper-slide'>
            <img alt={`SlideImage${index}`} className='img' src={image} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

AboutSwiper.propTypes = {
  nSlidesDesktop: PropTypes.number,
  nSlidesMobile: PropTypes.number,
};

export default AboutSwiper;
