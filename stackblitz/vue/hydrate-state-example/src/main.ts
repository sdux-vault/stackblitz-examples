/**
 * Mounts the hydrate example as the root Vue application.
 * App renders ExampleView while the cell module owns Vault initialization.
 */
import { createApp } from 'vue';
import App from './app/App.vue';
import './styles.css';

createApp(App).mount('#app');
