Bạn là một senior software architect kiêm AI engineer và technical mentor. 
Hãy giúp tôi thiết kế và triển khai một dự án portfolio thực tế, đủ mạnh để đi xin việc vị trí lập trình viên có sử dụng AI.

# 1) Mục tiêu dự án
Tôi muốn xây dựng một web app tên tạm thời là:

AI Codebase Reviewer v1

Mục tiêu của hệ thống:
- Người dùng upload một file ZIP chứa source code của một dự án tĩnh
- Hệ thống giải nén, đọc cấu trúc project, phân tích codebase
- Giao diện web có 3 cột:
  1. Bên trái: cây thư mục dự án, nhưng chi tiết hơn GitHub, có thể mở đến cấp:
     Folder -> File -> Class -> Function/Method
  2. Ở giữa: vùng hiển thị source code lớn nhất, có line number, highlight vùng đang chọn, click ở cây bên trái thì nhảy tới đúng vị trí code
  3. Bên phải: panel AI review theo ngữ cảnh đang chọn (file / class / function), gồm summary, findings, suggestions, test cases
- Hệ thống phải có thể:
  - hiển thị cấu trúc project
  - tóm tắt codebase
  - review code theo file/class/function
  - gợi ý test case
  - trả lời câu hỏi dựa trên code đã upload
- Đây là bản v1 dùng ZIP upload, chưa làm GitHub webhook/realtime ở giai đoạn đầu
- Sau này có thể nâng cấp lên GitHub integration và PR review realtime

# 2) Ý nghĩa của dự án
Tôi muốn dự án này thể hiện rõ các kỹ năng mà công ty công nghệ kỳ vọng ở một lập trình viên biết dùng AI:
- prompt engineering
- context selection / context engineering
- RAG cho codebase
- AI-assisted review
- structured output
- test suggestion
- source-grounded responses
- hệ thống web thực tế, không phải chatbot đơn giản

# 3) Tech stack mong muốn
Ưu tiên stack sau:
- Frontend: React
- Backend: Python + FastAPI
- Code viewer: Monaco Editor nếu phù hợp
- Lưu trữ ban đầu: local hoặc database đơn giản
- Vector retrieval: FAISS hoặc cách đơn giản tương đương
- Code parsing:
  - tối thiểu hỗ trợ Python trước
  - có thể thiết kế để sau này mở rộng ngôn ngữ khác
- Output review nên có cấu trúc rõ ràng, ví dụ theo JSON schema

# 4) Ràng buộc quan trọng
Hãy tuân thủ các ràng buộc sau:

## 4.1. Ràng buộc sản phẩm
- Không biến dự án thành chatbot thuần túy
- Đây phải là một developer tool rõ ràng
- UI phải xoay quanh việc duyệt code và xem review theo ngữ cảnh
- Trải nghiệm chính là click vào project tree -> xem code -> xem AI review
- Bản đầu tập trung vào code tĩnh từ ZIP, không ôm quá nhiều tính năng

## 4.2. Ràng buộc kỹ thuật
- Không dùng kiến trúc quá phức tạp ở bản đầu
- Không bắt đầu bằng microservices
- Không bắt đầu bằng GitHub App/webhook/realtime
- Không yêu cầu cloud phức tạp ở MVP
- Không phân tích toàn bộ project bằng một prompt duy nhất nếu có thể tránh
- Phải có bước parse/chunk/retrieve context hợp lý trước khi gọi model
- Chỉ nên gửi context liên quan đến file/class/function đang được chọn hoặc câu hỏi đang được hỏi
- Cần thiết kế dữ liệu để frontend có thể render cây:
  Folder -> File -> Class -> Function/Method
- Cần tách rõ:
  - upload/extract
  - parse/index
  - retrieve
  - AI analyze
  - review/test suggestion
  - API cho frontend

## 4.3. Ràng buộc về AI
- Phải giảm hallucination bằng cách:
  - retrieve context liên quan
  - trích dẫn file, class, function, line range nếu có
  - giới hạn câu trả lời trong code đã upload
- Output review phải có cấu trúc
- Review nên chia ít nhất thành:
  - summary
  - findings
  - suggestions
  - test cases
- Mỗi finding nên có:
  - severity
  - title
  - explanation
  - line range hoặc symbol liên quan
  - suggestion
- Có thể dùng JSON schema hoặc Pydantic model cho output

## 4.4. Ràng buộc về chất lượng code
- Code phải dễ đọc, chia module rõ
- Không dồn toàn bộ logic vào một file
- Không tạo code “ảo” không chạy được
- Ưu tiên cấu trúc thư mục sạch
- Mỗi bước phải giải thích vì sao chọn thiết kế đó
- Khi đề xuất code, phải nói rõ file nào cần tạo/sửa
- Nếu có nhiều cách làm, hãy chọn cách phù hợp nhất cho portfolio của một cá nhân muốn hoàn thành được dự án

# 5) Những gì tôi muốn bạn làm
Tôi muốn bạn giúp tôi theo thứ tự sau:

## Bước 1
Viết lại bài toán ngắn gọn nhưng chính xác, để xác nhận bạn hiểu đúng dự án.

## Bước 2
Đề xuất kiến trúc tổng thể của hệ thống:
- frontend
- backend
- pipeline xử lý ZIP
- pipeline parse code
- pipeline retrieve + AI analyze
- cách dữ liệu chảy từ trái -> giữa -> phải trong UI

## Bước 3
Đề xuất cấu trúc thư mục cho toàn bộ dự án:
- frontend/
- backend/
- các module chính
- tên file gợi ý

## Bước 4
Đề xuất mô hình dữ liệu/API tối thiểu cho MVP:
- project metadata
- project tree
- code symbol
- source content
- review result
- test suggestion
- chat/question answer nếu có

## Bước 5
Xác định feature MVP thật sự cần có cho bản v1
và tách riêng những gì để bản sau.

## Bước 6
Mô tả chi tiết UI 3 cột:
- cột trái cần component gì
- cột giữa cần component gì
- cột phải cần component gì
- event flow khi click file/class/function
- cách đồng bộ explorer, editor và review panel

## Bước 7
Đề xuất kế hoạch triển khai theo từng giai đoạn nhỏ, sao cho tôi có thể code cùng LLM/Codex mà vẫn hiểu rõ dự án.

# 6) Cách bạn phải trả lời
Hãy trả lời có cấu trúc rõ ràng theo đúng 7 bước trên.
Không viết lan man.
Không bỏ qua ràng buộc.
Không nhảy ngay vào viết code toàn bộ.
Ưu tiên:
- kiến trúc rõ
- module rõ
- lý do chọn thiết kế
- phạm vi vừa sức
- dễ mở rộng sau này

# 7) Điều cực kỳ quan trọng
Tôi không muốn chỉ “có code chạy được”.
Tôi muốn:
- hiểu rõ dự án để đi phỏng vấn
- biết vì sao từng phần tồn tại
- biết phần nào thể hiện kỹ năng AI
- biết cách kể câu chuyện dự án trong CV/portfolio

Vì vậy, mọi đề xuất của bạn phải cân bằng giữa:
- tính thực tế khi triển khai
- khả năng hoàn thành
- giá trị thể hiện kỹ năng xin việc

Bắt đầu từ Bước 1.