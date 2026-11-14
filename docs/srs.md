# SRS – L1 Quản lý và hợp nhất hồ sơ khách hàng

## 1. Giới thiệu và phạm vi

### 1.1 Bối cảnh

Hệ thống Smart CRM của Mekong Mobile cần quản lý hồ sơ khách hàng tập trung và hạn chế tình trạng một khách hàng có nhiều hồ sơ trùng lặp.

Việc tồn tại nhiều hồ sơ cho cùng một khách hàng có thể gây khó khăn khi tra cứu, cập nhật thông tin và sử dụng dữ liệu trong các nghiệp vụ tiếp theo. Vì vậy, hệ thống cần hỗ trợ phát hiện và xử lý các hồ sơ có khả năng trùng.

### 1.2 Phạm vi

Phạm vi của đề tài tập trung vào việc nhân viên bán hàng tạo, tra cứu, xem, cập nhật, phát hiện và xử lý các hồ sơ khách hàng trùng lặp.

Trong phiên bản BT3 hiện tại, quản lý cửa hàng (MANAGER) trực tiếp xác nhận và thực hiện thao tác gộp qua API. Nhân viên bán hàng (SALES) có thể xem, kiểm tra, so sánh hồ sơ nghi trùng nhưng không được gọi API gộp.

### 1.3 Trong phạm vi

- Tạo hồ sơ khách hàng mới.
- Kiểm tra và cảnh báo khi thông tin khách hàng có khả năng trùng với hồ sơ đã tồn tại.
- Tra cứu khách hàng theo số điện thoại.
- Xem chi tiết hồ sơ khách hàng.
- Cập nhật thông tin khách hàng.
- Xem danh sách hồ sơ nghi trùng.
- So sánh các hồ sơ nghi trùng.
- Xác nhận và gộp các hồ sơ thuộc cùng một khách hàng.

### 1.4 Ngoài phạm vi

- Không thực hiện phân khúc khách hàng VIP / Thường xuyên / Mới / Ngủ đông.
- Không thực hiện chiến dịch marketing.
- Không thực hiện các luồng bán hàng.
- Không thực hiện nghiệp vụ bảo hành.
- Không thực hiện quản lý kho.

### 1.5 Bảng thuật ngữ

| Thuật ngữ | Giải thích |
| --- | --- |
| Hồ sơ khách hàng | Bản ghi chứa thông tin của một khách hàng trong hệ thống. |
| Hồ sơ nghi trùng | Hai hoặc nhiều hồ sơ có thông tin cho thấy có khả năng thuộc cùng một khách hàng. |
| Hồ sơ chuẩn | Hồ sơ được giữ lại và sử dụng sau khi hoàn tất thao tác gộp. |
| Gộp hồ sơ | Hợp nhất thông tin của các hồ sơ trùng thành một hồ sơ khách hàng chuẩn. |
| Nhân viên bán hàng | Người dùng trực tiếp tạo, tra cứu, cập nhật và xử lý hồ sơ khách hàng. |
| Quản lý cửa hàng | Người kiểm tra và xác nhận việc gộp các hồ sơ khách hàng trùng trước khi hệ thống thực hiện thao tác gộp. |


## 2. Các bên liên quan và vai trò người dùng

| Vai trò | Mô tả |
| --- | --- |
| Nhân viên bán hàng (SALES) | Tạo, tra cứu, xem; cập nhật hồ sơ do chính tài khoản tạo; xem và so sánh hồ sơ nghi trùng. Không có quyền gọi API gộp. |
| Quản lý cửa hàng (MANAGER) | Xem và cập nhật hồ sơ; kiểm tra, xác nhận và trực tiếp thực hiện gộp hồ sơ nghi trùng. |


## 3. Yêu cầu chức năng và User Story

### 3.1 Yêu cầu chức năng

**FR1 – Tạo hồ sơ khách hàng**
Hệ thống cho phép nhân viên bán hàng tạo hồ sơ khách hàng mới khi số điện thoại chưa tồn tại trong hệ thống.

**FR2 – Tra cứu khách hàng**
Hệ thống cho phép nhân viên bán hàng tra cứu hồ sơ khách hàng theo số điện thoại.

**FR3 – Xem chi tiết hồ sơ**
Hệ thống cho phép nhân viên bán hàng xem thông tin chi tiết của một hồ sơ khách hàng.

**FR4 – Cập nhật hồ sơ khách hàng**
Hệ thống cho phép SALES cập nhật hồ sơ do chính tài khoản tạo (đối chiếu `created_by` với `user_id` trong JWT). MANAGER được phép cập nhật hồ sơ bất kể người tạo. Truy cập chưa xác thực bị từ chối HTTP 401; SALES chỉnh sửa hồ sơ không thuộc quyền bị từ chối HTTP 403.

