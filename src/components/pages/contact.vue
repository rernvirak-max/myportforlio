<template>
  <section id="contact" class="contact section">
    <div class="container section-title" data-aos="fade-up">
      <h2>Contact</h2>
      <p>We value your inquiries and feedback. Please reach out to us for any assistance or information you may need.
      </p>
    </div><!-- End Section Title -->

    <div class="container" data-aos="fade" data-aos-delay="100">
      <div class="row gy-4">
        <div class="col-lg-4">
          <div class="info-item d-flex" data-aos="fade-up" data-aos-delay="200">
            <i class="bi bi-geo-alt flex-shrink-0"></i>
            <div>
              <h3>Address</h3>
              <p>Street 1, Sangkat Khan Chbar Ampeou, 8561</p>
            </div>
          </div><!-- End Info Item -->

          <div class="info-item d-flex" data-aos="fade-up" data-aos-delay="300">
            <i class="bi bi-telephone flex-shrink-0"></i>
            <div>
              <h3>Call Me</h3>
              <p>+855 887199572</p>
            </div>
          </div><!-- End Info Item -->

          <div class="info-item d-flex" data-aos="fade-up" data-aos-delay="400">
            <i class="bi bi-envelope flex-shrink-0"></i>
            <div>
              <h3>Email Me</h3>
              <p>vireakroeun0@gmail.com</p>
            </div>
          </div><!-- End Info Item -->
        </div>

        <div class="col-lg-8">
          <form @submit.prevent="handleSubmit" class="php-email-form" data-aos="fade-up" data-aos-delay="200">
            <div class="row gy-4">
              <div class="col-md-6">
                <input type="text" v-model="form.name" class="form-control" placeholder="Your Name" required />
              </div>

              <div class="col-md-6">
                <input type="email" v-model="form.email" class="form-control" placeholder="Your Email" required />
              </div>

              <div class="col-md-12">
                <input type="text" v-model="form.subject" class="form-control" placeholder="Subject" required />
              </div>

              <div class="col-md-12">
                <textarea v-model="form.message" class="form-control" rows="6" placeholder="Message"
                  required></textarea>
              </div>

              <div class="col-md-12 text-center">
                <div v-if="loading" class="loading">Loading</div>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div v-if="successMessage" class="sent-message">{{ successMessage }}</div>

                <button type="submit">Send Message</button>
              </div>
            </div>
          </form>
        </div><!-- End Contact Form -->
      </div>
    </div>
  </section><!-- /Contact Section -->
</template>

<script setup>
import { ref } from 'vue';

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const handleSubmit = async () => {
  loading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    // Simulate form submission (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Reset form after successful submission
    form.value.name = '';
    form.value.email = '';
    form.value.subject = '';
    form.value.message = '';
    successMessage.value = 'Your message has been sent. Thank you!';
  } catch (error) {
    errorMessage.value = 'There was an error sending your message. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>