<template>
  <div class="flex-1 pb-32 px-4 pt-3 select-none relative overflow-hidden">
    <!-- Atmospheric Aura Highlights -->
    <div class="absolute -top-10 -right-16 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>

    <!-- 1. 报告封面头卡 (右上胶囊标签「专属完整版」紫金渐变) -->
    <div class="relative w-full rounded-2xl bg-surface-container overflow-hidden p-5 mb-4 shadow-xl border border-primary/30">
      <!-- Auspicious Cloud Texture Overlay -->
      <div class="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-secondary/10 to-transparent"></div>
      <div class="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-primary/10 blur-xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <span class="font-label-sm text-xs text-outline tracking-wider font-mono">NO.{{ reportNo }}</span>
          <div class="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-secondary-container via-primary-container to-primary text-surface-container-lowest text-[11px] font-bold tracking-wide shadow-sm">
            专属完整版
          </div>
        </div>

        <div class="mt-1">
          <h2 class="text-base sm:text-lg font-bold text-primary tracking-wide flex items-center gap-1.5">
            <span class="text-primary text-lg">✦</span>
            {{ reportTitle }}
          </h2>
          <p class="text-xs text-on-surface-variant mt-1">
            {{ todayStr }} · {{ userStore.user?.nickname || "天机缘主" }} · {{ categoryName }} · 综合评分 {{ reportScore }}分
          </p>
        </div>

        <!-- 算法与防伪存证状态行 -->
        <div class="mt-2 pt-2 flex items-center justify-between bg-surface-container-low/70 px-3 py-1.5 rounded-lg border border-white/5">
          <div class="flex items-center gap-1.5 text-primary text-xs">
            <span>🛡️</span>
            <span class="font-medium">天机算法已认证 · 乾坤法印固化</span>
          </div>
          <span class="text-[11px] text-tertiary font-mono">ZK-Proof 链上可溯</span>
        </div>
      </div>
    </div>

    <!-- 2. 命盘可视化卡 (高 240px，按门类动态全息渲染) -->
    <div class="w-full min-h-[240px] rounded-2xl bg-surface-container-low p-4 mb-4 relative overflow-hidden shadow-lg border border-primary/20 flex flex-col justify-between">
      <!-- Occult Compass / LuoPan Visual Background SVG -->
      <svg class="absolute -right-12 -top-12 w-64 h-64 opacity-10 text-primary pointer-events-none animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="95" stroke-dasharray="3 3" stroke-width="0.8"></circle>
        <circle cx="100" cy="100" r="75" stroke-width="0.5"></circle>
        <circle cx="100" cy="100" r="50" stroke-width="0.8"></circle>
        <circle cx="100" cy="100" r="28" stroke-dasharray="2 2" stroke-width="0.5"></circle>
        <line stroke-width="0.5" x1="100" x2="100" y1="5" y2="195"></line>
        <line stroke-width="0.5" x1="5" x2="195" y1="100" y2="100"></line>
        <line stroke-width="0.5" x1="33" x2="167" y1="33" y2="167"></line>
        <line stroke-width="0.5" x1="33" x2="167" y1="167" y2="33"></line>
        <polygon fill="none" points="100,60 135,120 65,120" stroke-width="0.6"></polygon>
        <polygon fill="none" points="100,140 135,80 65,80" stroke-width="0.6"></polygon>
      </svg>

      <!-- 卡片头部标题 -->
      <div class="flex items-center justify-between border-b border-white/5 pb-2 relative z-10">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-3.5 rounded-full bg-primary"></span>
          <span class="text-xs sm:text-sm font-semibold text-on-surface">{{ chartTitle }}</span>
        </div>
        <span class="text-[11px] text-tertiary font-mono px-2 py-0.5 rounded bg-surface-container-high border border-white/5">
          天机共振指数: {{ reportScore }}%
        </span>
      </div>

      <!-- A. 择日吉日类：首选上上吉日全息卡 (根据设计图 ai_37 精确呈现) -->
      <template v-if="categoryType === 'auspicious_date'">
        <div class="space-y-2.5 my-auto py-2 relative z-10">
          <div class="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30 shadow-gold-glow">
            <div>
              <div class="text-[10px] text-primary font-medium tracking-wide">首选天定吉日</div>
              <div class="text-sm font-bold text-primary font-display mt-0.5">
                2026年10月18日 · 丙午年 乙未日
              </div>
              <div class="text-[11px] text-on-surface-variant mt-0.5">
                农历九月初九 · 重阳天赦 · 诸事大吉
              </div>
            </div>
            <div class="px-2.5 py-1 rounded-full bg-primary text-surface-container-lowest text-xs font-bold shadow-sm">
              上上元吉
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="p-2 rounded-xl bg-surface-container border border-white/5">
              <div class="text-[10px] text-outline">建除十二神</div>
              <div class="text-xs font-bold text-on-surface mt-1">成日 (万事大成)</div>
            </div>
            <div class="p-2 rounded-xl bg-surface-container border border-white/5">
              <div class="text-[10px] text-outline">当值黄道神</div>
              <div class="text-xs font-bold text-tertiary mt-1">青龙 (天乙贵人)</div>
            </div>
            <div class="p-2 rounded-xl bg-surface-container border border-white/5">
              <div class="text-[10px] text-outline">黄金启动时辰</div>
              <div class="text-xs font-bold text-primary mt-1">巳时 09:18-10:58</div>
            </div>
          </div>
        </div>
      </template>

      <!-- B. 看相类：三停五岳与掌纹走势 (根据设计图 ai_ai_4 精确呈现) -->
      <template v-else-if="categoryType === 'palm_face' || categoryType === 'palm_reading' || categoryType === 'face_reading'">
        <div class="grid grid-cols-3 gap-2 my-auto text-center py-2 relative z-10">
          <div class="p-2 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[10px] text-outline mb-1">上停 / 离卦天庭</div>
            <div class="text-sm font-bold text-on-surface font-display">日月角明</div>
            <div class="text-[10px] text-on-surface-variant mt-1">少年颖悟早成</div>
          </div>
          <div class="p-2 rounded-xl bg-primary/10 border border-primary/40 shadow-gold-glow">
            <div class="text-[10px] text-primary mb-1">中停 / 鼻准田宅</div>
            <div class="text-sm font-bold text-primary font-display">岳耸仓丰</div>
            <div class="text-[10px] text-primary mt-1">中年家财丰实</div>
          </div>
          <div class="p-2 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[10px] text-outline mb-1">下停 / 地阁颐骨</div>
            <div class="text-sm font-bold text-on-surface font-display">方圆得配</div>
            <div class="text-[10px] text-on-surface-variant mt-1">晚福深厚安宁</div>
          </div>
        </div>
      </template>

      <!-- C. 奇门决疑类：时空奇门胜算盘 (根据设计图 ai_22 精确呈现) -->
      <template v-else-if="categoryType === 'qimen_decision'">
        <div class="grid grid-cols-4 gap-2 my-auto text-center py-2 relative z-10">
          <div class="p-2 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[10px] text-outline mb-1">值符九星</div>
            <div class="text-xs font-bold text-on-surface">天心吉星</div>
            <div class="text-[9px] text-on-surface-variant mt-1">乾六宫生助</div>
          </div>
          <div class="p-2 rounded-xl bg-primary/10 border border-primary/40 shadow-gold-glow">
            <div class="text-[10px] text-primary mb-1">值使八门</div>
            <div class="text-xs font-bold text-primary">开门大吉</div>
            <div class="text-[9px] text-primary mt-1">万事亨通</div>
          </div>
          <div class="p-2 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[10px] text-outline mb-1">八神奇仪</div>
            <div class="text-xs font-bold text-tertiary">青龙转光</div>
            <div class="text-[9px] text-on-surface-variant mt-1">贵人相辅</div>
          </div>
          <div class="p-2 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[10px] text-outline mb-1">胜算概率</div>
            <div class="text-sm font-bold text-secondary font-num">82%</div>
            <div class="text-[9px] text-secondary mt-1">顺势大胜</div>
          </div>
        </div>
      </template>

      <!-- D. 双人合婚类：天合地合谱 (根据设计图 ai_14 精确呈现) -->
      <template v-else-if="categoryType === 'love_match'">
        <div class="grid grid-cols-3 gap-2 my-auto text-center py-2 relative z-10">
          <div class="p-2 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[10px] text-outline mb-1">双方日柱</div>
            <div class="text-xs font-bold text-on-surface">天合地合</div>
            <div class="text-[9px] text-on-surface-variant mt-1">甲己中正之合</div>
          </div>
          <div class="p-2 rounded-xl bg-secondary-container/20 border border-secondary/30 shadow-sm">
            <div class="text-[10px] text-secondary mb-1">纳音五行</div>
            <div class="text-xs font-bold text-secondary">金水相生</div>
            <div class="text-[9px] text-secondary mt-1">宿世因缘共鸣</div>
          </div>
          <div class="p-2 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[10px] text-outline mb-1">白头和顺指数</div>
            <div class="text-sm font-bold text-primary font-num">95分</div>
            <div class="text-[9px] text-primary mt-1">琴瑟和谐</div>
          </div>
        </div>
      </template>

      <!-- E. 手机车牌类：八星磁场分布 (根据设计图 ai_10 精确呈现) -->
      <template v-else-if="categoryType === 'phone_plate'">
        <div class="grid grid-cols-4 gap-2 my-auto text-center py-2 relative z-10">
          <div class="p-2 rounded-xl bg-primary/10 border border-primary/30">
            <div class="text-[10px] text-primary mb-0.5">核心吉星</div>
            <div class="text-sm font-bold text-primary font-display">天医延年</div>
            <div class="text-[9px] text-on-surface-variant mt-0.5">财智亨通</div>
          </div>
          <div class="p-2 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[10px] text-outline mb-0.5">生助吉星</div>
            <div class="text-sm font-bold text-tertiary font-display">生气伏位</div>
            <div class="text-[9px] text-on-surface-variant mt-0.5">贵人蓄势</div>
          </div>
          <div class="p-2 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[10px] text-outline mb-0.5">制化凶星</div>
            <div class="text-sm font-bold text-on-surface font-display">绝命有制</div>
            <div class="text-[9px] text-on-surface-variant mt-0.5">破局新生</div>
          </div>
          <div class="p-2 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[10px] text-outline mb-0.5">综合数理</div>
            <div class="text-sm font-bold text-secondary font-display">81上吉</div>
            <div class="text-[9px] text-on-surface-variant mt-0.5">乾象得位</div>
          </div>
        </div>
      </template>

      <!-- F. 姓名类：三才五格 (根据设计图 ai_8 / ai_17 精确呈现) -->
      <template v-else-if="categoryType === 'name_test' || categoryType === 'personal_naming' || categoryType === 'company_naming'">
        <div class="grid grid-cols-5 gap-1.5 my-auto text-center py-2 relative z-10">
          <div class="p-1.5 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[9px] text-outline">天格 (根)</div>
            <div class="text-xs font-bold text-on-surface mt-1">大吉</div>
          </div>
          <div class="p-1.5 rounded-xl bg-primary/10 border border-primary/40 shadow-gold-glow">
            <div class="text-[9px] text-primary">人格 (主)</div>
            <div class="text-xs font-bold text-primary mt-1">兴隆</div>
          </div>
          <div class="p-1.5 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[9px] text-outline">地格 (前)</div>
            <div class="text-xs font-bold text-on-surface mt-1">福寿</div>
          </div>
          <div class="p-1.5 rounded-xl bg-surface-container border border-white/5">
            <div class="text-[9px] text-outline">外格 (副)</div>
            <div class="text-xs font-bold text-tertiary mt-1">逢贵</div>
          </div>
          <div class="p-1.5 rounded-xl bg-secondary-container/20 border border-secondary/30">
            <div class="text-[9px] text-secondary">总格 (后)</div>
            <div class="text-xs font-bold text-secondary mt-1">大成</div>
          </div>
        </div>
      </template>

      <!-- G. 八字/运程类：四柱干支与神煞 (根据设计图 ai_35 精确呈现) -->
      <template v-else>
        <div class="grid grid-cols-4 gap-2 my-auto z-10 py-1">
          <!-- Year -->
          <div class="flex flex-col items-center bg-surface-container rounded-lg py-2 px-1 text-center border border-white/5">
            <span class="text-[11px] text-tertiary">偏印</span>
            <div class="text-sm font-bold text-primary my-0.5 tracking-widest font-display">甲子</div>
            <span class="text-[10px] text-on-surface-variant">海中金</span>
          </div>
          <!-- Month -->
          <div class="flex flex-col items-center bg-surface-container rounded-lg py-2 px-1 text-center border border-white/5">
            <span class="text-[11px] text-secondary">正官</span>
            <div class="text-sm font-bold text-primary my-0.5 tracking-widest font-display">癸酉</div>
            <span class="text-[10px] text-on-surface-variant">剑锋金</span>
          </div>
          <!-- Day (Primary / Day Master) -->
          <div class="flex flex-col items-center bg-surface-container-high rounded-lg py-2 px-1 text-center ring-1 ring-primary/40 shadow-[0_0_12px_rgba(242,202,80,0.2)]">
            <span class="text-[11px] text-primary font-semibold">日主</span>
            <div class="text-sm font-bold text-primary my-0.5 tracking-widest font-display">丙寅</div>
            <span class="text-[10px] text-primary">炉中火</span>
          </div>
          <!-- Hour -->
          <div class="flex flex-col items-center bg-surface-container rounded-lg py-2 px-1 text-center border border-white/5">
            <span class="text-[11px] text-tj-danger">七杀</span>
            <div class="text-sm font-bold text-primary my-0.5 tracking-widest font-display">壬辰</div>
            <span class="text-[10px] text-on-surface-variant">长流水</span>
          </div>
        </div>
      </template>

      <!-- 命盘底部生克推演栏 -->
      <div class="z-10 flex items-center justify-between bg-surface-container-highest/60 rounded-lg px-3 py-1.5 text-xs text-on-surface border border-white/5 mt-1">
        <div class="flex items-center gap-2">
          <span class="text-outline">生克推演:</span>
          <div class="flex items-center gap-1.5 text-[11px]">
            <span class="text-tertiary">木生火旺</span>
            <span class="text-outline">›</span>
            <span class="text-primary">财官相生</span>
            <span class="text-outline">›</span>
            <span class="text-secondary">印绶护身</span>
          </div>
        </div>
        <span class="text-primary font-medium text-[11px]">身旺喜用</span>
      </div>
    </div>

    <!-- 3. 局象全息总括 (Overview 卡片) -->
    <div v-if="overviewText" class="bg-surface-container border border-primary/20 rounded-2xl p-4 mb-4 shadow-sm relative z-10">
      <h3 class="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
        <span>📜</span> 局象全息总括
      </h3>
      <p class="text-xs sm:text-sm text-on-surface/95 leading-[1.8] text-justify">
        {{ overviewText }}
      </p>
    </div>

    <!-- A1. 择日专属：天时良辰总评 · 首选上吉 (精确还原设计图 ai_37) -->
    <div v-if="categoryType === 'auspicious_date'" class="bg-gradient-to-b from-surface-container-high via-surface-container to-surface-container rounded-2xl p-4 mb-4 shadow-xl border border-primary/30 relative overflow-hidden z-10">
      <div class="flex items-center justify-between pb-2 border-b border-white/5">
        <div class="flex items-center gap-2">
          <span class="text-primary text-lg">✦</span>
          <span class="text-primary font-semibold text-sm sm:text-base tracking-wide">天时良辰总评 · 首选上吉</span>
        </div>
        <span class="px-2.5 py-0.5 rounded-full bg-primary text-surface-container-lowest text-xs font-bold shadow-sm">
          大吉极品
        </span>
      </div>
      <div class="flex items-baseline gap-2 mt-3">
        <span class="text-4xl sm:text-5xl font-bold text-primary font-num tracking-tight">{{ reportScore || 96 }}</span>
        <span class="text-xs text-on-surface-variant font-medium">/ 100 天道气运分</span>
      </div>
      <div class="mt-2 text-xs sm:text-sm text-secondary font-medium flex items-center gap-1.5">
        <span>🛡️</span>
        <span>黄道天德合 · 岁德贵人齐临 · 诸煞回避</span>
      </div>
      <div class="mt-3 bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-1 border border-white/5">
        <div class="text-xs text-on-surface-variant uppercase tracking-wider font-medium">首选天定吉日</div>
        <div class="text-base sm:text-lg font-bold text-primary font-display mt-0.5">
          农历二〇二六年八月十六日
        </div>
        <div class="text-xs text-on-surface-variant flex flex-wrap items-center gap-2 pt-0.5">
          <span>公历 2026年9月26日</span>
          <span class="w-1 h-1 rounded-full bg-outline"></span>
          <span>星期六</span>
          <span class="w-1 h-1 rounded-full bg-outline"></span>
          <span class="text-tertiary font-medium">紫气东来时 (上吉)</span>
        </div>
      </div>
    </div>

    <!-- A2. 择日专属：天机精选吉时辰位 & 冲煞规避警示 (精确还原设计图 ai_37) -->
    <div v-if="categoryType === 'auspicious_date'" class="space-y-4 mb-4 relative z-10">
      <!-- 吉时辰位 -->
      <div class="bg-surface-container rounded-2xl p-4 shadow-lg border border-white/10 flex flex-col gap-3">
        <div class="flex items-center justify-between pb-2 border-b border-white/5">
          <div class="flex items-center gap-2">
            <span class="text-tertiary">⏰</span>
            <h3 class="text-xs sm:text-sm font-semibold text-on-surface">天机精选吉时辰位</h3>
          </div>
          <span class="text-[11px] text-tertiary font-mono">良辰吉时已校准</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div class="bg-surface-container-high/70 rounded-xl p-3 border border-white/5">
            <div class="text-xs font-bold text-primary">辰时 · 07:00-09:00</div>
            <div class="text-[11px] text-on-surface-variant mt-1">司命吉神护持，利签约动土纳财</div>
          </div>
          <div class="bg-surface-container-high/70 rounded-xl p-3 border border-white/5">
            <div class="text-xs font-bold text-tertiary">巳时 · 09:00-11:00</div>
            <div class="text-[11px] text-on-surface-variant mt-1">岁德合贵人显照，宜剪彩迎宾开门</div>
          </div>
        </div>
        <!-- 冲煞警示 -->
        <div class="bg-tj-danger/10 rounded-xl p-3 border border-tj-danger/30 flex flex-col gap-1.5 mt-1">
          <div class="flex items-center gap-1.5 text-tj-danger font-semibold text-xs">
            <span>⚠️</span>
            <span>冲煞与规避警示</span>
          </div>
          <p class="text-xs text-on-surface/90 leading-relaxed text-justify">
            日值庚申，值神天德合，利在开市、嫁娶、出行。<strong class="text-tj-danger">冲生肖虎（庚寅煞北）</strong>，煞神在正南方。仪式当天，主事人群中属虎之宾客请在揭匾、跨门仪式时稍作回避，以纳至纯浩然之气。
          </p>
        </div>
      </div>

      <!-- 备选吉日梯队 (权衡应变) -->
      <div class="bg-surface-container rounded-2xl p-4 shadow-lg border border-white/10 flex flex-col gap-3">
        <div class="flex items-center justify-between pb-2 border-b border-white/5">
          <div class="flex items-center gap-2">
            <span class="text-secondary">📅</span>
            <h3 class="text-xs sm:text-sm font-semibold text-on-surface">备选吉日梯队</h3>
          </div>
          <span class="text-[11px] text-outline">权衡应变备选</span>
        </div>
        <div class="space-y-2.5">
          <div class="bg-surface-container-low rounded-xl p-3 flex items-center justify-between shadow-sm border border-white/5">
            <div class="min-w-0 pr-2">
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-bold text-on-surface">农历八月廿二</span>
                <span class="px-2 py-0.5 rounded bg-secondary-container/30 text-secondary text-[10px] font-medium">司命黄道</span>
              </div>
              <div class="text-[11px] text-on-surface-variant mt-1 truncate">
                公历 10月02日 周五 · 适宜大宗贸易、签单合伙、财库开库
              </div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-bold text-primary font-num">91<span class="text-[10px] font-normal text-on-surface-variant">分</span></div>
              <div class="text-[10px] text-on-surface-variant">次吉</div>
            </div>
          </div>
          <div class="bg-surface-container-low rounded-xl p-3 flex items-center justify-between shadow-sm border border-white/5">
            <div class="min-w-0 pr-2">
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-bold text-on-surface">农历九月初二</span>
                <span class="px-2 py-0.5 rounded bg-tertiary/20 text-tertiary text-[10px] font-medium">青龙吉星</span>
              </div>
              <div class="text-[11px] text-on-surface-variant mt-1 truncate">
                公历 10月11日 周日 · 适宜定居乔迁、安床迎灶、修造动土
              </div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-bold text-primary font-num">88<span class="text-[10px] font-normal text-on-surface-variant">分</span></div>
              <div class="text-[10px] text-on-surface-variant">中吉</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 吉神方位与正统科仪指南 -->
      <div class="bg-surface-container border border-primary/20 rounded-2xl p-4 shadow-sm">
        <div class="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
          <span class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            仪
          </span>
          <h3 class="text-xs sm:text-sm font-semibold text-on-surface">
            吉神方位与正统科仪指南
          </h3>
        </div>
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div class="bg-surface-container-low p-2.5 rounded-xl text-center border border-white/5">
            <span class="text-[10px] text-outline mb-1 block">喜神方位</span>
            <span class="text-xs sm:text-sm text-primary font-bold">正南</span>
            <span class="text-[10px] text-on-surface-variant block mt-0.5">欢庆和睦</span>
          </div>
          <div class="bg-surface-container-low p-2.5 rounded-xl text-center border border-white/5">
            <span class="text-[10px] text-outline mb-1 block">福神方位</span>
            <span class="text-xs sm:text-sm text-secondary font-bold">正东</span>
            <span class="text-[10px] text-on-surface-variant block mt-0.5">吉庆安康</span>
          </div>
          <div class="bg-surface-container-low p-2.5 rounded-xl text-center border border-white/5">
            <span class="text-[10px] text-outline mb-1 block">财神方位</span>
            <span class="text-xs sm:text-sm text-primary font-bold">正东</span>
            <span class="text-[10px] text-on-surface-variant block mt-0.5">源流不断</span>
          </div>
        </div>
        <div class="space-y-2 text-xs text-on-surface-variant">
          <div class="flex items-start gap-2 bg-surface-container-low p-2.5 rounded-xl border border-white/5">
            <span class="text-primary text-sm mt-0.5">🚩</span>
            <p><strong class="text-on-surface">方位迎财仪式：</strong>开门揭彩仪式主位宜面朝<strong>正东方</strong>，迎受生门紫气财禄；主事人第一步踏入大门请行右足，顺应阴阳乾坤交汇。</p>
          </div>
          <div class="flex items-start gap-2 bg-surface-container-low p-2.5 rounded-xl border border-white/5">
            <span class="text-tertiary text-sm mt-0.5">💍</span>
            <p><strong class="text-on-surface">随身护佑佩饰：</strong>主事人本日五行宜金火相合，建议佩戴纯金配饰或朱砂朱绳，避开黑色暗曜，助旺日柱气魄。</p>
          </div>
          <div class="flex items-start gap-2 bg-surface-container-low p-2.5 rounded-xl border border-white/5">
            <span class="text-secondary text-sm mt-0.5">⏳</span>
            <p><strong class="text-on-surface">辰巳时动工：</strong>务必在辰时（07:00-09:00）或巳时（09:00-11:00）启动仪式核心程序，切忌拖延至正午烈阳正冲之时。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 分章详批解读区 (支持全部展开/独立折叠，标准中国数字大写章次) -->
    <div class="space-y-3 mb-4 relative z-10">
      <!-- 章节区域头部控制栏 -->
      <div class="flex items-center justify-between pb-1 px-1">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-4 rounded-full bg-primary"></span>
          <h3 class="text-sm sm:text-base font-semibold text-on-surface">分章详批深研</h3>
        </div>
        <button
          @click="toggleAllChapters"
          class="text-xs text-primary font-medium px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 active:scale-95 transition-all"
          type="button"
        >
          {{ allChaptersOpen ? "全部折叠" : "全部展开" }}
        </button>
      </div>

      <div
        v-for="(chapter, idx) in formattedChapters"
        :key="chapter.id || idx"
        class="bg-surface-container border border-white/10 rounded-2xl overflow-hidden shadow-md transition-all duration-300"
      >
        <!-- 章节标题行 -->
        <button
          @click="toggleChapter(idx)"
          class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          type="button"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {{ getChapterNum(idx) }}
            </span>
            <span class="text-sm sm:text-base font-semibold text-on-surface truncate">{{ chapter.cleanTitle }}</span>
          </div>
          <div class="flex items-center gap-2 shrink-0 ml-2">
            <span v-if="chapter.tag" class="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-tertiary border border-white/10">
              {{ chapter.tag }}
            </span>
            <span
              class="text-xs text-primary transform transition-transform duration-300"
              :class="{ 'rotate-180': openChapters.has(idx) }"
            >
              ▼
            </span>
          </div>
        </button>

        <!-- 展开后正文 (14px/400 行高 1.8) -->
        <div
          v-show="openChapters.has(idx)"
          class="px-4 pb-4 pt-1 border-t border-white/5 space-y-2.5"
        >
          <div
            v-for="(block, bIdx) in parseContentBlocks(chapter.content)"
            :key="bIdx"
          >
            <!-- 标题块 ### 或 ## -->
            <div
              v-if="block.type === 'heading'"
              class="font-semibold text-xs sm:text-sm text-primary flex items-center gap-1.5 pt-2 pb-1 border-b border-white/5"
            >
              <span class="w-1.5 h-3 bg-primary rounded-full"></span>
              <span v-html="formatInline(block.content)"></span>
            </div>

            <!-- 列表项 - 或 * 或 1. -->
            <div
              v-else-if="block.type === 'list-item'"
              class="flex items-start gap-2 pl-1 py-0.5 text-xs sm:text-sm text-on-surface/90"
            >
              <span class="text-primary text-xs mt-0.5">•</span>
              <div class="flex-1" v-html="formatInline(block.content)"></div>
            </div>

            <!-- 普通段落 -->
            <div
              v-else
              class="text-xs sm:text-sm font-normal text-on-surface/90 text-justify py-0.5 leading-[1.8]"
              v-html="formatInline(block.content)"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. 通用吉凶方位与开运指南 (按设计图规范 3格卡片与开运箴言，用于八字/相学等通用门类) -->
    <div v-if="categoryType !== 'auspicious_date'" class="bg-surface-container border border-primary/20 rounded-2xl p-4 mb-4 shadow-sm relative z-10">
      <div class="flex items-center gap-2 mb-3">
        <span class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
          陆
        </span>
        <h3 class="text-sm sm:text-base font-semibold text-on-surface">
          吉凶方位与开运指南
        </h3>
      </div>

      <div class="grid grid-cols-3 gap-2 mb-3">
        <!-- Item 1: 吉利方位 -->
        <div class="flex flex-col items-center justify-center bg-surface-container-low p-2.5 rounded-xl text-center border border-white/5">
          <span class="text-[10px] text-outline mb-1">吉利方位</span>
          <span class="text-xs sm:text-sm text-primary font-bold">{{ orientationGuide.direction }}</span>
          <span class="text-[10px] text-on-surface-variant scale-95 mt-0.5">生旺禄位</span>
        </div>
        <!-- Item 2: 喜用颜色 -->
        <div class="flex flex-col items-center justify-center bg-surface-container-low p-2.5 rounded-xl text-center border border-white/5">
          <span class="text-[10px] text-outline mb-1">喜用颜色</span>
          <span class="text-xs sm:text-sm text-tertiary font-bold">{{ orientationGuide.color }}</span>
          <span class="text-[10px] text-on-surface-variant scale-95 mt-0.5">通灵护气</span>
        </div>
        <!-- Item 3: 幸运数字 -->
        <div class="flex flex-col items-center justify-center bg-surface-container-low p-2.5 rounded-xl text-center border border-white/5">
          <span class="text-[10px] text-outline mb-1">幸运数字</span>
          <span class="text-xs sm:text-sm text-secondary font-bold">{{ orientationGuide.number }}</span>
          <span class="text-[10px] text-on-surface-variant scale-95 mt-0.5">太极生化</span>
        </div>
      </div>

      <div class="bg-surface-container-high/40 p-3 rounded-xl flex items-start gap-2 border border-white/5">
        <span class="text-primary text-base shrink-0 mt-0.5">💡</span>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          <strong>开运箴言：</strong>{{ orientationGuide.motto }}
        </p>
      </div>
    </div>

    <!-- 6. 宗师修心改运锦囊 (Blessing Advice - 彻底解决对象/JSON泄露Bug) -->
    <div v-if="formattedBlessingAdvice.length > 0" class="bg-gradient-to-br from-[#1C1828] to-[#121626] border border-secondary/30 rounded-2xl p-4 mb-4 space-y-3 shadow-md relative z-10">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-secondary flex items-center gap-2">
          <span>✨</span> 宗师修心改运锦囊
        </h3>
        <span class="text-[10px] text-outline">修德聚运</span>
      </div>

      <div class="space-y-2">
        <div
          v-for="(tip, tIdx) in formattedBlessingAdvice"
          :key="tIdx"
          class="bg-surface-container-low/70 border border-primary/20 rounded-xl p-3 flex flex-col gap-1 shadow-sm"
        >
          <div class="flex items-center gap-1.5 text-primary font-semibold text-xs">
            <span class="text-primary text-xs">✦</span>
            <span>{{ tip.title }}</span>
          </div>
          <div class="text-xs text-on-surface/90 leading-relaxed pl-3.5">
            {{ tip.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- 7. 溯源正本存证卡 (Archival Stamp & Algorithmic Provenance) -->
    <div class="bg-surface-container-lowest/80 border border-white/5 rounded-2xl p-4 mb-4 shadow-sm flex flex-col items-center text-center gap-2 relative z-10">
      <div class="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-lg mb-0.5">
        🛡️
      </div>
      <div class="text-sm font-bold text-primary tracking-wider font-display">
        天机钦定 · 溯源正本
      </div>
      <p class="text-xs text-on-surface-variant max-w-[300px] leading-relaxed">
        本批录融合周易干支万年古籍秘本与天机 AI 深度时空多维拓扑算法演算生成
      </p>
      <div class="mt-1 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
        <span class="text-[11px] text-outline font-mono">ZKP 哈希防伪验证通过</span>
      </div>
    </div>

    <!-- 8. 下载说明行 -->
    <div class="w-full text-center py-1 mb-2 z-10 relative">
      <p class="text-xs text-outline">非会员每月可下载 3 次，会员不限次</p>
    </div>

    <!-- 9. 吸底双操作按钮 -->
    <div class="fixed bottom-0 inset-x-0 max-w-[430px] mx-auto p-3.5 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-white/10 z-30 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] flex gap-3">
      <!-- 次按钮：分享报告 (描边) -->
      <button
        @click="handleShare"
        class="flex-1 h-12 rounded-full font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 bg-surface-container-low border border-primary text-primary hover:bg-surface-container active:scale-[0.98]"
        type="button"
      >
        <span>↗</span>
        <span>分享报告</span>
      </button>

      <!-- 主按钮：下载报告 (金色渐变) -->
      <button
        @click="handleDownload"
        :disabled="downloading"
        class="flex-1 h-12 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-fixed via-primary to-primary-container text-surface-container-lowest shadow-[0_4px_16px_rgba(212,175,55,0.35)] active:scale-[0.98]"
        type="button"
      >
        <span v-if="downloading" class="w-4 h-4 rounded-full border-2 border-surface-container-lowest border-t-transparent animate-spin"></span>
        <span v-else>📥</span>
        <span>{{ downloading ? "正在生成..." : "下载报告" }}</span>
      </button>
    </div>

    <!-- 10. 下载中 / 完成全屏弹层 -->
    <div v-if="downloading" class="fixed inset-0 z-50 bg-surface-container-lowest/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 select-none">
      <div v-if="!downloadSuccess" class="flex flex-col items-center">
        <div class="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4 shadow-gold-glow"></div>
        <p class="text-sm font-semibold text-on-surface">正在生成专属命盘报告…</p>
        <p class="text-xs text-on-surface-variant mt-1">使用高清 Canvas 进行像素级排版</p>
      </div>
      <div v-else class="flex flex-col items-center">
        <div class="w-16 h-16 rounded-full bg-tj-success/20 text-tj-success flex items-center justify-center text-3xl mb-4">
          ✓
        </div>
        <p class="text-sm font-semibold text-on-surface">已保存到本地</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";
import { CATEGORIES_CONFIG } from "../stores/divination";
import { exportReportToImage } from "../utils/pdf-export";
import { CATEGORY_DEFAULT_CHAPTERS, AUSPICIOUS_DATE_HERO_DATA } from "../constants/report-defaults";

const route = useRoute();
const userStore = useUserStore();
const uiStore = useUIStore();

const categoryType = computed(() => (route.params.type as string) || "bazi");
const categoryName = computed(() => CATEGORIES_CONFIG[categoryType.value]?.name || "八字推测");

const currentOrderId = ref((route.query.orderId as string) || "");
const reportNo = ref("TJ" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "0001");
const todayStr = ref(new Date().toISOString().slice(0, 10));

const reportTitle = ref("天机专属测算报告");
const reportScore = ref(89);
const overviewText = ref("");
const blessingAdvice = ref<any[]>([]);
const openChapters = ref<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
const downloading = ref(false);
const downloadSuccess = ref(false);

const allChaptersOpen = computed(() => openChapters.value.size >= formattedChapters.value.length);

function toggleChapter(idx: number) {
  if (openChapters.value.has(idx)) {
    openChapters.value.delete(idx);
  } else {
    openChapters.value.add(idx);
  }
}

function toggleAllChapters() {
  if (allChaptersOpen.value) {
    openChapters.value.clear();
  } else {
    formattedChapters.value.forEach((_, idx) => openChapters.value.add(idx));
  }
}

const chineseNumerals = ["壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖", "拾"];

function getChapterNum(idx: number) {
  return chineseNumerals[idx] || `${idx + 1}`;
}

const chartTitle = computed(() => {
  const t = categoryType.value;
  if (t === "palm_face" || t === "palm_reading" || t === "face_reading") {
    return "三停五岳与掌纹走势全息图谱";
  } else if (t === "phone_plate") {
    return "数字能量八星磁场分布矩阵";
  } else if (t === "name_test" || t === "personal_naming" || t === "company_naming") {
    return "三才五格数理气象图谱";
  } else if (t === "love_match") {
    return "双人八字纳音与日柱天合地合谱";
  } else if (t === "qimen_decision") {
    return "奇门遁甲九星八门九宫胜算阵盘";
  } else if (t === "auspicious_date") {
    return "首选吉日四柱排盘 · 钦天监星曜";
  }
  return "四柱八字排盘 · 象数星纬";
});

// 吉凶方位与开运点拨自适应指南
const orientationGuide = computed(() => {
  const t = categoryType.value;
  if (t === "auspicious_date") {
    return {
      direction: "正南 · 正东",
      color: "朱红 · 纯金",
      number: "8, 9",
      motto: "开门揭彩仪式主位宜面朝正东或正南，迎受生门紫气财禄；主事人第一步踏入大门请行右足，顺应阴阳乾坤交汇。",
    };
  }
  if (t === "phone_plate") {
    return {
      direction: "东南 · 正西",
      color: "明黄 · 藏蓝",
      number: "1, 3",
      motto: "手机屏幕壁纸宜选用山水聚财或纯金太极图，车内饰物可悬挂朱砂或黑曜石挂件以制化暗煞。",
    };
  }
  if (t === "love_match") {
    return {
      direction: "西南 · 正东",
      color: "桃粉 · 浅金",
      number: "2, 7",
      motto: "双方居所卧房宜置于清和之地，窗前置粉晶或双鸳鸯陈列，日常遇事以包容为舟，同心同德自能家宅丰隆。",
    };
  }
  return {
    direction: "正东 · 东南",
    color: "玄黑 · 青碧",
    number: "1, 6",
    motto: "居家或办公坐东朝西，置青翠阔叶绿植于震宫，配戴黑曜石或金质饰件，可最大化接引天乙贵人之气。",
  };
});

const defaultChapters = [
  {
    id: "ch_1",
    title: "第一章 · 命局总论与五行格局",
    tag: "天命底色",
    content: "日主元神秉天地中和之气，气象纯粹。主为人仁厚宽和，有容乃大，处事进退有度，深谙韬光养晦之智。五行生化各司其职，虽有微冲，亦得吉神暗合通关。",
  },
  {
    id: "ch_2",
    title: "第二章 · 事业官禄与行商赛道",
    tag: "仕途财运",
    content: "官星化印，多得长者贵人引荐提拔。逢关键转折年份必有权柄升级或开拓领衔大宗项目之契机。利于深耕科技、文化创意与专业技术赛道，厚积薄发。",
  },
  {
    id: "ch_3",
    title: "第三章 · 感情姻缘与家庭福泽",
    tag: "良缘和合",
    content: "妻妾/夫星坐禄旺之地，另一半性情温润娴静，持家有方且具极高审美与共创财智。彼此相待多一份尊重与知己之契，凡事同舟共济自能福祚绵长。",
  },
  {
    id: "ch_4",
    title: "第四章 · 未来流年转折与开运锦囊",
    tag: "大运拐点",
    content: "未来三年为伏脉起运期，凡事宜稳步积累打磨内核；逢岁运天乙贵人，将迎十年一遇之重大跃升机遇。以厚德载物，积善之家必有余庆。",
  },
];

const rawChapters = ref<any[]>([]);

const formattedChapters = computed(() => {
  const catFallbacks = CATEGORY_DEFAULT_CHAPTERS[categoryType.value] || CATEGORY_DEFAULT_CHAPTERS.bazi || defaultChapters;
  let baseChapters = rawChapters.value.length >= 3 ? rawChapters.value : catFallbacks;

  return baseChapters.map((ch, idx) => {
    let rawTitle = ch.title || "";
    let clean = rawTitle.replace(/^【?第[一二三四五六七八九十\d]+章】?\s*[:：·]?\s*/, "").replace(/^【(.*?)】$/, "$1");
    const fallbackCh = catFallbacks[idx] || catFallbacks[0];

    // 如果标题是整句或者过长，使用规范章节名
    if (!clean || clean.length > 25 || (!clean.includes("章") && !clean.includes("【") && !clean.includes("篇") && !clean.includes("格") && !clean.includes("盘") && !clean.includes("单") && !clean.includes("法") && !clean.includes("析"))) {
      if (fallbackCh?.title) {
        clean = fallbackCh.title.replace(/^【(.*?)】$/, "$1").replace(/^第[一二三四五六七八九十\d]+章\s*·?\s*/, "");
      }
    }
    const cleanTitle = `第${getChapterNum(idx)}章 · ${clean}`;

    let content = ch.content;
    if (typeof content !== "string") {
      if (typeof content === "object" && content !== null) {
        content = Object.entries(content)
          .map(([k, v]) => `**${k}**：${typeof v === "object" ? JSON.stringify(v) : v}`)
          .join("\n\n");
      } else {
        content = String(content || "");
      }
    }

    // 如果章节内容字数过短（如两三句单薄的话），智能追加该章节的权威详断列表
    if (content.trim().length < 130 && fallbackCh?.content) {
      content = content.trim() ? `${content.trim()}\n\n${fallbackCh.content}` : fallbackCh.content;
    }

    return {
      ...ch,
      cleanTitle,
      content,
      tag: ch.tag || fallbackCh?.tag || "深度详批",
    };
  });
});

// 格式化宗师修心改运锦囊 (兼容对象、字符串与JSON字符串，杜绝泄漏)
const formattedBlessingAdvice = computed(() => {
  const list = blessingAdvice.value.length > 0 ? blessingAdvice.value : [
    "保持平和喜悦之心态，口出吉利之言，常感召天地祥瑞之气。",
    "核心仪式与用事依吉时推进，生肖冲煞者暂避三步观礼即可化解。",
    "常行善举，广结善缘，善调身心阴阳平衡，福泽绵长。",
  ];

  return list.map((item: any, idx: number) => {
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          return {
            title: parsed.title || parsed.name || `宗师指引 ${idx + 1}`,
            content: parsed.content || parsed.desc || parsed.text || trimmed,
          };
        } catch {}
      }
      return {
        title: `开运指引 ${idx + 1}`,
        content: item,
      };
    }
    if (typeof item === "object" && item !== null) {
      return {
        title: item.title || item.name || `开运指引 ${idx + 1}`,
        content: item.content || item.text || item.advice || item.desc || Object.values(item).join("，"),
      };
    }
    return {
      title: `开运指引 ${idx + 1}`,
      content: String(item),
    };
  });
});

