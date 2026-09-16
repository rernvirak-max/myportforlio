<template>
    <section id="testimonials" class="testimonials section">
      <div class="container section-title" data-aos="fade-up">
        <h2>Testimonials</h2>
        <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
      </div>
  
      <div class="container" data-aos="fade-up" data-aos-delay="100">
        <div class="swiper init-swiper" ref="swiperContainer">
          <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="(testimonial, index) in testimonials" :key="index">
              <div class="testimonial-item">
                <div class="row gy-4 justify-content-center">
                  <div class="col-lg-6">
                    <div class="testimonial-content">
                      <p>
                        <i class="bi bi-quote quote-icon-left"></i>
                        <span>{{ testimonial.quote }}</span>
                        <i class="bi bi-quote quote-icon-right"></i>
                      </p>
                      <h3>{{ testimonial.name }}</h3>
                      <h4>{{ testimonial.position }}</h4>
                      <div class="stars">
                        <i v-for="star in testimonial.rating" :key="star" class="bi bi-star-fill"></i>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-2 text-center">
                    <img :src="testimonial.image" class="img-fluid testimonial-img" alt="">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-pagination"></div>
        </div>
      </div>
                      <!-- <a :href="item.image" :title="item.title" data-gallery="portfolio-gallery" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a> -->
                <!-- <a :href="item.detailsLink" title="More Details" class="details-link"><i class="bi bi-link-45deg"></i></a> -->
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import Swiper from 'swiper/bundle'; // Ensure you have installed Swiper
  
  const testimonials = ref([
    {
      quote: "Proin iaculis purus consequat sem cure digni ssim donec porttitora entum suscipit rhoncus. Accusantium quam, ultricies eget id, aliquam eget nibh et. Maecen aliquam, risus at semper.",
      name: "Saul Goodman",
      position: "Ceo & Founder",
      rating: [1, 1, 1, 1, 1], // 5 stars
      image: "src/assets/img/testimonials/testimonials-1.jpg"
    },
    {
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      name: "Jessica Jones",
      position: "Marketing Director",
      rating: [1, 1, 1, 1, 1], // 5 stars
      image: "src/assets/img/testimonials/testimonials-2.jpg"
    },
    {
      quote: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      name: "Tony Stark",
      position: "CTO",
      rating: [1, 1, 1, 1, 1], // 5 stars
      image: "src/assets/img/testimonials/testimonials-3.jpg"
    },
    {
      quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      name: "Bruce Wayne",
      position: "CEO of Wayne Enterprises",
      rating: [1, 1, 1, 1, 1], // 5 stars
      image: "src/assets/img/testimonials/testimonials-4.jpg"
    },
    // Add more testimonials as needed
  ]);
  
  const swiperContainer = ref(null);
  
  onMounted(() => {
    const config = {
      loop: true,
      speed: 600,
      autoplay: {
        delay: 5000
      },
      slidesPerView: "auto",
      pagination: {
        el: ".swiper-pagination",
        type: "bullets",
        clickable: true
      }
    };
  
    new Swiper(swiperContainer.value, config);
  });
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>