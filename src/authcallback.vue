<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const code = route.query.code;
  if(!code) return router.push('/');

  const res = await fetch('https://api.lanny.dev/authorize?code=' + code, {
    method: 'POST'
  });

  const data = await res.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  console.log(data);

  // window.location.href = '/';
});
</script>

<template>

</template>

<style scoped lang="scss">

</style>