# Bài tập nâng cao RabbitMQ - Hẹn giờ + DLX + Retry

## Mục tiêu

Xây dựng một hệ thống gửi thông báo theo lịch hẹn bằng RabbitMQ, áp dụng các kỹ thuật:

- TTL (Time-To-Live)
- Dead Letter Exchange (DLX)
- Direct Exchange
- Queue binding
- Consumer acknowledgment
- Retry logic khi xử lý thất bại
- Logging thời gian và payload

## Tổng quan bài toán

Bạn cần xây dựng một hệ thống gửi email nhắc nhở hoặc thông báo theo thời gian chờ.

Luồng xử lý cần có:

1. Producer tạo message với payload chứa thông tin người nhận, tiêu đề, nội dung, thời gian chờ.
2. Message được đưa vào queue tạm thời có TTL.
3. Sau khi TTL hết hạn, RabbitMQ tự động dead-letter message sang Exchange chính.
4. Exchange định tuyến message sang queue đích.
5. Consumer đọc message từ queue đích, xử lý nội dung và ghi log.
6. Nếu xử lý thất bại, message sẽ được đưa vào DLQ hoặc retry theo thiết kế.

---

## Yêu cầu kỹ thuật

### 1. Tạo topology RabbitMQ

Bạn cần tạo các thành phần sau:

- Exchange: `main_exchange` kiểu `direct`
- Queue gốc: `delay_queue_10s`
- Queue đích: `delayed_target_queue`
- Queue retry: `retry_queue`
- Queue dead-letter: `dead_letter_queue`

Cấu hình cho queue delay:

- `durable: true`
- `x-message-ttl: 10000`
- `x-dead-letter-exchange: main_exchange`
- `x-dead-letter-routing-key: go`

Cấu hình cho queue đích:

- `durable: true`
- binding với `main_exchange` theo routing key `go`

---

### 2. Producer

File: `delay_send.js`

Yêu cầu:

- Kết nối RabbitMQ.
- Gửi ít nhất 3 message khác nhau vào `delay_queue_10s`.
- Mỗi message phải có payload dạng JSON như sau:

```json
{
  "email": "customer@example.com",
  "subject": "Thông báo nhắc nhở",
  "message": "Bạn có một công việc sắp đến hạn.",
  "retryCount": 0,
  "scheduledAt": "2026-08-19T10:00:00.000Z"
}
```

- Dùng `persistent: true`.
- Ghi log: thời gian gửi, nội dung payload, queue gửi đến.

---

### 3. Consumer chính

File: `delay_consume.js`

Yêu cầu:

- Lắng nghe queue `delayed_target_queue`.
- Khi nhận message:
  - đọc payload JSON
  - hiển thị thời gian nhận
  - in ra email, tiêu đề và nội dung
  - giả lập xử lý theo các tình huống:
    - thành công: `ack`
    - thất bại: `nack` hoặc `reject`
- Nếu thất bại, hãy đưa message vào queue retry hoặc dead-letter queue.

---

### 4. Retry logic

Bạn cần thêm logic xử lý lỗi như sau:

- Nếu `retryCount < 3`, tăng `retryCount` lên 1 và gửi lại vào queue retry.
- Queue retry có TTL ngắn hơn (ví dụ 5 giây) và dead-letter lại về queue đích.
- Nếu `retryCount >= 3`, message được đưa vào `dead_letter_queue` để lưu trữ và không retry nữa.

---

### 5. Logging

Cần log đầy đủ ít nhất các thông tin sau:

- Thời gian gửi
- Thời gian nhận
- Queue tên
- Routing key
- Số lần retry
- Trạng thái: sent / received / retry / failed / dead-letter

---

### 6. Cấu hình môi trường

- Sử dụng file `.env` để lưu thông tin kết nối RabbitMQ.
- Tất cả code nên lấy dữ liệu từ `process.env` thay vì hardcode.

Ví dụ:

```env
RABBITMQ_URI=amqp://taiheo:taiheodev@localhost
```

---

### 7. Yêu cầu output

Khi chạy xong, hệ thống phải cho ra output tương tự:

```text
[Producer] Sent message to delay_queue_10s at 2026-08-19T10:00:00.000Z
[Consumer] Received message from delayed_target_queue at 2026-08-19T10:00:10.200Z
[Consumer] Processing email: customer@example.com
[Consumer] Retry attempt 1 for customer@example.com
[Queue] Message moved to retry_queue
[Consumer] Retry received after 5s
[Consumer] Message processed successfully
```

---

## Tiêu chí chấm bài

Bạn được coi là hoàn thành nếu:

- Code chạy được trong môi trường RabbitMQ đã cài sẵn.
- Tạo đúng topology exchange/queue/binding.
- Message có TTL rõ ràng và bị dead-letter đúng cách.
- Consumer xử lý message có log rõ ràng.
- Có retry logic và dead-letter queue.
- Mã nguồn sạch, dễ đọc, tách rõ producer và consumer.

---

## Gợi ý phân chia file

Bạn có thể tổ chức theo các file sau:

- `delay_setup.js` — khởi tạo topology
- `delay_send.js` — producer gửi message
- `delay_consume.js` — consumer xử lý message
- `.env` — cấu hình môi trường
- `EXERCISE.md` — bài tập

---

## Đề nghị nâng cao

Nếu muốn thử thách lớn hơn, bạn có thể mở rộng thêm:

- Tạo hệ thống email reminder theo từng thời gian khác nhau: 5s, 15s, 1 phút.
- Sử dụng nhiều exchange loại `topic` thay vì `direct`.
- Thêm dashboard log bằng file `.log`.
- Tạo worker riêng cho retry queue và worker riêng cho dead-letter queue.
- Triển khai JSON schema validation để kiểm tra payload trước khi xử lý.

---

## Lưu ý quan trọng

Hãy tự suy nghĩ và viết code từ đầu, không copy nguyên code mẫu cũ. Mục tiêu của bài tập là bạn phải hiểu đúng:

- RabbitMQ queue là gì
- TTL là gì
- DLX hoạt động như thế nào
- Rate limit / retry / dead-letter trong hệ thống thực tế

Chúc bạn làm bài tốt!
