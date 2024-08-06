// generic function that wraps a function output in brackets
export function brackets<T extends string>(string: T): `{${T}}\n` {
	return `{${string}}\n`;
}

export function newline<T extends string>(string: T): `${T}\n` {
	return `${string}\n`;
}
