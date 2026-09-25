import { defineStore } from "pinia";
import { ref } from "vue";

export interface CategoryInfo {
  id: string;
  name: string;
  classic: string;
  desc: string;
  icon: string;
  route: string;
}

export const CATEGORIES_CONFIG: Record<string, CategoryInfo> = {
  palm_reading: {
    id: "palm_reading",
    name: "掌纹手相",
    classic: "麻衣神相",
    desc: "解读手掌三大主线，窥探财富健康与情感玄机",
    icon: "🖐️",
    route: "/feature/palm_reading/input",
  },
  face_reading: {
    id: "face_reading",
    name: "面部相学",
    classic: "麻衣神相",
    desc: "观相貌知命理，三停五岳十二宫 AI 深度解析",
    icon: "🧑",
    route: "/feature/face_reading/input",
  },
  love_match: {
    id: "love_match",
    name: "我们合不合",
    classic: "三命通会",
    desc: "双人生辰八字合婚，情感羁绊与相处相生建议",
    icon: "💞",
    route: "/feature/love_match/input",
  },
  phone_plate: {
    id: "phone_plate",
    name: "测手机车牌",
    classic: "易经数理",
    desc: "81数理吉凶能量场透析，趋吉避凶数码分析",
    icon: "📱",
    route: "/feature/phone_plate/input",
  },
  name_test: {
    id: "name_test",
    name: "测姓名店名",
    classic: "三才五格",
    desc: "天格地格人格剖象，五行喜忌平衡打分",
    icon: "✍️",
    route: "/feature/name_test/input",
  },
  auspicious_date: {
    id: "auspicious_date",
    name: "择日吉日",
    classic: "协纪辨方书",
    desc: "嫁娶、开业、动土十二建星黄道吉日精准择选",
    icon: "📅",
    route: "/feature/auspicious_date/input",
  },
  future_fortune: {
    id: "future_fortune",
    name: "未来运程",
    classic: "滴天髓",
    desc: "大运起伏与流年转折，财官运势前瞻图谱",
    icon: "🔮",
    route: "/feature/future_fortune/input",
  },
  bazi: {
    id: "bazi",
    name: "八字推测",
    classic: "渊海子平",
    desc: "四柱排盘十神旺衰，五行喜用全盘推算",
    icon: "☯️",
    route: "/feature/bazi/input",
  },
  qimen_decision: {
    id: "qimen_decision",
    name: "成败预测",
    classic: "奇门遁甲",
    desc: "九星八门九宫阵盘，抉择成败时空吉凶断",
    icon: "⚔️",
    route: "/feature/qimen_decision/input",
  },
  personal_naming: {
    id: "personal_naming",
    name: "个人起名",
    classic: "周易名学",
    desc: "补足八字喜用神，音律意蕴吉祥命名",
    icon: "👶",
    route: "/feature/personal_naming/input",
  },
  company_naming: {
    id: "company_naming",
    name: "公司取名",
    classic: "玄空商道",
    desc: "结合法人命盘与行业五行，吸纳商业财气",
    icon: "🏢",
    route: "/feature/company_naming/input",
  },
};

export const useDivinationStore = defineStore("divination", () => {
  const currentCategory = ref<string>("bazi");
  const currentForm = ref<Record<string, any>>({});
  const lastResult = ref<any>(null);

  function setCategory(cat: string) {
    currentCategory.value = cat;
  }

  function setForm(formData: Record<string, any>) {
    currentForm.value = { ...formData };
  }

  function setResult(res: any) {
    lastResult.value = res;
    sessionStorage.setItem("tj_last_result", JSON.stringify(res));
  }

  return {
    currentCategory,
    currentForm,
    lastResult,
    setCategory,
    setForm,
    setResult,
  };
});
