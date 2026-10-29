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
      <h2 id="previous-trackers-heading">Previous Trackers</h2>
      <p>
        Looking for camouflage trackers from previous Call of Duty games? Explore the earlier
        trackers that led to Divergence.
      </p>
      <div class="trackers">
        <a
          v-for="tracker in trackers"
          :key="tracker.title"
          class="tracker"
          :style="{ '--tracker-accent': tracker.accent }"
          :href="tracker.url"
          target="_blank"
          rel="noopener noreferrer"
          @pointerenter="updateTrackerGlow"
          @pointermove="updateTrackerGlow"
          :aria-label="`${tracker.title} — ${tracker.game} (opens in a new tab)`">
          <img :src="tracker.icon" alt="" width="32" height="32" />
          <div class="tracker-copy">
            <h3 class="tracker-title brand-wordmark">{{ tracker.title }}</h3>
            <span class="tracker-game">{{ tracker.game }}</span>
          </div>
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

function updateTrackerGlow(event) {
  if (
    event.pointerType === 'touch' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    return

  const card = event.currentTarget
  const bounds = card.getBoundingClientRect()
  card.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`)
  card.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`)
}

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
    title: 'SINGULARITY',
    game: 'Black Ops 7',
    accent: '#d11f91',
    icon: singularityIcon,
    url: 'https://singularity-tracker.netlify.app/',
  },
  {
    title: 'NEBULA',
    game: 'Black Ops 6',
    accent: '#d11f91',
    icon: nebulaIcon,
    url: 'https://nebula.emca.app/',
  },
  {
    title: 'INTERSTELLAR',
    game: 'Modern Warfare III',
    accent: '#d11f91',
    icon: interstellarIcon,
    url: 'https://interstellar.emca.app/',
  },
  {
    title: 'ORION',
    game: 'Modern Warfare II',
    accent: '#9560ce',
    icon: orionIcon,
    url: 'https://orion.emca.app/',
  },
  {
    title: 'VANGUARD',
    game: 'Call of Duty: Vanguard',
    accent: '#ff9f00',
    icon: vanguardIcon,
    url: 'https://vanguard.emca.app/',
  },
  {
    title: 'COLDWAR',
    game: 'Black Ops Cold War',
    accent: '#d7d7d7',
    icon: coldWarIcon,
    url: 'https://coldwar.vercel.app/',
  },
  {
    title: 'DAMASCUS',
    game: 'Modern Warfare (2019)',
    accent: '#5f27cd',
    icon: damascusIcon,
    url: 'https://damascus.vercel.app/',
  },
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
  border-left: 2px solid var(--tracker-accent);
  border-radius: $border-radius;
  color: $text-color;
  display: flex;
  gap: 14px;
  min-height: 76px;
  padding: 16px;
  position: relative;
  isolation: isolate;
  transition:
    background-color $transition,
    border-color $transition;

  &::before,
  &::after {
    border-radius: inherit;
    content: '';
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity $transition;
  }

  &::before {
    inset: 0;
    z-index: -1;
    background: radial-gradient(
      260px circle at var(--glow-x, 50%) var(--glow-y, 50%),
      color-mix(in srgb, var(--tracker-accent) 18%, transparent),
      transparent 75%
    );
  }

  &::after {
    inset: -1px;
    padding: 1px;
    background: radial-gradient(
      180px circle at var(--glow-x, 50%) var(--glow-y, 50%),
      color-mix(in srgb, var(--tracker-accent) 75%, white),
      transparent 80%
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      text-decoration: none;

      &::before,
      &::after {
        opacity: 1;
      }
    }
  }

  &:focus-visible {
    border-color: var(--tracker-accent);
    text-decoration: none;

    &::before,
    &::after {
      opacity: 1;
    }
  }

  img {
    flex-shrink: 0;
    object-fit: contain;
  }

  .tracker-copy {
    min-width: 0;
  }

  .tracker-title {
    font-size: 16px;
    margin: 0 0 4px;
    overflow-wrap: anywhere;
  }

  .tracker-game {
    color: #bbb;
    font-family: $font-family;
    font-size: 13px;
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
  .tracker,
  .tracker::before,
  .tracker::after {
    transition: none;
  }
}
</style>