**FR5 – Cảnh báo hồ sơ trùng**
Trong quá trình tạo hồ sơ, hệ thống phải kiểm tra và cảnh báo khi thông tin khách hàng được nhập có khả năng trùng với hồ sơ đã tồn tại.

**FR6 – Xem hồ sơ nghi trùng**
Hệ thống cho phép nhân viên bán hàng xem danh sách các hồ sơ được xác định là nghi trùng.

**FR7 – So sánh hồ sơ nghi trùng**
Hệ thống cho phép nhân viên bán hàng so sánh thông tin của hai hồ sơ nghi trùng trước khi thực hiện gộp.

**FR8 – Gộp hồ sơ khách hàng trùng**
Hệ thống cho phép MANAGER xác nhận và trực tiếp thực hiện gộp hai hồ sơ thuộc cùng một khách hàng thành hồ sơ chuẩn. API gộp yêu cầu JWT hợp lệ và vai trò MANAGER; SALES không được phép thực hiện thao tác gộp.


### 3.2 User Story

**US1 – MUST**
Là nhân viên bán hàng, tôi muốn tạo hồ sơ khách hàng mới và được cảnh báo khi thông tin nhập có khả năng trùng với hồ sơ đã tồn tại để tránh tạo nhiều hồ sơ cho cùng một khách hàng.

**US2 – MUST**
Là nhân viên bán hàng, tôi muốn tra cứu khách hàng theo số điện thoại để nhanh chóng tìm đúng hồ sơ khách hàng.

**US3 – SHOULD**
Là nhân viên bán hàng, tôi muốn xem chi tiết hồ sơ khách hàng để kiểm tra thông tin trước khi phục vụ khách.

**US4 – SHOULD**
Là nhân viên bán hàng, tôi muốn cập nhật những hồ sơ do mình tạo để dữ liệu luôn chính xác mà không ảnh hưởng đến hồ sơ của người khác.

**US5 – SHOULD**
Là nhân viên bán hàng, tôi muốn xem danh sách các hồ sơ nghi trùng để xác định những hồ sơ cần xử lý.

**US6 – SHOULD**
Là nhân viên bán hàng, tôi muốn so sánh hai hồ sơ nghi trùng để xác định thông tin nào cần giữ lại trước khi gộp.

**US7 – MUST**
Là quản lý cửa hàng, tôi muốn xác nhận và trực tiếp gộp các hồ sơ thuộc cùng một khách hàng sau khi được kiểm tra, nhằm thống nhất dữ liệu và hạn chế gộp trái quyền.


### 3.3 Tiêu chí chấp nhận cho các User Story mức MUST

#### US1 – Tạo hồ sơ khách hàng mới và cảnh báo hồ sơ trùng

**AC1 – Luồng chính**
GIVEN số điện thoại chưa tồn tại trong hệ thống, không phát hiện hồ sơ nghi trùng và các thông tin bắt buộc hợp lệ,
WHEN nhân viên bán hàng nhập thông tin và chọn lưu hồ sơ,
THEN hệ thống tạo hồ sơ khách hàng mới và hiển thị thông tin hồ sơ vừa tạo.

**AC2 – Ngoại lệ: số điện thoại đã tồn tại**
GIVEN số điện thoại đã tồn tại trong hệ thống,
WHEN nhân viên bán hàng cố tạo hồ sơ mới với số điện thoại đó,
THEN hệ thống không tạo hồ sơ mới và hiển thị hồ sơ khách hàng đang tồn tại.

**AC3 – Ngoại lệ: phát hiện thông tin nghi trùng**
GIVEN thông tin khách hàng được nhập có khả năng trùng với một hồ sơ đã tồn tại,
WHEN nhân viên bán hàng thực hiện tạo hồ sơ,
THEN hệ thống hiển thị cảnh báo và thông tin hồ sơ nghi trùng để nhân viên kiểm tra trước khi tiếp tục.

**AC4 – Ngoại lệ: dữ liệu không hợp lệ**
GIVEN thông tin bắt buộc bị thiếu hoặc số điện thoại không hợp lệ,
WHEN nhân viên bán hàng chọn lưu hồ sơ,
THEN hệ thống từ chối lưu và hiển thị thông báo chỉ rõ dữ liệu cần sửa.


#### US2 – Tra cứu khách hàng theo số điện thoại

**AC1 – Luồng chính**
GIVEN số điện thoại thuộc một khách hàng đang tồn tại trong hệ thống,
WHEN nhân viên bán hàng thực hiện tra cứu theo số điện thoại,
THEN hệ thống hiển thị đúng hồ sơ khách hàng tương ứng.

