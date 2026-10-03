### User Story

**US1 – MUST**  
Là nhân viên bán hàng, tôi muốn tạo hồ sơ khách hàng mới để lưu thông tin khách hàng chưa có trong hệ thống.

**US2 – MUST**  
Là nhân viên bán hàng, tôi muốn tra cứu khách hàng theo số điện thoại để nhanh chóng tìm đúng hồ sơ khách hàng.

**US3 – SHOULD**  
Là nhân viên bán hàng, tôi muốn xem chi tiết hồ sơ khách hàng để kiểm tra thông tin trước khi phục vụ khách.

**US4 – SHOULD**  
Là nhân viên bán hàng, tôi muốn cập nhật thông tin khách hàng để hồ sơ luôn chính xác và đầy đủ.

**US5 – SHOULD**  
Là nhân viên bán hàng, tôi muốn được cảnh báo khi thông tin nhập có khả năng trùng hồ sơ đã có để hạn chế tạo hồ sơ trùng.

**US6 – SHOULD**  
Là nhân viên bán hàng, tôi muốn xem danh sách các hồ sơ nghi trùng để xác định những hồ sơ cần xử lý.

**US7 – SHOULD**  
Là nhân viên bán hàng, tôi muốn so sánh hai hồ sơ nghi trùng để xác định thông tin nào cần giữ lại trước khi gộp.

**US8 – MUST**  
Là nhân viên bán hàng, tôi muốn gộp các hồ sơ được xác nhận là cùng một khách hàng để dữ liệu khách hàng được thống nhất thành một hồ sơ chuẩn.

### Tiêu chí chấp nhận cho các User Story mức MUST

#### US1 – Tạo hồ sơ khách hàng mới

**AC1 – Luồng chính**  
GIVEN số điện thoại chưa tồn tại trong hệ thống và các thông tin bắt buộc hợp lệ,  
WHEN nhân viên bán hàng nhập thông tin và chọn lưu hồ sơ,  
THEN hệ thống tạo hồ sơ khách hàng mới và hiển thị thông tin hồ sơ vừa tạo.

**AC2 – Ngoại lệ: số điện thoại đã tồn tại**  
GIVEN số điện thoại đã tồn tại trong hệ thống,  
WHEN nhân viên bán hàng cố tạo hồ sơ mới với số điện thoại đó,  
THEN hệ thống không tạo hồ sơ mới và hiển thị hồ sơ khách hàng đang tồn tại.

**AC3 – Ngoại lệ: dữ liệu không hợp lệ**  
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


#### US8 – Gộp hồ sơ khách hàng trùng

**AC1 – Luồng chính**  
GIVEN hai hồ sơ đã được xác nhận thuộc cùng một khách hàng,  
WHEN nhân viên bán hàng xác nhận gộp hồ sơ,  
THEN hệ thống hợp nhất thông tin thành một hồ sơ khách hàng chuẩn.

**AC2 – Ngoại lệ: thông tin xung đột chưa được xử lý**  
GIVEN hai hồ sơ có thông tin xung đột cần lựa chọn,  
WHEN nhân viên bán hàng chưa chọn giá trị cần giữ lại,  
THEN hệ thống không cho phép hoàn tất thao tác gộp và yêu cầu chọn thông tin phù hợp.

**AC3 – Ngoại lệ: hồ sơ không còn hợp lệ để gộp**  
GIVEN một trong hai hồ sơ không còn tồn tại hoặc không còn đủ điều kiện để gộp,  
WHEN nhân viên bán hàng xác nhận thao tác gộp,  
THEN hệ thống dừng thao tác và hiển thị lý do.