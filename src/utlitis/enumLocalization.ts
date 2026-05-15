export const ENUM_VI_MAP = {
	billStatus: {
		COMPLETE: 'Hoàn thành',
		NOT_STARTED: 'Chưa bắt đầu',
		OVERDUE: 'Quá hạn',
	},
	outcomeStatus: {
		COMPLETE: 'Hoàn thành',
		PENDING: 'Đang chờ',
		CANCEL: 'Đã hủy',
	},
	incomeStatus: {
		COMPLETE: 'Hoàn thành',
		PENDING: 'Đang chờ',
		CANCEL: 'Đã hủy',
	},
	incomePaymentType: {
		CASH: 'Tiền mặt',
		TRANSFER: 'Chuyển khoản',
		CARD: 'Thẻ',
	},
	role: {
		ADMIN: 'Quản trị viên',
		EMPLOYEE: 'Nhân viên',
		CUSTOMER: 'Khách hàng',
	},
	voucherType: {
		VND: 'Giảm theo tiền',
		PERCENT: 'Giảm theo phần trăm',
	},
	voucherStatus: {
		APPLYING: 'Đang áp dụng',
		UPCOMING: 'Sắp áp dụng',
		ENDED: 'Đã kết thúc',
	},
} as const;

export function mapEnumToVietnamese<T extends string>(
	value: T | null | undefined,
	dict: Record<string, string>,
): string {
	if (!value) return 'Chưa có thông tin';
	return dict[value] ?? value;
}

export function mapEnumOptionsToVietnamese<T extends string>(
	values: T[],
	dict: Record<string, string>,
) {
	return values.map((value) => ({
		value,
		label: dict[value] ?? value,
	}));
}
