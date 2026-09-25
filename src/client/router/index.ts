import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useUIStore } from "../stores/ui";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    navMode?: "module" | "flow";
    hideNav?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/splash",
    name: "Splash",
    component: () => import("../views/SplashView.vue"),
    meta: { title: "天机", navMode: "flow", hideNav: true },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
    meta: { title: "登录", navMode: "flow" },
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("../views/HomeView.vue"),
    meta: { title: "天机", navMode: "module" },
  },
  {
    path: "/feature/palm-face",
    name: "FeaturePalmFace",
    component: () => import("../views/FeaturePalmFaceView.vue"),
    meta: { title: "AI看相", navMode: "flow" },
  },
  {
    path: "/feature/:type/input",
    name: "FeatureInput",
    component: () => import("../views/FeatureInputView.vue"),
    meta: { title: "信息录入", navMode: "flow" },
  },
  {
    path: "/feature/:type/analyzing",
    name: "Analyzing",
    component: () => import("../views/AnalyzingView.vue"),
    meta: { title: "AI 推演中", navMode: "flow" },
  },
  {
    path: "/feature/:type/preview",
    name: "Preview",
    component: () => import("../views/PreviewView.vue"),
    meta: { title: "报告预览", navMode: "flow" },
  },
  {
    path: "/pay",
    name: "Pay",
    component: () => import("../views/PayView.vue"),
    meta: { title: "确认支付", navMode: "flow" },
  },
  {
    path: "/feature/:type/report",
    name: "Report",
    component: () => import("../views/ReportView.vue"),
    meta: { title: "完整报告", navMode: "flow" },
  },
  {
    path: "/vip",
    name: "Vip",
    component: () => import("../views/VipView.vue"),
    meta: { title: "会员中心", navMode: "module" },
  },
  {
    path: "/promote",
    name: "Promote",
    component: () => import("../views/PromoteView.vue"),
    meta: { title: "推广中心", navMode: "module" },
  },
  {
    path: "/promote/earnings",
    name: "Earnings",
    component: () => import("../views/EarningsView.vue"),
    meta: { title: "收益明细", navMode: "module" },
  },
  {
    path: "/me",
    name: "Profile",
    component: () => import("../views/ProfileView.vue"),
    meta: { title: "个人中心", navMode: "module" },
  },
  {
    path: "/me/records",
    name: "Records",
    component: () => import("../views/RecordsView.vue"),
    meta: { title: "测算记录", navMode: "module" },
  },
  {
    path: "/me/orders/:id",
    name: "OrderDetail",
    component: () => import("../views/OrderDetailView.vue"),
    meta: { title: "订单详情", navMode: "flow" },
  },
  {
    path: "/invite/:code",
    name: "Invite",
    component: () => import("../views/InviteView.vue"),
    meta: { title: "天机 AI预测大师", navMode: "flow" },
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/AboutView.vue"),
    meta: { title: "关于与帮助", navMode: "module" },
  },
  {
    path: "/stats",
    name: "Stats",
    component: () => import("../views/StatsView.vue"),
    meta: { title: "平台大盘", navMode: "module" },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/home",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  const uiStore = useUIStore();
  const title = (to.meta.title as string) || "天机";
  const navMode = (to.meta.navMode as "module" | "flow") || "module";
  uiStore.setNav(title, navMode);
});

export default router;