**AC2 – Ngoại lệ: không tìm thấy khách hàng**
GIVEN số điện thoại chưa tồn tại trong hệ thống,
WHEN nhân viên bán hàng thực hiện tra cứu,
THEN hệ thống thông báo không tìm thấy hồ sơ khách hàng.

**AC3 – Mở hồ sơ chi tiết**
GIVEN hệ thống đã tìm thấy khách hàng,
WHEN nhân viên bán hàng chọn kết quả tra cứu,
THEN hệ thống mở thông tin chi tiết của hồ sơ khách hàng đó.


#### US7 – Gộp hồ sơ khách hàng trùng

**AC1 – Luồng chính**
GIVEN hai hồ sơ đã được xác nhận thuộc cùng một khách hàng và được quản lý cửa hàng xác nhận cho phép gộp,
WHEN quản lý cửa hàng xác nhận và thực hiện thao tác gộp hồ sơ,
THEN hệ thống hợp nhất thông tin thành một hồ sơ khách hàng chuẩn.

**AC2 – Ngoại lệ: thông tin xung đột chưa được xử lý**
GIVEN hai hồ sơ có thông tin xung đột cần lựa chọn,
WHEN người thực hiện gộp chưa chọn giá trị cần giữ lại,
THEN hệ thống không cho phép hoàn tất thao tác gộp và yêu cầu chọn thông tin phù hợp.

**AC3 – Ngoại lệ: quản lý không xác nhận gộp**
GIVEN hai hồ sơ đang chờ xác nhận gộp,
WHEN quản lý cửa hàng không xác nhận hai hồ sơ thuộc cùng một khách hàng,
THEN hệ thống không thực hiện thao tác gộp.

**AC4 – Ngoại lệ: hồ sơ không còn hợp lệ để gộp**
GIVEN một trong hai hồ sơ không còn tồn tại hoặc không còn đủ điều kiện để gộp,
WHEN quản lý cửa hàng thực hiện thao tác gộp,
THEN hệ thống dừng thao tác và hiển thị lý do.

**AC5 – Ngoại lệ: lỗi xảy ra trong quá trình gộp**
GIVEN thao tác gộp hồ sơ đang được thực hiện,
WHEN xảy ra lỗi giữa chừng,
THEN hệ thống hoàn tác toàn bộ thay đổi và dữ liệu trở về trạng thái trước khi gộp.


## 4. Yêu cầu phi chức năng

**NFR1 – Hiệu năng**
Hệ thống phải trả kết quả tra cứu khách hàng theo số điện thoại trong thời gian không quá **2 giây** với tối đa **10.000 hồ sơ khách hàng** trong môi trường thử nghiệm.

**NFR2 – Khả dụng**
Sau tối đa **15 phút hướng dẫn**, một nhân viên mới phải có thể thực hiện thao tác tra cứu và mở hồ sơ khách hàng trong không quá **2 phút**.

**NFR3 – Tin cậy dữ liệu**
**100% thao tác gộp hồ sơ** phải được thực hiện theo cơ chế đảm bảo toàn vẹn dữ liệu. Nếu thao tác gộp thất bại giữa chừng thì toàn bộ thay đổi phải được hoàn tác và dữ liệu phải trở về trạng thái trước khi gộp, không tồn tại hồ sơ bị gộp một phần.

> Các giá trị trong NFR1–NFR3 là ngưỡng mục tiêu đặt ra cho prototype để có thể kiểm chứng, không phải số liệu đo thực tế của hệ thống hiện hành.


## 5. Ràng buộc và quy tắc nghiệp vụ

**BR1 – Số điện thoại duy nhất**
Một số điện thoại đã tồn tại không được dùng để tạo thêm một hồ sơ khách hàng mới.

**BR2 – Chuẩn hóa số điện thoại**
Số điện thoại phải được chuẩn hóa về dạng **10 chữ số và bắt đầu bằng 0** trước khi tra cứu hoặc lưu.

**BR3 – Không tạo trùng khi đã tìm thấy khách hàng**
Nếu số điện thoại đã tồn tại, hệ thống phải hiển thị hồ sơ hiện có thay vì tạo thêm hồ sơ mới.

**BR4 – Xác nhận trước khi gộp**
Chỉ MANAGER đã xác thực được xác nhận và thực hiện thao tác gộp khi đã kiểm tra các hồ sơ thuộc cùng một khách hàng; SALES không có quyền gọi API gộp.

