export enum ResponseBody {
    MESSAGE = 'message',
    ERROR = 'errCode',
    STATUS = 'status'
}

// errCode take notes:
/**
 * 0  : Success
 * 1  : Unknown error
 * 2  : Invalid input data
 * 3  : Unauthorized (token invalid / not logged in)
 * 4  : Forbidden (no permission)
 * 5  : Resource not found
 * 6  : Resource already exists
 * 7  : Validation failed
 * 8  : Database error
 * 9  : Internal server error
 * 10 : Account deleted
 * 11 : Account disabled
 */