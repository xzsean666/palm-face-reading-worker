import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useUIStore } from "./stores/ui";
import "./style.css";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount("#app");

if (typeof window !== "undefined") {
  (window as any).__tj_router = router;
  (window as any).__tj_ui = useUIStore();
}
