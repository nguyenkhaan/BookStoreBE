// labels.ts
import {
	BookCategory,
	Role,
	MemberGrade,
	RuleType,
	VoucherType,
	IncomeStatus,
	OutcomeStatus,
	VoucherStatus,
	TokenType,
	EmployeeStatus,
	RuleStatus,
	BillStatus,
	IncomePaymentType,
} from '@prisma/client';
// BOOK CATEGORY
export const BookCategoryLabel: Record<BookCategory, string> = {
	VAN_HOC: 'Văn học',
	TRINH_THAM: 'Trinh thám',
	THIEU_NHI: 'Thiếu nhi',
	GIAO_DUC: 'Giáo dục',
	KINH_TE: 'Kinh tế',
	KY_NANG_SONG: 'Kỹ năng sống',
};

// ROLE
export const RoleLabel: Record<Role, string> = {
	ADMIN: 'Quản trị',
	EMPLOYEE: 'Nhân viên',
	CUSTOMER: 'Khách hàng',
};

// MEMBER GRADE
export const MemberGradeLabel: Record<MemberGrade, string> = {
	BRONZE: 'Đồng',
	SILVER: 'Bạc',
	GOLD: 'Vàng',
	DIAMOND: 'Kim cương',
};

// RULE TYPE
export const RuleTypeLabel: Record<RuleType, string> = {
	HUMAN: 'Nhân sự',
	SALE: 'Bán hàng',
	LOGISTIC: 'Vận hành',
	SERVICE: 'Dịch vụ',
	FINANCE: 'Tài chính',
	SAFETY: 'An toàn',
};

// VOUCHER TYPE
export const VoucherTypeLabel: Record<VoucherType, string> = {
	VND: 'Tiền mặt',
	PERCENT: 'Phần trăm',
};

// INCOME STATUS
export const IncomeStatusLabel: Record<IncomeStatus, string> = {
	COMPLETE: 'Hoàn thành',
	PENDING: 'Chờ xử lý',
	CANCEL: 'Đã hủy',
};

// OUTCOME STATUS
export const OutcomeStatusLabel: Record<OutcomeStatus, string> = {
	COMPLETE: 'Hoàn thành',
	PENDING: 'Chờ xử lý',
	CANCEL: 'Đã hủy',
};

// VOUCHER STATUS
export const VoucherStatusLabel: Record<VoucherStatus, string> = {
	APPLYING: 'Đang áp dụng',
	UPCOMING: 'Sắp diễn ra',
	ENDED: 'Đã kết thúc',
};

// TOKEN TYPE
export const TokenTypeLabel: Record<TokenType, string> = {
	RESET_PASSWORD: 'Đặt lại mật khẩu',
	ACCESS: 'Truy cập',
	REFRESH: 'Làm mới',
	VERIFY_EMAIL: 'Xác thực email',
};

// EMPLOYEE STATUS
export const EmployeeStatusLabel: Record<EmployeeStatus, string> = {
	WORKING: 'Đang làm',
	LEAVE: 'Nghỉ phép',
	RETIRED: 'Nghỉ việc',
};

// RULE STATUS
export const RuleStatusLabel: Record<RuleStatus, string> = {
	APPLYING: 'Đang áp dụng',
	UPCOMING: 'Sắp áp dụng',
	REJECT: 'Từ chối',
};

// BILL STATUS
export const BillStatusLabel: Record<BillStatus, string> = {
	COMPLETE: 'Hoàn thành',
	NOT_STARTED: 'Chưa thanh toán',
	OVERDUE: 'Quá hạn',
};

// PAYMENT TYPE
export const IncomePaymentTypeLabel: Record<IncomePaymentType, string> = {
	CASH: 'Tiền mặt',
	TRANSFER: 'Chuyển khoản',
	CARD: 'Thẻ',
};
