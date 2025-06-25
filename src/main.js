import { createApp } from 'vue'
import ToastService from 'primevue/toastservice';
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import Toast from 'primevue/toast';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'primeicons/primeicons.css'

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: "light"
        }
    },
    styled: true,
    pt: {
        button: {
            root: {
                style: {
                    'border-color': 'hsl(225, 10%, 75%)',
                    'color': 'black',
                    'background-color': '#f1f5f9',
                },
            }
        }
    }
});
app.component('Toast', Toast);
app.use(ToastService);
app.mount('#app');

