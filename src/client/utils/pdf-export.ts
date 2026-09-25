/**
 * 导出报告为高清图片或调用浏览器打印/保存为 PDF
 */
export async function exportReportToImage(reportData: {
  title: string;
  categoryName: string;
  score: number;
  userName: string;
  date: string;
  overview: string;
}): Promise<void> {
  const canvas = document.createElement("canvas");
  canvas.width = 750;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. 深色赛博底色
  ctx.fillStyle = "#0B0E1A";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. 边框金线
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // 3. 顶部 Header
  ctx.fillStyle = "#D4AF37";
  ctx.font = "bold 36px 'Noto Serif SC', serif";
  ctx.textAlign = "center";
  ctx.fillText("天机 AI预测大师 · 专属命盘神断", canvas.width / 2, 90);

  ctx.fillStyle = "#9CA0B5";
  ctx.font = "20px sans-serif";
  ctx.fillText(`缘主：${reportData.userName}  |  门类：${reportData.categoryName}  |  日期：${reportData.date}`, canvas.width / 2, 135);

  // 4. 评分大字
  ctx.fillStyle = "#F5D97E";
  ctx.font = "bold 72px 'DIN Alternate', sans-serif";
  ctx.fillText(String(reportData.score), canvas.width / 2, 230);
  ctx.font = "18px sans-serif";
  ctx.fillText("命局综合得分", canvas.width / 2, 270);

  // 5. 标题与总断
  ctx.fillStyle = "#F3EFE3";
  ctx.font = "bold 28px 'Noto Serif SC', serif";
  ctx.fillText(reportData.title, canvas.width / 2, 340);

  // 正文换行绘制
  ctx.fillStyle = "#9CA0B5";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "left";
  const text = reportData.overview;
  let line = "";
  let y = 400;
  for (let i = 0; i < text.length; i++) {
    line += text[i];
    if (ctx.measureText(line).width > 650 || text[i] === "\n") {
      ctx.fillText(line, 50, y);
      line = "";
      y += 34;
    }
  }
  if (line) {
    ctx.fillText(line, 50, y);
  }

  // 6. 底部官方防伪标识
  ctx.fillStyle = "#5D6178";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("— 本报告由 Cloudflare 全球边缘算力集群推演生成 · 洞察天机 洞见真我 —", canvas.width / 2, 1140);

  // 触发下载
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `天机命理报告_${reportData.categoryName}_${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
