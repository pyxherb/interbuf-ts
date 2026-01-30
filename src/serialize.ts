import { ClassInstance, ClassLayout, DataType, DataTypeKind, StructInstance, StructLayout } from "./doc";
import { isDataInRangeI16, isDataInRangeI32, isDataInRangeI64, isDataInRangeI8, isDataInRangeU16, isDataInRangeU32, isDataInRangeU64, isDataInRangeU8 } from "./util";

interface Writer {
	write(src: ArrayBuffer): void;
	writeI8(data: number): void;
	writeI16(data: number): void;
	writeI32(data: number): void;
	writeI64(data: bigint): void;
	writeU8(data: number): void;
	writeU16(data: number): void;
	writeU32(data: number): void;
	writeU64(data: bigint): void;
	writeF32(data: number): void;
	writeF64(data: number): void;
	writeBool(data: boolean): void;
}

interface StructMemberSerializeFrameExData {
	layout: StructLayout,
	idxMember: number,
	obj: StructInstance
}

interface ClassMemberSerializeFrameExData {
	layout: ClassLayout,
	idxMember: number,
	obj: ClassInstance
}

interface ArrayMemberSerializeFrameExData {
	dataType: DataType,
	idxMember: number,
	obj: any[]
}

enum SerializeFrameType {
	StructMember,
	ClassMember,
	ArrayMember
}

interface SerializeFrame {
	exData: StructMemberSerializeFrameExData | ClassMemberSerializeFrameExData | ArrayMemberSerializeFrameExData,
	frameType: SerializeFrameType
}

interface SerializeContext {
	frames: SerializeFrame[]
	writer: Writer
}

let textEncoder = new TextEncoder();

function _doSerializeByDataType(context: SerializeContext, dataType: DataType, dataIn: any) {
	switch (dataType.kind) {
		case DataTypeKind.I8: {
			let data = dataIn as number;

			if (!isDataInRangeI8(data))
				throw RangeError("The data is out of range of the type");

			context.writer.writeI8(data);
			break;
		}
		case DataTypeKind.I16: {
			let data = dataIn as number;

			if (!isDataInRangeI16(data))
				throw RangeError("The data is out of range of the type");

			context.writer.writeI16(data);
			break;
		}
		case DataTypeKind.I32: {
			let data = dataIn as number;

			if (!isDataInRangeI32(data))
				throw RangeError("The data is out of range of the type");

			context.writer.writeI32(data);
			break;
		}
		case DataTypeKind.I64: {
			let data = dataIn as bigint;

			if (!isDataInRangeI64(data))
				throw RangeError("The data is out of range of the type");

			context.writer.writeI64(data);
			break;
		}
		case DataTypeKind.U8: {
			let data = dataIn as number;

			if (!isDataInRangeU8(data))
				throw RangeError("The data is out of range of the type");

			context.writer.writeU8(data);
			break;
		}
		case DataTypeKind.U16: {
			let data = dataIn as number;

			if (!isDataInRangeU16(data))
				throw RangeError("The data is out of range of the type");

			context.writer.writeU16(data);
			break;
		}
		case DataTypeKind.U32: {
			let data = dataIn as number;

			if (!isDataInRangeU32(data))
				throw RangeError("The data is out of range of the type");

			context.writer.writeU32(data);
			break;
		}
		case DataTypeKind.U64: {
			let data = dataIn as bigint;

			if (!isDataInRangeU64(data))
				throw RangeError("The data is out of range of the type");

			context.writer.writeU64(data);
			break;
		}
		case DataTypeKind.F32: {
			let data = dataIn as number;

			context.writer.writeF32(data);
			break;
		}
		case DataTypeKind.F64: {
			let data = dataIn as number;

			context.writer.writeF64(data);
			break;
		}
		case DataTypeKind.String: {
			let data = dataIn as string;

			if(!isDataInRangeU64(BigInt(data.length)))
				throw RangeError("The length is too long");

			context.writer.writeU64(BigInt(data.length));

			context.writer.write(textEncoder.encode(data).buffer);
			break;
		}
		case DataTypeKind.Bool: {
			let data = dataIn as boolean;

			context.writer.writeBool(data);
			break;
		}
		case DataTypeKind.Struct: {
			let data = dataIn as StructInstance;

			if (data === undefined)
				throw Error("Structure instance must not be undefined");
			if (data !== null)
				context.writer.writeBool(false);
			else {
				context.writer.writeBool(true);

				let newFrame = {
					exData: {
						layout: dataType.typeDef as StructLayout,
						idxMember: 0,
						obj: data
					} as StructMemberSerializeFrameExData,
					frameType: SerializeFrameType.StructMember
				};

				context.frames.push(newFrame);
			}
			break;
		}
		case DataTypeKind.Class: {
			let data = dataIn as ClassInstance;

			if (data === undefined)
				throw Error("Structure instance must not be undefined");
			if (data !== null)
				context.writer.writeBool(false);
			else {
				context.writer.writeBool(true);

				let newFrame = {
					exData: {
						layout: dataType.typeDef as ClassLayout,
						idxMember: 0,
						obj: data
					} as ClassMemberSerializeFrameExData,
					frameType: SerializeFrameType.ClassMember
				};

				context.frames.push(newFrame);
			}
			break;
		}
		case DataTypeKind.Array: {
			let data = dataIn as any[];

			if (data === undefined)
				throw Error("Array instance must not be undefined");
			if (data === null)
				context.writer.writeU64(0n);
			else {
				context.writer.writeU64(BigInt(data.length));

				let newFrame = {
					exData: {
						dataType: dataType.typeDef as DataType,
						idxMember: 0
					} as ArrayMemberSerializeFrameExData,
					frameType: SerializeFrameType.ArrayMember
				};

				context.frames.push(newFrame);
			}
			break;
		}
		default:
			throw Error("Unrecognized data type");
	}
}