**BR5 – Xử lý thông tin xung đột**
Nếu hai hồ sơ có giá trị khác nhau ở cùng một trường, người thực hiện gộp phải chọn giá trị cần giữ lại trước khi hoàn tất thao tác gộp.

**BR6 – Hồ sơ sau gộp**
Sau khi gộp thành công, hệ thống chỉ sử dụng hồ sơ chuẩn cho các thao tác nghiệp vụ tiếp theo.

**BR7 – Toàn vẹn thao tác gộp**
Nếu xảy ra lỗi trong quá trình gộp, toàn bộ thay đổi liên quan phải được hoàn tác và không được tồn tại trạng thái gộp một phần.


## 6. Bảng truy vết yêu cầu

| Mã FR | User Story | Use Case | MoSCoW | Bảng dữ liệu | Màn hình |
| --- | --- | --- | --- | --- | --- |
| FR1 | US1 | UC2 | MUST | customer, app_user | M2 |
| FR2 | US2 | UC1 | MUST | customer | M1 |
| FR3 | US3 | UC3 | SHOULD | customer | M1 |
| FR4 | US4 | UC4 | SHOULD | customer | M2 |
| FR5 | US1 | UC2 | MUST | customer, duplicate_candidate | M2 |
| FR6 | US5 | UC5 | SHOULD | customer, duplicate_candidate | M3 |
| FR7 | US6 | UC6 | SHOULD | customer, duplicate_candidate | M3 |
| FR8 | US7 | UC7 | MUST | customer, customer_merge, app_user | M3 |

### Quy ước màn hình

- **M1 – Tra cứu và xem chi tiết khách hàng**
- **M2 – Tạo và cập nhật hồ sơ khách hàng**
- **M3 – Danh sách nghi trùng, so sánh và gộp hồ sơ**

## 7. Ghi chú đối chiếu triển khai và kiểm thử BT3 (14/11/2026)

### 7.1 Xác thực và phân quyền thực tế

- Các API quản lý khách hàng và hồ sơ nghi trùng yêu cầu JWT hợp lệ; API gộp chỉ cho phép MANAGER.
- Khi tạo khách hàng, backend tự lấy `created_by` từ danh tính đã xác thực, không tin giá trị do client gửi.
- Khi PATCH hoặc DELETE hồ sơ khách hàng, SALES chỉ được thao tác trên hồ sơ do mình tạo; MANAGER được phép thao tác không phụ thuộc người tạo.
- Các API đọc danh sách/chi tiết khách hàng hiện cho phép cả SALES và MANAGER đã xác thực, chưa lọc quyền đọc theo người tạo.
- DELETE hồ sơ là vô hiệu hóa logic (`is_active`), không phải xóa vật lý bản ghi.

### 7.2 Đối chiếu minh chứng BT3

- Đã ghi nhận HTTP 401 khi truy cập API khách hàng không có JWT.
- Đã ghi nhận HTTP 403 khi SALES (`user_id=1`) thử PATCH hồ sơ `customer_id=6` do `user_id=2` tạo; dữ liệu trước/sau yêu cầu bị từ chối không thay đổi.
- Đã ghi nhận HTTP 200 khi MANAGER PATCH hồ sơ số 6 bằng các giá trị hiện tại.
- Bộ kiểm thử tự động trong môi trường phát triển đạt 17/17 PASS; một số test sử dụng mock.
- Các trường hợp DELETE với database thật và truy cập đồng thời chưa được kiểm chứng độc lập trong đợt kiểm thử này.

### 7.3 Các yêu cầu chưa có đủ bằng chứng

- **FR5 / US1-AC3:** Chức năng quét/phát hiện nghi trùng tồn tại, nhưng chưa có bằng chứng end-to-end rằng cảnh báo tự hiển thị ngay trong lúc tạo khách hàng. Không coi yêu cầu này đã đạt hoàn toàn.
- **BR3 / US1-AC2:** Test đã chứng minh từ chối tạo khách hàng có số điện thoại trùng; chưa có bằng chứng riêng rằng giao diện tự hiển thị hồ sơ cũ theo đúng tiêu chí chấp nhận.
- **NFR1 (2 giây / 10.000 hồ sơ)** và **NFR2 (người dùng mới)** là mục tiêu chưa có phép đo hoặc thử nghiệm người dùng tương ứng.
- **NFR3 (rollback):** Đã có kiểm thử rollback của nghiệp vụ gộp với PostgreSQL theo Test Report, nhưng chưa chứng minh mọi kiểu lỗi và mọi tình huống cạnh tranh dữ liệu.

Các nội dung trong mục 7 là ghi chú đối chiếu BT3, không thay thế kết quả kiểm thử hoặc tự động xác nhận hoàn thành mọi yêu cầu trong SRS.