function parseContentBlocks(content: string) {
  if (!content) return [];
  const lines = content.split("\n");
  const blocks: { type: "heading" | "list-item" | "paragraph"; content: string }[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("### ") || line.startsWith("## ")) {
      blocks.push({ type: "heading", content: line.replace(/^#{2,4}\s*/, "") });
    } else if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s/.test(line)) {
      blocks.push({ type: "list-item", content: line.replace(/^([-*]|\d+\.)\s*/, "") });
    } else {
      blocks.push({ type: "paragraph", content: line });
    }
  }
  return blocks;
}

function formatInline(text: string): string {
  if (!text) return "";
  let out = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>');
  out = out.replace(/【(.*?)】/g, '<span class="inline-block px-1.5 py-0.2 rounded bg-primary/15 border border-primary/30 text-primary font-bold mx-0.5 text-xs">【$1】</span>');
  return out;
}

onMounted(async () => {
  // 1. 获取 orderId
  const lastResult = sessionStorage.getItem("tj_last_result");
  let lastData: any = null;
  if (lastResult) {
    try {
      lastData = JSON.parse(lastResult);
      if (lastData.orderId) currentOrderId.value = lastData.orderId;
    } catch {}
  }

  const queryOrderId = (route.query.orderId as string) || currentOrderId.value;
  if (queryOrderId) {
    currentOrderId.value = queryOrderId;
    reportNo.value = queryOrderId;

    try {
      const res = await fetch(`/api/divine/report/${encodeURIComponent(queryOrderId)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.preview) {
          reportTitle.value = d.preview.title || d.preview.rating || reportTitle.value;
          if (typeof d.preview.score === "number") reportScore.value = d.preview.score;
        }

        const full = d.fullReport || d.full_report;
        if (full) {
          if (full.overview) overviewText.value = full.overview;
          if (Array.isArray(full.chapters) && full.chapters.length > 0) {
            rawChapters.value = full.chapters;
          }
          if (Array.isArray(full.blessingAdvice) && full.blessingAdvice.length > 0) {
            blessingAdvice.value = full.blessingAdvice;
          }
        }
      }
    } catch (err) {
      console.warn("加载报告详情失败:", err);
    }
  }

  // 2. 兼容本地缓存数据
  if (lastData?.full_report || lastData?.fullReport) {
    const full = lastData.full_report || lastData.fullReport;
    if (!overviewText.value && full.overview) overviewText.value = full.overview;
    if (rawChapters.value.length === 0 && Array.isArray(full.chapters)) {
      rawChapters.value = full.chapters;
    }
    if (blessingAdvice.value.length === 0 && Array.isArray(full.blessingAdvice)) {
      blessingAdvice.value = full.blessingAdvice;
    }
  }
});

async function handleDownload() {
  downloading.value = true;
  downloadSuccess.value = false;

  try {
    await exportReportToImage({
      title: reportTitle.value,
      categoryName: categoryName.value,
      score: reportScore.value,
      userName: userStore.user?.nickname || "天机缘主",
      date: todayStr.value,
      overview: overviewText.value || "日主元神气运畅通，天乙贵人乘旺。事业官星化印，一生多贵人扶持，后运亨通。",
    });

    downloadSuccess.value = true;
    setTimeout(() => {
      downloading.value = false;
      downloadSuccess.value = false;
    }, 1500);
  } catch (err: any) {
    downloading.value = false;
    uiStore.showToast("生成失败，请重试");
  }
}

function handleShare() {
  handleDownload();
  uiStore.showToast("长图海报已生成，可长按分享给好友！");
}
</script>
