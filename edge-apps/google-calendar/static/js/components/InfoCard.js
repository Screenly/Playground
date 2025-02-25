const { defineComponent } = Vue
import { html } from '../utils.js'

export default defineComponent({
  name: 'InfoCard',
  template: html`
    <div class="secondary-card info-card">
      <img id="brand-logo" src="static/img/screenly.svg" class="brand-logo" alt="Brand Logo" />
      <span class="info-text">Powered by Screenly</span>
    </div>
  `
})
