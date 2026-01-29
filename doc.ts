export enum DataTypeKind {
	I8 = 0,
	I16,
	I32,
	I64,
	U8,
	U16,
	U32,
	U64,
	F32,
	F64,
	String,
	Bool,
	Struct,
	Class,
	Array
}

export interface DataType {
	kind: DataTypeKind;
	typeDef: object;
}

export interface StructField {
	type: DataType;
	name: string;
}

export interface StructLayout {
	fields: StructField[];
}

export interface ClassField {
	type: DataType;
	name: string;
}

export interface ClassLayout {
	fields: ClassField[];
}

export type StructInstance = { [key: string]: object };
export type ClassInstance = { [key: string]: object };
