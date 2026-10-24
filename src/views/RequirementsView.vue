<template>
  <div class="container requirements">
    <h1>MW4 camo progression</h1>

    <table>
      <thead>
        <tr>
          <th>Stage</th>
          <th>Requirement</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Military</td>
          <td>{{ militaryCamos.length }} weapon-level unlocks per weapon.</td>
        </tr>
        <tr>
          <td>Special</td>
          <td>
            Weapon-specific challenges, with shared completion and mode-specific requirements.
          </td>
        </tr>
        <tr v-for="camo in completionistCamos" :key="camo.id">
          <td>{{ camo.name }}</td>
          <td>
            {{ prerequisiteText(camo, example) }}
            {{
              camo.award
                ? 'Awarded when the prerequisite is fulfilled in game.'
                : 'Then complete the applicable mode challenge.'
            }}
          </td>
        </tr>
      </tbody>
    </table>

    <p>
      Each mode has its own mastery track. Warzone challenge requirements are unpublished; shared
      unlocks earned in Multiplayer or DMZ remain visible there.
    </p>
  </div>
</template>
<script setup>
import { militaryCamos, completionistCamos } from '@/data/mw4/camos'

import { prerequisiteText } from '@/data/mw4/presentation'
import weapons from '@/data/weapons/index.js'
const example = weapons[0]
</script>
<style scoped>
h1 {
  font-size: 26px;
  margin: 25px 0;
}
p {
  margin: 20px 0;
  line-height: 1.7;
  color: #bbb;
}
table {
  width: 100%;
  text-align: left;
}
th,
td {
  padding: 15px;
  border-bottom: 1px solid #333;
  line-height: 1.5;
}
</style>
