<template>
    <!-- About Section -->
    <section id="about" class="about section">
        <!-- Section Title -->
        <div class="container section-title" data-aos="fade-up">
            <h2>About</h2>
            <p>{{ state.aboutDescription }}</p>
        </div><!-- End Section Title -->

        <div class="container" data-aos="fade-up" data-aos-delay="100">
            <div class="row gy-4 justify-content-center">
                <div class="col-lg-4">
                    <img :src="state.profileImage" class="img-fluid" alt="Profile Image">
                </div>
                <div class="col-lg-8 content">
                    <h2>{{ state.title }}</h2>
                    <p class="fst-italic py-3">{{ state.introText }}</p>
                    <div class="row">
                        <div class="col-lg-6">
                            <ul>
                                <li v-for="(item, index) in state.leftInfo" :key="index">
                                    <i class="bi bi-chevron-right"></i> <strong>{{ item.label }}:</strong> <span>{{
                                        item.value }}</span>
                                </li>
                            </ul>
                        </div>
                        <div class="col-lg-6">
                            <ul>
                                <li v-for="(item, index) in state.rightInfo" :key="index">
                                    <i class="bi bi-chevron-right"></i> <strong>{{ item.label }}:</strong> <span>{{
                                        item.value }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <p class="py-3">{{ state.additionalInfo }}</p>
                </div>
            </div>
        </div>
    </section><!-- /About Section -->
</template>

<script setup>
import { ref } from 'vue';

const state = ref({
    aboutDescription: 'assionate Web Designer and Web Developer with a strong educational background, specializing in creating engaging, user-friendly web applications. Skilled in both frontend and backend technologies, I strive to deliver high-quality digital solutions that meet client needs and enhance user experience. With a solid foundation in design principles and coding practices, I am dedicated to continuous learning and adapting to new challenges in the tech landscape.',
    title: 'Web Designer & Web Developer.',
    introText: "I’m Vireak Roeun, a Web Designer and Developer from Phnom Penh, Cambodia. With a solid educational background and skills in frontend and backend technologies, I create engaging and functional web applications. I'm available for freelance opportunities.",
    profileImage: './assets/img/profile-img.jpg',
    leftInfo: [
        { label: 'Birthday', value: '9 May 2003' },
        { label: 'Website', value: 'www.example.com' },
        { label: 'Phone', value: '+855 887199572' },
        { label: 'City', value: 'Phnom Penh, Cambodia' },
    ],

    rightInfo :[
        { label: 'Age', value: '22' },
        { label: 'Degree', value: 'Master' },
        { label: 'Email', value: 'vireakroeun0@gmail.com' },
        { label: 'Freelance', value: 'Available' },
    ],
    additionalInfo: 'I am open to freelance projects, with interests in web design trends, user experience, and coding best practices, and I am fluent in English and Khmer; in my spare time, I enjoy exploring new technologies, and play sports.'
});

</script>
