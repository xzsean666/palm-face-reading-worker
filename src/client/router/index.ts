import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useUIStore } from "../stores/ui";
import { useUserStore } from "../stores/user";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    navMode?: "module" | "flow";
    hideNav?: boolean;
    requiresAuth?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: (to) => {
      const userStore = useUserStore();
      const isGuestSession =
        typeof window !== "undefined" && sessionStorage.getItem("tj_guest_session") === "1";
      if (!userStore.isWalletConnected && !isGuestSession) {
        return { path: "/login", query: to.query };
      }
      return { path: "/home", query: to.query };
    },
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
    meta: { title: "连接钱包", navMode: "flow", hideNav: true },
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
    path: "/recharge",
    name: "Recharge",
    component: () => import("../views/RechargeView.vue"),
    meta: { title: "服务点数充值", navMode: "flow" },
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

router.beforeEach((to) => {
  // 1. 拦截并持久化 URL 中的推荐人/邀请码参数 (ref / invite / code)
  const queryRef = (to.query.ref || to.query.invite || to.query.code) as string | undefined;
  if (queryRef && typeof queryRef === "string" && queryRef.trim()) {
    try {
      localStorage.setItem("tj_pending_referrer_code", queryRef.trim().toUpperCase());
    } catch {}
  }

  const userStore = useUserStore();
  const isGuest =
    typeof window !== "undefined" && sessionStorage.getItem("tj_guest_session") === "1";
  const hasAccess = userStore.isWalletConnected || isGuest;

  // 公开白名单页面
  const publicPaths = ["/login", "/about", "/splash"];
  const isPublic = publicPaths.includes(to.path) || to.path.startsWith("/invite/");

  // 如果已经连接钱包，访问 /login 则自动跳转去首页或指定 redirect
  if (to.path === "/login" && userStore.isWalletConnected && !to.query.switch) {
    const redirect = (to.query.redirect as string) || "/home";
    return redirect;
  }

  // 如果未连接钱包且未开启游客会话，访问非公开页面时强制跳转至 /login
  if (!hasAccess && !isPublic) {
    return {
      path: "/login",
      query: { ...to.query, redirect: to.fullPath },
    };
  }

  return true;
});

router.afterEach((to) => {
  const uiStore = useUIStore();
  const title = (to.meta.title as string) || "天机";
  const navMode = (to.meta.navMode as "module" | "flow") || "module";
  uiStore.setNav(title, navMode);
});

export default router;
