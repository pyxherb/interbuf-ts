import { ClassLayout, DataType, DataTypeKind, StructLayout, StructInstance, ClassInstance } from "./doc";
import { isDataInRangeI16, isDataInRangeI32, isDataInRangeI64, isDataInRangeI8, isDataInRangeU16, isDataInRangeU32, isDataInRangeU64, isDataInRangeU8 } from "./util";

interface Reader {
	read(size: bigint): ArrayBuffer;
	readI8(): number;
	readI16(): number;
	readI32(): number;
	readI64(): bigint;
	readU8(): number;
	readU16(): number;
	readU32(): number;
	readU64(): bigint;
	readF32(): number;
	readF64(): number;
	readBool(): boolean;
}

interface StructMemberDeserializeFrameExData {
	layout: StructLayout,
	idxMember: number,
	obj: StructInstance
}

interface ClassMemberDeserializeFrameExData {
	layout: ClassLayout,
	numMembers: number,
	idxMember: number,
	obj: ClassInstance
}

interface ArrayMemberDeserializeFrameExData {
	dataType: DataType,
	idxMember: number,
	length: bigint,
	obj: any[]
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

let textDecoder = new TextDecoder("utf-8")

function _doDeserializeByDataType(context: DeserializeContext, dataType: DataType): any {
	switch (dataType.kind) {
		case DataTypeKind.I8: {
			let data = context.reader.readI8();

			if (!isDataInRangeI8(data))
				throw RangeError("The data is out of range of the type");

			return data;
		}
		case DataTypeKind.I16: {
			let data = context.reader.readI16();

			if (!isDataInRangeI16(data))
				throw RangeError("The data is out of range of the type");

			return data;
		}
		case DataTypeKind.I32: {
			let data = context.reader.readI32();

			if (!isDataInRangeI32(data))
				throw RangeError("The data is out of range of the type");

			return data;
		}
		case DataTypeKind.I64: {
			let data = context.reader.readI64();

			if (!isDataInRangeI64(data))
				throw RangeError("The data is out of range of the type");

			return data;
		}
		case DataTypeKind.U8: {
			let data = context.reader.readU8();

			if (!isDataInRangeU8(data))
				throw RangeError("The data is out of range of the type");

			return data;
		}
		case DataTypeKind.U16: {
			let data = context.reader.readU16();

			if (!isDataInRangeU16(data))
				throw RangeError("The data is out of range of the type");

			return data;
		}
		case DataTypeKind.U32: {
			let data = context.reader.readU32();

			if (!isDataInRangeU32(data))
				throw RangeError("The data is out of range of the type");

			return data;
		}
		case DataTypeKind.U64: {
			let data = context.reader.readU64();

			if (!isDataInRangeU64(data))
				throw RangeError("The data is out of range of the type");

			return data;
		}
		case DataTypeKind.String: {
			let length = context.reader.readU64();

			if (!isDataInRangeU64(length))
				throw RangeError("The length is too long");

			let nameBuffer = context.reader.read(length);

			let data = textDecoder.decode(nameBuffer);

			return data;
		}
		case DataTypeKind.Bool: {
			let data = context.reader.readBool();

			return data;
		}
		case DataTypeKind.Struct: {
			let isNotNull = context.reader.readBool();

			if(!isNotNull)
				return null;

			let sl = dataType.typeDef as StructLayout;
			let s: StructInstance = {};

			let newFrame = {
				exData: {
					layout: sl,
					idxMember: 0,
					obj: s
				} as StructMemberDeserializeFrameExData,
				frameType: DeserializeFrameType.StructMember
			} as DeserializeFrame;

			context.frames.push(newFrame);

			return s;
		}
		case DataTypeKind.Class: {
			let isNotNull = context.reader.readBool();

			if(!isNotNull)
				return null;

			let cl = dataType.typeDef as ClassLayout;
			let c: ClassInstance = {};

			let newFrame = {
				exData: {
					layout: cl,
					idxMember: 0,
					obj: c
				} as ClassMemberDeserializeFrameExData,
				frameType: DeserializeFrameType.ClassMember
			} as DeserializeFrame;

			context.frames.push(newFrame);

			return c;
		}
		case DataTypeKind.Array: {
			let length = context.reader.readU64();

			if(length === 0n)
				return null;

			let s: any[] = [];

			let newFrame = {
				exData: {
					dataType: dataType.typeDef as DataType,
					idxMember: 0,
					length: length
				} as ArrayMemberDeserializeFrameExData,
				frameType: DeserializeFrameType.StructMember
			} as DeserializeFrame;

			context.frames.push(newFrame);

			return s;
		}
	}
}

function _doDeserialize(context: DeserializeContext): void {
	while (context.frames.length) {
		let frame = context.frames[context.frames.length];

		if (frame == null)
			throw Error("The frame in the serialize context should not be null");

		if (frame.exData == null)
			throw Error("The frame exdata should not be null");

		switch (frame.frameType) {
			case DeserializeFrameType.StructMember: {
				let exData = frame.exData as StructMemberDeserializeFrameExData;

				if (exData.idxMember >= exData.layout.fields.length) {
					context.frames.pop();
					break;
				}

				let i = exData.layout.fields[exData.idxMember];

				if (!i)
					throw Error("Fields in layout should not be null");

				exData.obj[i.name] = _doDeserializeByDataType(context, i.type);
				++exData.idxMember;
				break;
			}
			case DeserializeFrameType.ClassMember: {
				let exData = frame.exData as ClassMemberDeserializeFrameExData;

				if (exData.idxMember >= exData.numMembers) {
					context.frames.pop();
					break;
				}

				let length = context.reader.readU64();

				let nameBuffer = context.reader.read(length);

				let name = textDecoder.decode(nameBuffer);

				let fieldIndex = exData.layout.fieldIndices[name];

				if(fieldIndex === undefined)
					throw Error("Field " + name + " is not in the class layout");
				let i = exData.layout.fields[fieldIndex];
				if(i === undefined)
					throw Error("Field index is corrupted");

				exData.obj[name] = _doDeserializeByDataType(context, i.type);
				++exData.idxMember;
				break;
			}
			case DeserializeFrameType.ArrayMember: {
				let exData = frame.exData as ArrayMemberDeserializeFrameExData;

				if (exData.idxMember >= exData.length) {
					context.frames.pop();
					break;
				}

				exData.obj[exData.idxMember] = _doDeserializeByDataType(context, exData.dataType);
				++exData.idxMember;
				break;
			}
			default:
				throw Error("Unrecognized frame type");
		}
	}
}

export function deserializeStruct(reader: Reader, rootLayout: StructLayout): StructInstance {
	let context: DeserializeContext = {
		frames: [],
		reader: reader
	};

	let obj: StructInstance = {};

	let newFrame: DeserializeFrame = {
		exData: {
			layout: rootLayout,
			idxMember: 0,
			obj: obj
		} as StructMemberDeserializeFrameExData,
		frameType: DeserializeFrameType.StructMember
	};

	context.frames.push(newFrame);

	_doDeserialize(context);

	return obj;
}

export function deserializeClass(reader: Reader, rootLayout: ClassLayout): ClassInstance {
	let context: DeserializeContext = {
		frames: [],
		reader: reader
	};

	let obj: ClassInstance = {};

	let newFrame: DeserializeFrame = {
		exData: {
			layout: rootLayout,
			idxMember: 0,
			obj: obj
		} as ClassMemberDeserializeFrameExData,
		frameType: DeserializeFrameType.ClassMember
	};

	context.frames.push(newFrame);

	_doDeserialize(context);

	return obj;
}
