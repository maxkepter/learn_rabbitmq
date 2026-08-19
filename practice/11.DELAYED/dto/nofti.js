class Noftication {
  constructor(
    email,
    subject,
    message,
    retryCount = 0,
    scheduledAt = new Date().toISOString(),
  ) {
    this.email = email;
    this.subject = subject;
    this.message = message;
    this.retryCount = retryCount;
    this.scheduledAt = scheduledAt;
  }

  // Tăng số lần retry lên 1
  incrementRetry() {
    this.retryCount += 1;
    return this.retryCount;
  }

  // Kiểm tra xem còn được phép retry không (mặc định tối đa 3 lần)
  canRetry(maxRetry = 3) {
    return this.retryCount < maxRetry;
  }

  // Chuyển object thành JSON string để gửi lên RabbitMQ
  toJSON() {
    return JSON.stringify({
      email: this.email,
      subject: this.subject,
      message: this.message,
      retryCount: this.retryCount,
      scheduledAt: this.scheduledAt,
    });
  }

  // Tạo instance từ JSON string (hoặc object) nhận từ RabbitMQ
  static fromJSON(json) {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    return new Noftication(
      data.email,
      data.subject,
      data.message,
      data.retryCount ?? 0,
      data.scheduledAt ?? new Date().toISOString(),
    );
  }

  // Kiểm tra dữ liệu hợp lệ trước khi xử lý
  validate() {
    if (!this.email || !this.subject || !this.message) {
      throw new Error("Thiếu thông tin bắt buộc: email, subject, message");
    }
    return true;
  }

  // Chuỗi mô tả ngắn gọn để ghi log
  toString() {
    return `[Noftication] email=${this.email}, subject=${this.subject}, retryCount=${this.retryCount}, scheduledAt=${this.scheduledAt}`;
  }
}

module.exports = Noftication;
