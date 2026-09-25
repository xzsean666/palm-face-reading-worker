export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
}

/**
 * 在前端浏览器环境使用 HTML5 Canvas 对上传的照片进行缩放和压缩
 * 确保尺寸不超过 1024px，体积控制在 200KB 以内
 */
export async function compressImage(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<{ base64: string; blob: Blob; size: number }> {
  const maxWidth = options.maxWidth ?? 1024;
  const maxHeight = options.maxHeight ?? 1024;
  let quality = options.quality ?? 0.85;
  const maxSizeBytes = options.maxSizeBytes ?? 200 * 1024; // 200KB

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("读取图片文件失败"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("解析图片失败"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 等比缩放计算
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("无法获取 Canvas 上下文"));
          return;
        }

        // 绘制图片
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // 初次压缩
        let base64 = canvas.toDataURL("image/jpeg", quality);

        // 如果仍超出限制，逐步微调压缩率
        while (base64.length * 0.75 > maxSizeBytes && quality > 0.4) {
          quality -= 0.1;
          base64 = canvas.toDataURL("image/jpeg", quality);
        }

        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                base64,
                blob,
                size: blob.size,
              });
            } else {
              reject(new Error("生成 Blob 失败"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