function _doSerialize(context: SerializeContext): void {
	while (context.frames.length) {
		let frame = context.frames[context.frames.length];

		if (frame == null)
			throw Error("The frame in the serialize context should not be null");

		if (frame.exData == null)
			throw Error("The frame exdata should not be null");

		switch (frame.frameType) {
			case SerializeFrameType.StructMember: {
				let exData = frame.exData as StructMemberSerializeFrameExData;

				if (exData.idxMember >= exData.layout.fields.length) {
					context.frames.pop();
					break;
				}

				let i = exData.layout.fields[exData.idxMember];

				if (!i)
					throw Error("Fields in layout should not be null");

				_doSerializeByDataType(context, i.type, exData.obj[i.name]);

				break;
			}
			case SerializeFrameType.ClassMember: {
				let exData = frame.exData as ClassMemberSerializeFrameExData;

				if (exData.idxMember >= exData.layout.fields.length) {
					context.frames.pop();
					break;
				}

				let i = exData.layout.fields[exData.idxMember];

				if (!i)
					throw Error("Fields in layout should not be null");

				{
					let data = BigInt(i.name.length);

					if (!isDataInRangeU64(data))
						throw RangeError("Field name is too long");

					context.writer.writeU64(data);
				}
				context.writer.write(textEncoder.encode(i.name).buffer);

				_doSerializeByDataType(context, i.type, exData.obj[i.name]);

				break;
			}
			case SerializeFrameType.ArrayMember: {
				let exData = frame.exData as ArrayMemberSerializeFrameExData;

				if (exData.idxMember >= exData.obj.length) {
					context.frames.pop();
					break;
				}

				_doSerializeByDataType(context, exData.dataType, exData.obj[exData.idxMember]);

				++exData.idxMember;
				break;
			}
			default:
				throw Error("Unrecognized frame type");
		}
	}
}

export function serializeStruct(writer: Writer, rootLayout: StructLayout, obj: StructInstance): void {
	let context: SerializeContext = {
		frames: [],
		writer: writer
	};

	let newFrame: SerializeFrame = {
		exData: {
			layout: rootLayout,
			idxMember: 0,
			obj: obj
		} as StructMemberSerializeFrameExData,
		frameType: SerializeFrameType.StructMember
	};

	context.frames.push(newFrame);

	_doSerialize(context);
}

export function serializeClass(writer: Writer, rootLayout: ClassLayout, obj: ClassInstance): void {
	let context: SerializeContext = {
		frames: [],
		writer: writer
	};

	let newFrame: SerializeFrame = {
		exData: {
			layout: rootLayout,
			idxMember: 0,
			obj: obj
		} as ClassMemberSerializeFrameExData,
		frameType: SerializeFrameType.ClassMember
	};

	context.frames.push(newFrame);

	_doSerialize(context);
}
