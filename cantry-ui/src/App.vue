<template>
  <SpeechRecognition />
</template>

<script>
import SpeechRecognition from './components/SpeechRecognition.vue';

export default {
  name: 'App',
  components: {
    SpeechRecognition,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
