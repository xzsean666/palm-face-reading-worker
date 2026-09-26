<template>
  <div class="flex-1 pb-24 px-4 pt-2 select-none">
    <!-- 1. 步骤条 (高 40px，居中横向) -->
    <div class="h-10 flex items-center justify-between border-b border-white/5 mb-4 text-xs font-semibold px-2">
      <div class="flex items-center gap-1.5 pb-2 border-b-2 border-tj-primary text-tj-primary">
        <span>1</span>
        <span>填写信息</span>
      </div>
      <span class="text-tj-text-faint pb-2">——</span>
      <div class="flex items-center gap-1.5 pb-2 text-tj-text-faint">
        <span>2</span>
        <span>AI 推演</span>
      </div>
      <span class="text-tj-text-faint pb-2">——</span>
      <div class="flex items-center gap-1.5 pb-2 text-tj-text-faint">
        <span>3</span>
        <span>查看报告</span>
      </div>
    </div>

    <!-- 门类标题卡 -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
        {{ currentCategoryInfo.icon }}
      </div>
      <div>
        <h2 class="text-sm font-bold text-tj-text-primary">
          {{ currentCategoryInfo.name }}
        </h2>
        <p class="text-[11px] text-tj-text-secondary">
          《{{ currentCategoryInfo.classic }}》专有易学大模型推演体系
        </p>
      </div>
    </div>

    <!-- 2. 表单区 (卡片容器) -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 space-y-4 mb-6">
      <!-- 门类 1 & 2: 手相 / 面相 / 面手合参 -->
      <template v-if="categoryType === 'palm_reading' || categoryType === 'face_reading' || categoryType === 'palm_face'">
        <template v-if="categoryType === 'palm_face'">
          <ImageUpload
            v-model="formData.faceImage"
            label="面部照片 (正脸平视)"
            hint="正面平视五官，避免美颜与强滤镜"
            required
          />
          <ImageUpload
            v-model="formData.palmImage"
            label="手掌照片 (掌心朝上)"
            hint="手掌自然伸直，光线充足掌纹清晰"
            required
          />
        </template>
        <template v-else>
          <ImageUpload
            v-model="formData.imageBase64"
            :label="categoryType === 'palm_reading' ? '手掌照片' : '面部照片'"
            :hint="categoryType === 'palm_reading' ? '手掌自然伸直，掌心向上正对镜头' : '正面平视，五官清晰无刘海遮挡'"
            required
          />
        </template>
        <GenderRadio v-model="formData.gender" label="缘主性别" required />
        <DateTimePicker
          v-model:dateValue="formData.birthDate"
          label="出生公历日期 (选填)"
          :required="false"
          :includeTime="false"
          :allowCalendarSwitch="false"
        />
      </template>

      <!-- 门类 3: 我们合不合 (双人合婚) -->
      <template v-else-if="categoryType === 'love_match'">
        <div class="space-y-3 pb-3 border-b border-white/5">
          <div class="text-xs font-bold text-tj-primary flex items-center gap-1.5">
            <span>👤</span> 您的基本命盘
          </div>
          <div>
            <label class="block text-xs font-semibold text-tj-text-primary mb-1">
              您的姓名 <span class="text-tj-danger">*</span>
            </label>
            <input
              v-model="formData.myName"
              type="text"
              placeholder="请输入您的姓名"
              class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
            />
          </div>
          <GenderRadio v-model="formData.myGender" label="您的性别" required />
          <DateTimePicker
            v-model:dateValue="formData.myBirthDate"
            v-model:timeValue="formData.myBirthTime"
            label="您的出生日期时辰"
            required
          />
        </div>

        <div class="space-y-3 pb-3 border-b border-white/5">
          <div class="text-xs font-bold text-tj-purple flex items-center gap-1.5">
            <span>💞</span> 对方基本命盘
          </div>
          <div>
            <label class="block text-xs font-semibold text-tj-text-primary mb-1">
              对方姓名 <span class="text-tj-danger">*</span>
            </label>
            <input
              v-model="formData.partnerName"
              type="text"
              placeholder="请输入对方姓名"
              class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-purple outline-none"
            />
          </div>
          <GenderRadio v-model="formData.partnerGender" label="对方性别" required />
          <DateTimePicker
            v-model:dateValue="formData.partnerBirthDate"
            v-model:timeValue="formData.partnerBirthTime"
            label="对方出生日期时辰"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1.5">
            关系类型 <span class="text-tj-danger">*</span>
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="rel in ['情侣', '夫妻', '合伙人', '朋友']"
              :key="rel"
              type="button"
              @click="formData.relationType = rel"
              class="h-9 rounded-xl border text-xs font-medium transition-all"
              :class="formData.relationType === rel ? 'bg-tj-purple/20 border-tj-purple text-tj-purple font-bold' : 'bg-white/5 border-white/10 text-tj-text-secondary'"
            >
              {{ rel }}
            </button>
          </div>
        </div>
      </template>

      <!-- 门类 4: 测手机车牌 -->
      <template v-else-if="categoryType === 'phone_plate'">
        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1.5">
            测算类型 <span class="text-tj-danger">*</span>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="formData.digitType = 'phone'"
              class="h-10 rounded-xl border text-xs font-semibold transition-all"
              :class="formData.digitType === 'phone' ? 'bg-tj-primary/10 border-tj-primary text-tj-primary' : 'bg-white/5 border-white/10 text-tj-text-secondary'"
            >
              📱 手机号码 (11位)
            </button>
            <button
              type="button"
              @click="formData.digitType = 'plate'"
              class="h-10 rounded-xl border text-xs font-semibold transition-all"
              :class="formData.digitType === 'plate' ? 'bg-tj-primary/10 border-tj-primary text-tj-primary' : 'bg-white/5 border-white/10 text-tj-text-secondary'"
            >
              🚗 车牌号码 (含新能源)
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1">
            待测号码 <span class="text-tj-danger">*</span>
          </label>
          <input
            v-model="formData.digits"
            type="text"
            :placeholder="formData.digitType === 'phone' ? '请输入11位中国大陆手机号' : '如：粤B12345 或 京AD12345'"
            class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none font-mono"
          />
        </div>

        <DateTimePicker
          v-model:dateValue="formData.birthDate"
          v-model:timeValue="formData.birthTime"
          label="机主/车主出生日期时辰"
          required
        />
      </template>

      <!-- 门类 5: 测姓名店名 -->
      <template v-else-if="categoryType === 'name_test'">
        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1.5">
            测算主体类型 <span class="text-tj-danger">*</span>
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="t in [{ id: 'person', label: '人名' }, { id: 'shop', label: '店名' }, { id: 'company', label: '公司名' }]"
              :key="t.id"
              type="button"
              @click="formData.nameType = t.id"
              class="h-9 rounded-xl border text-xs font-semibold transition-all"
              :class="formData.nameType === t.id ? 'bg-tj-primary/15 border-tj-primary text-tj-primary' : 'bg-white/5 border-white/10 text-tj-text-secondary'"
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1">
            待测名称 <span class="text-tj-danger">*</span>
          </label>
          <input
            v-model="formData.targetName"
            type="text"
            placeholder="请输入待测全名 (如：张无忌、天机茶社)"
            class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
          />
        </div>

        <GenderRadio
          v-if="formData.nameType === 'person'"
          v-model="formData.gender"
          label="性别"
          required
        />

        <DateTimePicker
          v-model:dateValue="formData.birthDate"
          v-model:timeValue="formData.birthTime"
          label="主人/法人出生日期时辰"
          required
        />
      </template>

      <!-- 门类 6: 择日吉日 -->
      <template v-else-if="categoryType === 'auspicious_date'">
        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1">
            择吉事项 <span class="text-tj-danger">*</span>
          </label>
          <select
            v-model="formData.event"
            class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
          >
            <option value="结婚嫁娶">结婚嫁娶 (永结同心)</option>
            <option value="开业开市">开业开市 (财源广进)</option>
            <option value="乔迁搬家">乔迁搬家 (入宅安居)</option>
            <option value="破土动工">破土动工 (基业稳固)</option>
            <option value="签约交易">签约交易 (生意通达)</option>
            <option value="出行远游">出行远游 (出入平安)</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-tj-text-primary mb-1">
              起始日期 <span class="text-tj-danger">*</span>
            </label>
            <input
              v-model="formData.startDate"
              type="date"
              class="w-full h-11 px-2 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-tj-text-primary mb-1">
              截止日期 <span class="text-tj-danger">*</span>
            </label>
            <input
              v-model="formData.endDate"
              type="date"
              class="w-full h-11 px-2 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
            />
          </div>
        </div>

        <DateTimePicker
          v-model:dateValue="formData.birthDate"
          v-model:timeValue="formData.birthTime"
          label="主事人出生日期时辰"
          required
        />

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1">
            所在城市 <span class="text-tj-danger">*</span>
          </label>
          <input
            v-model="formData.city"
            type="text"
            placeholder="如：北京、深圳、杭州"
            class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
          />
        </div>
      </template>

      <!-- 门类 7: 未来运程 -->
      <template v-else-if="categoryType === 'future_fortune'">
        <DateTimePicker
          v-model:dateValue="formData.birthDate"
          v-model:timeValue="formData.birthTime"
          label="出生日期时辰"
          required
        />
        <GenderRadio v-model="formData.gender" label="缘主性别" required />

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1.5">
            预测范围 <span class="text-tj-danger">*</span>
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="range in ['今年', '未来三年', '未来五年']"
              :key="range"
              type="button"
              @click="formData.forecastRange = range"
              class="h-9 rounded-xl border text-xs font-medium transition-all"
              :class="formData.forecastRange === range ? 'bg-tj-primary/20 border-tj-primary text-tj-primary font-bold' : 'bg-white/5 border-white/10 text-tj-text-secondary'"
            >
              {{ range }}
            </button>
          </div>
        </div>
      </template>

      <!-- 门类 8: 八字推测 -->
      <template v-else-if="categoryType === 'bazi'">
        <DateTimePicker
          v-model:dateValue="formData.birthDate"
          v-model:timeValue="formData.birthTime"
          label="出生公历/农历日期"
          required
          allowCalendarSwitch
        />
        <GenderRadio v-model="formData.gender" label="缘主性别" required />
        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1">
            出生城市 (用于真太阳时校准) <span class="text-tj-danger">*</span>
          </label>
          <input
            v-model="formData.birthCity"
            type="text"
            placeholder="如：四川省成都市"
            class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
          />
        </div>
      </template>

      <!-- 门类 9: 成败预测 (奇门遁甲) -->
      <template v-else-if="categoryType === 'qimen_decision'">
        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1">
            事项类别 <span class="text-tj-danger">*</span>
          </label>
          <select
            v-model="formData.decisionCategory"
            class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
          >
            <option value="创业开店">创业开店 (商机与合伙)</option>
            <option value="重大投资">重大投资 (财运与风险)</option>
            <option value="升学考试">升学考试 (考运与文曲)</option>
            <option value="求职晋升">求职晋升 (官禄与面试)</option>
            <option value="商业竞标">商业竞标 (对手与胜负)</option>
            <option value="法律诉讼">法律诉讼 (官非与和解)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1">
            计划推进时间 (年月) <span class="text-tj-danger">*</span>
          </label>
          <input
            v-model="formData.planDate"
            type="month"
            class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1">
            所问具体事项描述 <span class="text-tj-danger">*</span>
          </label>
          <textarea
            v-model="formData.question"
            rows="3"
            placeholder="请详细描述心中的疑虑或抉择选项（如：准备在今年10月与朋友合伙在上海开一家咖啡馆，是否能盈利？）"
            class="w-full p-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none resize-none leading-relaxed"
          ></textarea>
        </div>

        <DateTimePicker
          v-model:dateValue="formData.birthDate"
          v-model:timeValue="formData.birthTime"
          label="求测者出生日期时辰"
          required
        />
        <GenderRadio v-model="formData.gender" label="求测者性别" required />
      </template>

      <!-- 门类 10: 个人起名 -->
      <template v-else-if="categoryType === 'personal_naming'">
        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1">
            宝宝/求名姓氏 <span class="text-tj-danger">*</span>
          </label>
          <input
            v-model="formData.surname"
            type="text"
            maxlength="2"
            placeholder="如：李、诸葛"
            class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
          />
        </div>

        <GenderRadio v-model="formData.gender" label="性别" required />

        <DateTimePicker
          v-model:dateValue="formData.birthDate"
          v-model:timeValue="formData.birthTime"
          label="出生日期时辰 (补八字喜用神)"
          required
        />

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1.5">
            名字字数 <span class="text-tj-danger">*</span>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="formData.nameLength = '双字'"
              class="h-9 rounded-xl border text-xs font-medium transition-all"
              :class="formData.nameLength === '双字' ? 'bg-tj-primary/20 border-tj-primary text-tj-primary' : 'bg-white/5 border-white/10 text-tj-text-secondary'"
            >
              双字名 (如 李子涵)
            </button>
            <button
              type="button"
              @click="formData.nameLength = '单字'"
              class="h-9 rounded-xl border text-xs font-medium transition-all"
              :class="formData.nameLength === '单字' ? 'bg-tj-primary/20 border-tj-primary text-tj-primary' : 'bg-white/5 border-white/10 text-tj-text-secondary'"
            >
              单字名 (如 李白)
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1.5">
            寓意期望 (可多选)
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="wish in ['睿智聪颖', '平安康健', '富贵荣华', '文雅诗意', '英武果决', '福泽延绵']"
              :key="wish"
              type="button"
              @click="toggleWish(wish)"
              class="h-8 rounded-xl border text-[11px] font-medium transition-all"
              :class="formData.wishes.includes(wish) ? 'bg-tj-primary/20 border-tj-primary text-tj-primary' : 'bg-white/5 border-white/10 text-tj-text-faint'"
            >
              {{ wish }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1">
            家族长辈避讳字 (选填)
          </label>
          <input
            v-model="formData.avoidWords"
            type="text"
            placeholder="避免同音或同字，多个用逗号隔开"
            class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
          />
        </div>
      </template>

      <!-- 门类 11: 公司取名 -->
      <template v-else-if="categoryType === 'company_naming'">
        <DateTimePicker
          v-model:dateValue="formData.birthDate"
          v-model:timeValue="formData.birthTime"
          label="法人/核心股东出生日期时辰"
          required
        />

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1">
            行业类别 <span class="text-tj-danger">*</span>
          </label>
          <select
            v-model="formData.industry"
            class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-xs text-tj-text-primary focus:border-tj-primary outline-none"
          >
            <option value="互联网与人工智能">互联网与人工智能 (火属性)</option>
            <option value="餐饮与食品酒饮">餐饮与食品酒饮 (水火既济)</option>
            <option value="金融与投资财富">金融与投资财富 (金水相生)</option>
            <option value="文化创意与广告">文化创意与广告 (木火通明)</option>
            <option value="贸易进出口与物流">贸易进出口与物流 (流动水相)</option>
            <option value="房地产与建筑装饰">房地产与建筑装饰 (土木相厚)</option>
            <option value="大健康与生物医药">大健康与生物医药 (仁寿木相)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1.5">
            主体类型 <span class="text-tj-danger">*</span>
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="st in ['有限公司', '工作室', '个人店铺']"
              :key="st"
              type="button"
              @click="formData.entityType = st"
              class="h-9 rounded-xl border text-xs font-medium transition-all"
              :class="formData.entityType === st ? 'bg-tj-primary/20 border-tj-primary text-tj-primary' : 'bg-white/5 border-white/10 text-tj-text-secondary'"
            >
              {{ st }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-tj-text-primary mb-1.5">
            期望风格 <span class="text-tj-danger">*</span>
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="sf in ['大气聚财', '文雅深邃', '科技未来', '国际风范']"
              :key="sf"
              type="button"
              @click="formData.style = sf"
              class="h-9 rounded-xl border text-[11px] font-medium transition-all"
              :class="formData.style === sf ? 'bg-tj-cyan/20 border-tj-cyan text-tj-cyan' : 'bg-white/5 border-white/10 text-tj-text-secondary'"
            >
              {{ sf }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- 4. 价格区 (居中) -->
    <div class="text-center space-y-1 mb-4">
      <div class="flex items-baseline justify-center gap-2">
        <span class="text-lg font-bold font-num text-tj-primary">
          {{ userStore.isVip ? '0.00' : '2.99' }} <span class="text-xs font-sans">USDT</span>
        </span>
        <span class="text-xs line-through text-tj-text-faint">9.9 USDT</span>
      </div>
      <div class="text-[11px] text-tj-cyan font-medium">
        {{ userStore.isVip ? '👑 VIP 会员尊享无限次免费测算' : '✨ 注册新用户享 2 次免费额度抵扣' }}
      </div>
      <div v-if="userStore.freeQuota > 0" class="text-[11px] text-tj-primary-light">
        剩余免费额度：{{ userStore.freeQuota }} 次
      </div>
    </div>

    <!-- 5 & 6. 吸底主按钮区 -->
    <div class="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-tj-bg/95 backdrop-blur-md border-t border-white/10 z-20">
      <button
        @click="handleFormSubmit"
        :disabled="submitting"
        class="w-full h-12 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 shadow-gold-glow"
        :class="[
          isFormValid
            ? 'bg-tj-grad-gold text-[#1A1405] hover:brightness-110 active:scale-98'
            : 'bg-tj-primary/40 text-[#1A1405]/60 cursor-not-allowed'
        ]"
      >
        <span v-if="submitting" class="w-5 h-5 rounded-full border-2 border-[#1A1405] border-t-transparent animate-spin"></span>
        <span v-if="submitting">创建推演任务中...</span>
        <span v-else-if="userStore.freeQuota > 0 || userStore.isVip">开始推演（免费）</span>
        <span v-else>开始推演</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";
import { CATEGORIES_CONFIG } from "../stores/divination";
import ImageUpload from "../components/forms/ImageUpload.vue";
import GenderRadio from "../components/forms/GenderRadio.vue";
import DateTimePicker from "../components/forms/DateTimePicker.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

const categoryType = computed(() => (route.params.type as string) || "bazi");
const currentCategoryInfo = computed(() => {
  return CATEGORIES_CONFIG[categoryType.value] || {
    id: categoryType.value,
    name: "命理推演",
    classic: "易经理数",
    desc: "易学大模型排盘推演",
    icon: "🔮",
    route: "",
  };
});

const submitting = ref(false);

const formData = reactive({
  // 看相类
  imageBase64: "",
  faceImage: "",
  palmImage: "",
  gender: "male",
  birthDate: "1995-08-08",
  birthTime: "午时 (11:00 - 13:00)",

  // 我们合不合
  myName: "",
  myGender: "male",
  myBirthDate: "1995-08-08",
  myBirthTime: "午时 (11:00 - 13:00)",
  partnerName: "",
  partnerGender: "female",
  partnerBirthDate: "1996-09-09",
  partnerBirthTime: "酉时 (17:00 - 19:00)",
  relationType: "情侣",

  // 手机车牌
  digitType: "phone",
  digits: "",

  // 姓名店名
  nameType: "person",
  targetName: "",

  // 择日吉日
  event: "结婚嫁娶",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  city: "北京",

  // 未来运程
  forecastRange: "未来三年",

  // 八字推测
  birthCity: "北京",

  // 成败预测 (奇门遁甲)
  decisionCategory: "重大投资",
  planDate: new Date().toISOString().slice(0, 7),
  question: "",

  // 个人起名
  surname: "",
  nameLength: "双字",
  wishes: ["睿智聪颖", "富贵荣华"],
  avoidWords: "",

  // 公司取名
  industry: "互联网与人工智能",
  entityType: "有限公司",
  style: "大气聚财",
});

function toggleWish(wish: string) {
  const idx = formData.wishes.indexOf(wish);
  if (idx >= 0) {
    formData.wishes.splice(idx, 1);
  } else {
    formData.wishes.push(wish);
  }
}

// 必填字段缺失校验返回缺失字段名称
const missingField = computed(() => {
  const t = categoryType.value;
  if (t === "palm_reading" || t === "face_reading") {
    if (!formData.imageBase64) return t === "palm_reading" ? "手掌照片" : "面部照片";
    if (!formData.gender) return "缘主性别";
  } else if (t === "palm_face") {
    if (!formData.faceImage && !formData.imageBase64) return "面部照片";
    if (!formData.palmImage && !formData.imageBase64) return "手掌照片";
    if (!formData.gender) return "缘主性别";
  } else if (t === "love_match") {
    if (!formData.myName?.trim()) return "您的姓名";
    if (!formData.partnerName?.trim()) return "对方姓名";
    if (!formData.relationType) return "关系类型";
  } else if (t === "phone_plate") {
    if (!formData.digits?.trim()) return "待测号码";
  } else if (t === "name_test") {
    if (!formData.targetName?.trim()) return "待测名称";
  } else if (t === "auspicious_date") {
    if (!formData.event) return "择吉事项";
    if (!formData.city?.trim()) return "所在城市";
  } else if (t === "bazi") {
    if (!formData.birthDate) return "出生公历/农历日期";
    if (!formData.birthCity?.trim()) return "出生城市";
  } else if (t === "qimen_decision") {
    if (!formData.question?.trim()) return "所问具体事项描述";
  } else if (t === "personal_naming") {
    if (!formData.surname?.trim()) return "求名姓氏";
  }
  return null;
});

const isFormValid = computed(() => missingField.value === null);

async function handleFormSubmit() {
  if (missingField.value) {
    uiStore.showToast(`请完整填写【${missingField.value}】`);
    return;
  }

  submitting.value = true;
  try {
    const payloadImage = formData.imageBase64 || formData.faceImage || formData.palmImage;
    sessionStorage.setItem(
      "tj_current_form",
      JSON.stringify({
        category: categoryType.value,
        ...formData,
        imageBase64: payloadImage,
      })
    );
    router.push(`/feature/${categoryType.value}/analyzing`);
  } catch (err: any) {
    uiStore.showToast("订单创建失败，请重试");
  } finally {
    submitting.value = false;
  }
}
</script>
