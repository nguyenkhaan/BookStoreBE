# Authentication & Authorization

## Overview
This document lists all API endpoints with their required HTTP methods and required roles for authorization.

| Module | Endpoint | HTTP Method | Required Role |
|--------|----------|-------------|---------------|
| **Auth** | /auth/verify | GET | Public |
| | /auth/test | GET | Public |
| | /auth/login | POST | Public |
| | /auth/testing | POST | CUSTOMER |
| | /auth/logout | GET | Authenticated |
| | /auth/me | GET | Authenticated |
| **Bill** | /bill | GET | EMPLOYEE |
| | /bill | POST | EMPLOYEE |
| | /bill/:billId | GET | ADMIN |
| | /bill/:billId | PUT | EMPLOYEE |
| | /bill/:billId | DELETE | ADMIN |
| | /bill/code/:code | GET | ADMIN |
| | /bill/statistic | GET | EMPLOYEE |
| | /bill/option | GET | EMPLOYEE |
| **Book** | /book | GET | EMPLOYEE |
| | /book | POST | ADMIN |
| | /book/upload | POST | Public |
| | /book/:bookId | GET | EMPLOYEE |
| | /book/:bookId | PUT | ADMIN |
| | /book/:bookId | DELETE | EMPLOYEE |
| | /book/code/:code | GET | EMPLOYEE |
| | /book/statistic | GET | ADMIN |
| **Author** | /author/code | GET | EMPLOYEE |
| | /author/search | GET | EMPLOYEE |
| **Customer** | /customer | GET | EMPLOYEE |
| | /customer | POST | ADMIN |
| | /customer/:customerId | DELETE | No Permission |
| | /customer/:customerId | PUT | ADMIN |
| | /customer/statistic | GET | ADMIN |
| | /customer/phone | GET | EMPLOYEE |
| **Employee** | /employee/verify | GET | ADMIN |
| | /employee | GET | ADMIN |
| | /employee | POST | ADMIN |
| | /employee/:employeeId | PUT | ADMIN |
| | /employee/:employeeId | DELETE | ADMIN |
| | /employee/department-position | GET | ADMIN |
| | /employee/options | GET | ADMIN |
| | /employee/profile | GET | ADMIN |
| | /employee/code | GET | ADMIN |
| | /employee/statistic | GET | ADMIN |
| **Admin** | /admin/testing | GET | ADMIN |
| | /admin/employee/register | POST | ADMIN |
| | /admin/employee/reset-password | PATCH | ADMIN |
| | /admin/employee/:employeeId | PUT | ADMIN |
| | /admin/employee/:employeeId | DELETE | ADMIN |
| **Publisher** | /publisher/search | GET | EMPLOYEE |
| **Voucher** | /voucher | GET | EMPLOYEE |
| | /voucher | POST | EMPLOYEE |
| | /voucher/:voucherId | GET | EMPLOYEE |
| | /voucher/:voucherId | PUT | EMPLOYEE |
| | /voucher/:voucherId | DELETE | EMPLOYEE |
| | /voucher/use | GET | EMPLOYEE |
| | /voucher/options | GET | EMPLOYEE |
| | /voucher/statistic | GET | EMPLOYEE |
| **Rule** | /rule | GET | EMPLOYEE |
| | /rule | POST | ADMIN |
| | /rule/:ruleId | GET | EMPLOYEE |
| | /rule/:ruleId | PUT | ADMIN |
| | /rule/:ruleId | DELETE | ADMIN |
| | /rule/options | GET | EMPLOYEE |
| | /rule/statistic | GET | EMPLOYEE |
| | /rule/option-managing | PATCH | ADMIN |
| **Income** | /income | GET | EMPLOYEE |
| | /income | POST | EMPLOYEE |
| | /income/:id | GET | ADMIN |
| | /income/:id | PUT | No Permission |
| | /income/:id | DELETE | No Permission |
| | /income/code/:code | GET | ADMIN |
| | /income/options | GET | EMPLOYEE |
| | /income/statistic | GET | ADMIN |
| **Outcome** | /outcome | GET | EMPLOYEE |
| | /outcome | POST | EMPLOYEE |
| | /outcome/:outcomeId | GET | ADMIN |
| | /outcome/:outcomeId | PUT | EMPLOYEE |
| | /outcome/:outcomeId | DELETE | ADMIN |
| | /outcome/code/:code | GET | ADMIN |
| | /outcome/options | GET | EMPLOYEE |
| | /outcome/statistic | GET | ADMIN |
| **Category** | /category | GET | EMPLOYEE |
| **Search** | /search/customer | GET | EMPLOYEE |
| | /search/employee | GET | EMPLOYEE |
| | /search/rule | GET | EMPLOYEE |
| | /search/book | GET | EMPLOYEE |
| | /search/bill | GET | EMPLOYEE |
| | /search/income | GET | EMPLOYEE |
| | /search/outcome | GET | EMPLOYEE |
| **Statistic** | /statistic/general | GET | ADMIN |
| | /statistic/top-customer | GET | ADMIN |
| | /statistic/revenue | GET | ADMIN |
| | /statistic/revenue/month/:month | GET | ADMIN |
| | /statistic/revenue/bill/:month | GET | ADMIN |
| | /statistic/top-books | GET | ADMIN |
| **Test** | /test | GET | Public |

## Notes
- **Public**: No authentication required
- **Authenticated**: Only requires a valid JWT token (no specific role required)
- **No Permission**: Endpoint exists but currently has no role guard (potential security issue)

## Some flow logic 
## 1.Book 
- Nhập sách . Chỉnh sửa thông tin sách 
- Bỏ cái Nhập sách mới lên kệ gì đó đi. Chỉ cần xem thông tin sách chi tiết 

## 2. Mua hàng 
- Khách hàng mua hàng ----> Tạo hóa đơn -----> Đây là khách vãng lai -----> Vẫn cho mua hàng và tính công nợ 
-----> Tạo phiếu thu cho khách hàng ------> Tạo tài khoản cho khách 