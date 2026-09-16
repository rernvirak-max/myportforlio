<template>
  <header id="header" class="header d-flex flex-column justify-content-center" :class="{ 'header-show': isMenuActive }">
    <i class="header-toggle d-xl-none bi" :class="isMenuActive ? 'bi-x' : 'bi-list'" @click="toggleMenu"></i>

    <nav id="navmenu" class="navmenu" :class="{ 'active': isMenuActive }">
      <ul>
        <li v-for="(item, index) in navItems" :key="index">
          <a :href="item.href" :class="{ active: item.active }" @click="setActive(index); hideMenu()">
            <i :class="item.icon" class="navicon"></i>
            <span>{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue';

const navItems = ref([
  { label: 'Home', href: '#hero', icon: 'bi bi-house', active: true },
  { label: 'About', href: '#about', icon: 'bi bi-person', active: false },
  { label: 'Resume', href: '#resume', icon: 'bi bi-file-earmark-text', active: false },
  { label: 'Portfolio', href: '#portfolio', icon: 'bi bi-images', active: false },
  { label: 'Services', href: '#services', icon: 'bi bi-hdd-stack', active: false },
  { label: 'Contact', href: '#contact', icon: 'bi bi-envelope', active: false },
]);

const isMenuActive = ref(false);

const toggleMenu = () => {
  isMenuActive.value = !isMenuActive.value;
};

const setActive = (index) => {
  navItems.value.forEach((item, i) => {
    item.active = (i === index);
  });
};

const hideMenu = () => {
  if (isMenuActive.value) {
    toggleMenu();
  }
};
</script>

<!-- <style scoped>
/* Add your component-specific styles here */
.header-show {
  /* Add styles for showing the header */
}
</style> -->