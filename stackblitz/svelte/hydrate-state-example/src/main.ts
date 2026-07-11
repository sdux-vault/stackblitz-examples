/**
 * Mounts the hydrate example as the root Svelte application.
 * App renders ExampleView while the cell module owns Vault initialization.
 */
import { mount } from 'svelte';
import App from './app/App.svelte';
import './styles.css';

mount(App, { target: document.getElementById('app')! });
