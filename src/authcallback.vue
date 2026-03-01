<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const code = route.query.code;
  if(!code) return router.push('/');

  const res = await fetch('https://api.lanny.dev/authorize?code=' + code, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const data = await res.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);

  window.location.reload();
});
</script>

<template>

</template>

<style scoped lang="scss">

</style>