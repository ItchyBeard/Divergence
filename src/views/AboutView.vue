<template>
  <div class="container about">
    <header class="about-intro">
      <h1>Simple, lightweight &amp; intuitive</h1>
      <p>
        Divergence is a free Modern Warfare 4 camouflage tracker for Multiplayer, DMZ and Warzone.
        Straightforward camo tracking, with progress saved in your browser — no accounts or cloud
        storage required.
      </p>
    </header>

    <section aria-label="Tracker features" class="features">
      <article v-for="feature in features" :key="feature.title" class="feature">
        <div class="feature-icon" aria-hidden="true">
          <IconComponent :name="feature.icon" size="24" />
        </div>
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.description }}</p>
      </article>
    </section>

    <section aria-labelledby="previous-trackers-heading" class="about-section">
      <h2 id="previous-trackers-heading">Previous trackers</h2>
      <p>
        Looking for camouflage trackers from previous Call of Duty games? Explore the earlier
        trackers that led to Divergence.
      </p>
      <div class="trackers">
        <a
          v-for="tracker in trackers"
          :key="tracker.title"
          class="tracker"
          :href="tracker.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`${tracker.title} (opens in a new tab)`">
          <img :src="tracker.icon" alt="" width="32" height="32" />
          <span>{{ tracker.title }}</span>
          <IconComponent
            class="external-icon"
            name="external-link-alt"
            size="18"
            aria-hidden="true" />
        </a>
      </div>
    </section>

    <section aria-labelledby="open-source-heading" class="about-section">
      <h2 id="open-source-heading">Open source</h2>
      <p>
        Built with <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer">Vue</a>,
        hosted on
        <a href="https://www.netlify.com/" target="_blank" rel="noopener noreferrer">Netlify</a>.
        The source is available on
        <a
          href="https://github.com/ItchyBeard/divergence"
          target="_blank"
          rel="noopener noreferrer">
          GitHub</a
        >.
      </p>
      <p>Made by ItchyBeard. Inspired by Emil Carlsson.</p>
    </section>

    <section aria-labelledby="support-heading" class="about-section">
      <h2 id="support-heading">Support me</h2>
      <p>
        If Divergence has helped with your camo grind, you can support its development by
        <a href="https://www.buymeacoffee.com/itchybeard" target="_blank" rel="noopener noreferrer">
          buying me a beer</a
        >. It's always appreciated!
      </p>
    </section>
  </div>
</template>

<script setup>
import IconComponent from '@/components/IconComponent.vue'
import singularityIcon from '@/assets/singularity.png'
import nebulaIcon from '@/assets/nebula.png'
import interstellarIcon from '@/assets/interstellar.png'
import orionIcon from '@/assets/orion.png'
import vanguardIcon from '@/assets/vanguard.png'
import coldWarIcon from '@/assets/coldwar.png'
import damascusIcon from '@/assets/damascus.png'

const features = [
  {
    title: 'Autosaving',
    description: 'Your progress is automatically saved in your browser. No account needed.',
    icon: 'save',
  },
  {
    title: 'Responsive',
    description: 'Track your progress on desktop, tablets and mobile devices.',
    icon: 'mobile-android',
  },
  {
    title: 'Export/Import',
    description: 'Save a backup and transfer your progress between browsers or devices.',
    icon: 'file-export',
  },
  {
    title: 'Filterable',
    description:
      'Search, sort and filter weapons to find your next challenge and track completion.',
    icon: 'filter',
  },
  {
    title: 'Ad-free',
    description: 'No advertising clutter. Just you and the camo grind.',
    icon: 'image-slash',
  },
  {
    title: 'Share Progress',
    description: 'Create an image of your camo completion progress to share with others.',
    icon: 'download-alt',
  },
]

const trackers = [
  {
    title: 'Black Ops 7',
    icon: singularityIcon,
    url: 'https://singularity-tracker.netlify.app/',
  },
  {
    title: 'Black Ops 6',
    icon: nebulaIcon,
    url: 'https://nebula.emca.app',
  },
  {
    title: 'Modern Warfare III',
    icon: interstellarIcon,
    url: 'https://interstellar.emca.app',
  },
  { title: 'Modern Warfare II', icon: orionIcon, url: 'https://orion.emca.app' },
  { title: 'Vanguard', icon: vanguardIcon, url: 'https://vanguard.emca.app' },
  { title: 'Black Ops Cold War', icon: coldWarIcon, url: 'https://coldwar.vercel.app' },
  { title: 'Modern Warfare (2019)', icon: damascusIcon, url: 'https://damascus.vercel.app/' },
]
</script>

<style lang="scss" scoped>
.about {
  padding-bottom: 20px;
}

h1 {
  font-size: 24px;
  line-height: 1.3;
  margin: 10px 0 16px;
}

h2 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 12px;
}

p {
  color: #bbb;
  font-size: 16px;
  line-height: 1.7;
}

a:focus-visible {
  outline: 2px solid #ac91db;
  outline-offset: 4px;
}

.features,
.trackers {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: $tablet) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: $mobile) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.features {
  margin: 28px 0 36px;
}

.feature {
  background: $elevation-1-color;
  border: 1px solid $elevation-3-color;
  border-radius: $border-radius;
  padding: 22px;
  transition:
    background-color $transition,
    border-color $transition;

  &:hover {
    background: $elevation-2-color;
    border-color: #756a9b;
  }

  h2 {
    font-size: 16px;
    margin-bottom: 8px;
  }

  p {
    line-height: 1.5;
  }
}

.feature-icon {
  align-items: center;
  background: $divergence-gradient;
  border-radius: $border-radius * 2;
  display: inline-flex;
  justify-content: center;
  height: 44px;
  width: 44px;
  margin-bottom: 16px;
}

.about-section {
  margin-top: 32px;

  p + p {
    margin-top: 8px;
  }
}

.trackers {
  margin-top: 20px;
  gap: 12px;
}

.tracker {
  align-items: center;
  background: $elevation-2-color;
  border: 1px solid $elevation-3-color;
  border-radius: $border-radius;
  color: $text-color;
  display: flex;
  gap: 14px;
  min-height: 76px;
  padding: 16px;
  transition:
    background-color $transition,
    border-color $transition;

  &:hover {
    background: $elevation-3-color;
    border-color: #756a9b;
    text-decoration: none;
  }

  img {
    flex-shrink: 0;
    object-fit: contain;
  }

  span {
    line-height: 1.5;
  }

  .external-icon {
    flex-shrink: 0;
    margin-left: auto;
    opacity: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature,
  .tracker {
    transition: none;
  }
}
</style>
