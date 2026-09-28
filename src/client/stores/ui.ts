import { defineStore } from "pinia";
import { ref } from "vue";

export const useUIStore = defineStore("ui", () => {
  const drawerOpen = ref(false);
  const actionSheetOpen = ref(false);
  const navTitle = ref("天机");
  const navMode = ref<"module" | "flow">("module");
  const unreadCount = ref(1);
  const toastMessage = ref<string | null>(null);

  const faucetModalOpen = ref(false);

  let toastTimer: any = null;

  function openDrawer() {
    drawerOpen.value = true;
  }

  function closeDrawer() {
    drawerOpen.value = false;
  }

  function toggleDrawer() {
    drawerOpen.value = !drawerOpen.value;
  }

  function openActionSheet() {
    actionSheetOpen.value = true;
  }

  function closeActionSheet() {
    actionSheetOpen.value = false;
  }

  function openFaucetModal() {
    faucetModalOpen.value = true;
  }

  function closeFaucetModal() {
    faucetModalOpen.value = false;
  }

  function toggleFaucetModal() {
    faucetModalOpen.value = !faucetModalOpen.value;
  }

  function setNav(title: string, mode: "module" | "flow" = "module") {
    navTitle.value = title;
    navMode.value = mode;
  }

  function showToast(message: string, duration = 1500) {
    toastMessage.value = message;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage.value = null;
    }, duration);
  }

  return {
    drawerOpen,
    actionSheetOpen,
    faucetModalOpen,
    navTitle,
    navMode,
    unreadCount,
    toastMessage,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    openActionSheet,
    closeActionSheet,
    openFaucetModal,
    closeFaucetModal,
    toggleFaucetModal,
    setNav,
    showToast,
  };
});
