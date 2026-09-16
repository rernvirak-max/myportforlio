<template>
    <!-- Portfolio Section -->
    <section id="portfolio" class="portfolio section">
      <!-- Section Title -->
      <div class="container section-title" data-aos="fade-up">
        <h2>Portfolio</h2>
        <p>Welcome to my portfolio! Here, you can explore my projects that showcase my skills in web design and development. Each project reflects my commitment to creating user-friendly and engaging web applications. Feel free to navigate through my work to see how I can help bring your ideas to life!.</p>
      </div><!-- End Section Title -->
  
      <div class="container">
        <div class="isotope-layout" data-default-filter="*" data-layout="masonry" data-sort="original-order">
          <ul class="portfolio-filters isotope-filters" data-aos="fade-up" data-aos-delay="100">
            <li data-filter="*" class="filter-active">All</li>
            <li data-filter=".filter-API">API</li>
            <!-- <li data-filter=".filter-product">Card</li> -->
            <li data-filter=".filter-branding">Web</li>
          </ul><!-- End Portfolio Filters -->
  
          <div class="row gy-4 isotope-container" data-aos="fade-up" data-aos-delay="200">
            <div v-for="(item, index) in portfolioItems" :key="index" :class="['col-lg-4 col-md-6 portfolio-item', item.filter]" class="isotope-item">
              <img :src="item.image" class="img-fluid" :alt="item.title">
              <div class="portfolio-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </div><!-- End Portfolio Item -->
          </div><!-- End Portfolio Container -->
        </div>
      </div>
    </section><!-- /Portfolio Section -->
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import GLightbox from 'glightbox';
  import Isotope from 'isotope-layout';
  import imagesLoaded from 'imagesloaded';
  
  const portfolioItems = ref([
    {
      title: 'Shi_Ga Laptop',
      description: 'Sell laptop',
      image: './assets/img/portfolio/web-page-1.jpg',
      filter: 'filter-branding',
      detailsLink: 'portfolio-details.html'
    },
    {
      title: 'GuideJob',
      description: 'find job',
      image: './assets/img/portfolio/web-page-2.jpg',
      filter: 'filter-branding',
      detailsLink: 'portfolio-details.html'
    },
    {
      title: 'GuideJob',
      description: 'find job',
      image: './assets/img/portfolio/web-page-3.jpg',
      filter: 'filter-branding',
      detailsLink: 'portfolio-details.html'
    },
    {
      title: 'MOVISO',
      description: 'Booked ticket for new movies',
      image: './assets/img/portfolio/web-page-4.jpg',
      filter: 'filter-branding',
      detailsLink: 'portfolio-details.html'
    },
    // {
    //   title: 'Product 2',
    //   description: 'Lorem ipsum, dolor sit',
    //   image: './assets/img/masonry-portfolio/masonry-portfolio-5.jpg',
    //   filter: 'filter-product',
    //   detailsLink: 'portfolio-details.html'
    // },
    // {
    //   title: 'Branding 2',
    //   description: 'Lorem ipsum, dolor sit',
    //   image: './assets/img/masonry-portfolio/masonry-portfolio-6.jpg',
    //   filter: 'filter-branding',
    //   detailsLink: 'portfolio-details.html'
    // },
    // {
    //   title: 'App 3',
    //   description: 'Lorem ipsum, dolor sit',
    //   image: './assets/img/masonry-portfolio/masonry-portfolio-7.jpg',
    //   filter: 'filter-app',
    //   detailsLink: 'portfolio-details.html'
    // },
    // {
    //   title: 'Product 3',
    //   description: 'Lorem ipsum, dolor sit',
    //   image: './assets/img/masonry-portfolio/masonry-portfolio-8.jpg',
    //   filter: 'filter-product',
    //   detailsLink: 'portfolio-details.html'
    // },
    // {
    //   title: 'Branding 3',
    //   description: 'Lorem ipsum, dolor sit',
    //   image: './assets/img/masonry-portfolio/masonry-portfolio-9.jpg',
    //   filter: 'filter-branding',
    //   detailsLink: 'portfolio-details.html'
    // }
  ]);
  
  onMounted(() => {
    // Initiate GLightbox
    const glightbox = GLightbox({
      selector: '.glightbox'
    });
  
    // Init Isotope layout and filters
    document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
      let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
      let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
      let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';
  
      let initIsotope;
      imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
        initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
          itemSelector: '.isotope-item',
          layoutMode: layout,
          filter: filter,
          sortBy: sort
        });
      });
  
      isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
        filters.addEventListener('click', function() {
          isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
          this.classList.add('filter-active');
          initIsotope.arrange({
            filter: this.getAttribute('data-filter')
          });
        }, false);
      });
    });
  });
  </script>
  
  <style scoped>
  /* Add your component-specific styles here */
  </style>