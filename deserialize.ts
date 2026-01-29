import { ClassLayout, DataType, StructLayout } from "./doc";

interface Reader {
	read(): ArrayBuffer;
	readI8(): number;
	readI16(): number;
	readI32(): number;
	readI64(): bigint;
	readU8(): number;
	readU16(): number;
	readU32(): number;
	readU64(): bigint;
}

interface StructMemberDeserializeFrameExData {
	layout: StructLayout,
	idxMember: number
}

interface ClassMemberDeserializeFrameExData {
	layout: ClassLayout,
	idxMember: number
}

interface ArrayMemberDeserializeFrameExData {
	dataType: DataType,
	idxMember: number
}

enum DeserializeFrameType {
	StructMember,
	ClassMember,
	ArrayMember
}

interface DeserializeFrame {
	exData: StructMemberDeserializeFrameExData | ClassMemberDeserializeFrameExData | ArrayMemberDeserializeFrameExData,
	frameType: DeserializeFrameType
}

interface DeserializeContext {
	frames: DeserializeFrame[]
	reader: Reader
}

function _doDeserialize(context: DeserializeContext): void {
	while (context.frames.length) {
		let frame = context.frames[context.frames.length];

		if (frame == null)
			throw Error("The frame in the serialize context should not be null");

		if (frame.exData == null)
			throw Error("The frame exdata should not be null");

		// TODO: Implement it.
	}
}

function deserializeStruct(): void {

}
