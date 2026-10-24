<template>
  <div class="container">
    <h1>Weapon Prestige</h1>
    <FiltersComponent prestige /><WeaponsComponent track="prestige" />
  </div>
</template>
<script setup>
import FiltersComponent from '@/components/FiltersComponent.vue'
import WeaponsComponent from '@/components/WeaponsComponent.vue'
</script>
<style scoped>
h1 {
  font-size: 21px;
  font-weight: 600;
  margin: 8px 0 20px;
}
</style>
