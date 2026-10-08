### Lập luận lựa chọn kiến trúc

**NFR1 – Hiệu năng**  
Vì NFR1 yêu cầu tra cứu khách hàng theo số điện thoại trong không quá 2 giây với 10.000 hồ sơ, em chọn thực hiện truy vấn tại lớp Repository và sử dụng index trên trường `phone` trong PostgreSQL thay vì tải toàn bộ dữ liệu lên lớp trình bày để lọc. Cách này giữ trách nhiệm truy cập dữ liệu tại đúng lớp Repository và giảm lượng dữ liệu phải truyền lên các lớp phía trên. Đánh đổi là index làm tăng một phần chi phí lưu trữ và chi phí khi thêm hoặc cập nhật dữ liệu.

**NFR2 – Khả dụng**  
Vì NFR2 yêu cầu nhân viên mới sau tối đa 15 phút hướng dẫn có thể tra cứu và mở hồ sơ trong không quá 2 phút, em tách Presentation Layer khỏi Business Layer để giao diện chỉ chịu trách nhiệm nhận thao tác, hiển thị dữ liệu và thông báo lỗi, còn các quy tắc tạo, tra cứu, kiểm tra trùng và gộp hồ sơ được xử lý thống nhất tại lớp nghiệp vụ. Cách tách này giúp hành vi của giao diện đơn giản và nhất quán hơn khi các quy tắc nghiệp vụ thay đổi. Đánh đổi là hệ thống có thêm lớp trung gian và cần duy trì hợp đồng dữ liệu rõ ràng giữa Presentation và Business.

**NFR3 – Tin cậy dữ liệu**  
Vì NFR3 yêu cầu 100% thao tác gộp hồ sơ bị lỗi giữa chừng phải đưa dữ liệu về trạng thái trước khi gộp, em tập trung quy trình gộp tại `MergeService` và sử dụng transaction của PostgreSQL cho toàn bộ các thao tác ghi liên quan. Nếu bất kỳ bước nào thất bại, transaction được rollback để tránh tạo trạng thái dữ liệu gộp một phần. Đánh đổi là luồng gộp phức tạp hơn và transaction có thể giữ khóa trên dữ liệu trong một khoảng thời gian ngắn.