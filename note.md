Backend 
- Sửa lại theo qui định cô gửi bên Zalo 

- Tạo hóa đơn: 
    + Sử customerId thành phone của customer
    + Them sach, sua thanh code cua sach 
    + Them ma giam gia bang code (Code Voucher) 
- voucher.prisma 
    + Bo sung them code vao voucher.table 
- Thêm phần thống kê nhỏ cho từng trang 

Frontend 
- Thong tin nhan vien: O chuc vu va phong ban sua thanh Dropbox. 
- Them sach: 
    + Chinh sua The loai thanh Dropbox 
    + Nhap tac gia, nhap nha xuat ban lam dang o la filter 
- Them khach hang: 
    + Bo tong chi tieu 
- Tao phieu thu moi 
    + Them khach hang. Chinh o ten khach hang thanh so dien thoai 
    + Them nguoi thu: Chuyen tu ten nhan vien thanh ma nhan vien 
- Tao phieu nhap. 
    + Nguoi tao: Chuyen thanh ma nhan vien 
- Bỏ trang nghỉ phép 
- Bỏ trang xin nghỉ việc 



Bo sung them chuc nang 
- Thong ke theo thang 
- Thong ke no dau, no cuoi cua khang hang theo 1 thang, thong ke ton dau/ton cuoi cua sach theo thang 


- Gui lai thong tin ve cac truong tao truong, tao bieu mau 


Frontend: 
UI -> Backend: Guard ---> Redis (Rate Limit) ----> Controller ----> Service ----> Model ----> Response 