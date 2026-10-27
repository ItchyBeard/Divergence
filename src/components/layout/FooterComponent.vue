<script setup></script>
<template>
  <footer class="container">
    <div>
      Made by <a class="copyright" href="https://itchy-beard.co.uk/">ItchyBeard</a>. Inspired by
      <a class="copyright" href="https://emilcarlsson.se/">Emil Carlsson</a>.
    </div>
<!--    <span class="brand-wordmark footer-wordmark" tabindex="0">CamoVault</span>-->
    <div>
      <router-link to="/about">About</router-link>
      <router-link to="/requirements">Requirements</router-link>
      <router-link to="/settings">Settings</router-link>
      <a href="https://github.com/itchybeard/divergence" class="icon"><IconComponent name="github" /></a>
      <a href="https://discord.gg/HswvED9v6a" class="icon"><IconComponent name="discord" /></a>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer-wordmark {
  @include divergence-camouflage-background;
  position: absolute;
  left: 50%;
  bottom: calc(50px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  font-size: 18px;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0.4;
  transition: opacity 250ms ease;

  &:hover,
  &:focus-visible {
    opacity: 1;
  }

  @media (hover: none), (pointer: coarse) {
    opacity: 0.4;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
</style>
