export function isDataInRangeI8(data: number): boolean {
	if ((data < -128) || (data > 127))
		return false;
	return true;
}
export function isDataInRangeI16(data: number): boolean {
	if ((data < -32768) || (data > 32767))
		return false;
	return true;
}
export function isDataInRangeI32(data: number): boolean {
	if ((data < -2147483648) || (data > 2147483647))
		return false;
	return true;
}
export function isDataInRangeI64(data: bigint): boolean {
	if ((data < -0x8000000000000000n) || (data > 0x7fffffffffffffffn))
		return false;
	return true;
}
export function isDataInRangeU8(data: number): boolean {
	if ((data < 0) || (data > 255))
		return false;
	return true;
}
export function isDataInRangeU16(data: number): boolean {
	if ((data < 0) || (data > 65535))
		return false;
	return true;
}
export function isDataInRangeU32(data: number): boolean {
	if ((data < 0) || (data > 0xffffffff))
		return false;
	return true;
}
export function isDataInRangeU64(data: bigint): boolean {
	if ((data < 0n) || (data > 0xffffffffffffffffn))
		return false;
	return true;
}
