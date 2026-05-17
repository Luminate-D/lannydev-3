<script setup lang="ts">
</script>

<template>
  <div class="navigation">
    <template v-if="$route.path === '/'">
      <div class="nav-item">
        <div class="label">Notes</div>
        <router-link to="/notes" class="dot"></router-link>
      </div>
      <div class="nav-item">
        <div class="label">I made those</div>
        <router-link to="/imadethose" class="dot"></router-link>
      </div>
      <div class="nav-item">
        <div class="label">LannyForces</div>
        <a href="https://lf.lanny.dev" class="dot dot--purple"></a>
      </div>
    </template>

    <template v-else>
      <div class="nav-item">
        <div class="label">CLOSE</div>
        <router-link to="/" class="dot"></router-link>
      </div>
    </template>
  </div>

  <router-view></router-view>
</template>

<style scoped lang="scss">
@use '@/sass/variables' as *;

.navigation {
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 2.5rem;
  top: 1.5rem;
  gap: 1rem;

  width: max-content;

  z-index: 999;

  .nav-item {
    display: flex;
    height: 100%;
    align-items: center;
    place-content: flex-end;
    gap: 1rem;

    .label {
      font-size: 0.8rem;
      color: $text-muted-60;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      pointer-events: none;
    }

    .dot {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: $accent-strong;
      box-shadow: 0 0 14px $accent-glow;
      cursor: pointer;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      flex-shrink: 0;

      &:hover {
        transform: scale(1.15);
        box-shadow: 0 0 20px $accent-glow-strong;
      }

      &.dot--purple {
        background: $purple;
        box-shadow: 0 0 14px rgba(139, 92, 246, 0.75);

        &:hover {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.95);
        }
      }
    }
  }
}
</style>