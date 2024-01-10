const textEncoder = new TextEncoder();

export class Wasi {
	#encodedStdin;
	#envEncodedStrings;
	#argEncodedStrings;
	#instance? : WebAssembly.Instance;

	constructor(env: object, stdin: string, args: string[]) {
		this.#encodedStdin = textEncoder.encode(stdin);
		const envStrings = Object.entries(env).map(([k, v]) => `${k}=${v}`);
		this.#envEncodedStrings = envStrings.map(s => textEncoder.encode(s + "\0"))
		this.#argEncodedStrings = args.map(s => textEncoder.encode(s + "\0"));
		this.bind();
	}

	 //really annoying the interface works this way but we MUST set the instance after creating it with the WASI class as an import in order to access it's memory
	set instance(val: WebAssembly.Instance) {
		this.#instance = val;
	}

	bind(){
		this.args_get= this.args_get.bind(this);
		this.args_sizes_get = this.args_sizes_get.bind(this);
		this.environ_get = this.environ_get.bind(this);
		this.environ_sizes_get = this.environ_sizes_get.bind(this);
		this.fd_read = this.fd_read.bind(this);
		this.fd_write = this.fd_write.bind(this);
	}

	args_sizes_get(argCountPtr: number, argBufferSizePtr: number) {
		if(this.#instance) { 
		const argByteLength = this.#argEncodedStrings.reduce((sum, val) => sum + val.byteLength, 0);
		const countPointerBuffer = new Uint32Array((this.#instance.exports.memory as any).buffer, argCountPtr, 1);
		const sizePointerBuffer = new Uint32Array((this.#instance.exports.memory as any).buffer, argBufferSizePtr, 1);
		countPointerBuffer[0] = this.#argEncodedStrings.length;
		sizePointerBuffer[0] = argByteLength;
		}
		return 0;
	}
	args_get(argsPtr: number, argBufferPtr: number) {
		if(this.#instance) { 
		const argsByteLength = this.#argEncodedStrings.reduce((sum, val) => sum + val.byteLength, 0);
		const argsPointerBuffer = new Uint32Array((this.#instance.exports.memory as any).buffer, argsPtr, this.#argEncodedStrings.length);
		const argsBuffer = new Uint8Array((this.#instance.exports.memory as any).buffer, argBufferPtr, argsByteLength)


		let pointerOffset = 0;
		for (let i = 0; i < this.#argEncodedStrings.length; i++) {
			const currentPointer = argBufferPtr + pointerOffset;
			argsPointerBuffer[i] = currentPointer;
			argsBuffer.set(this.#argEncodedStrings[i], pointerOffset)
			pointerOffset += this.#argEncodedStrings[i].byteLength;
		}
		}
		return 0;
	}
	fd_write(fd: number, iovsPtr: number, iovsLength: number, bytesWrittenPtr: number) {
		if(this.#instance) { 
		const iovs = new Uint32Array((this.#instance.exports.memory as any).buffer, iovsPtr, iovsLength * 2);
		if (fd === 1) { //stdout
			let text = "";
			let totalBytesWritten = 0;

			const decoder = new TextDecoder();
			for (let i = 0; i < iovsLength * 2; i += 2) {
				const offset = iovs[i];
				const length = iovs[i + 1];
				const textChunk = decoder.decode(new Int8Array((this.#instance.exports.memory as any).buffer, offset, length));
				text += textChunk;
				totalBytesWritten += length;
			}

			const dataView = new DataView((this.#instance.exports.memory as any).buffer);
			dataView.setInt32(bytesWrittenPtr, totalBytesWritten, true);
			console.log(text);
		}
		}
		return 0;
	}
	fd_read(fd: number, iovsPtr: number, iovsLength: number, bytesReadPtr: number) {
		if(this.#instance) { 
		const memory = new Uint8Array((this.#instance.exports.memory as any).buffer);
		const iovs = new Uint32Array((this.#instance.exports.memory as any).buffer, iovsPtr, iovsLength * 2);
		let totalBytesRead = 0;
		if (fd === 0) {//stdin
			for (let i = 0; i < iovsLength * 2; i += 2) {
				const offset = iovs[i];
				const length = iovs[i + 1];
				const chunk = this.#encodedStdin.slice(0, length);
				this.#encodedStdin = this.#encodedStdin.slice(length);

				memory.set(chunk, offset);
				totalBytesRead += chunk.byteLength;

				if (this.#encodedStdin.length === 0) break;
			}

			const dataView = new DataView((this.#instance.exports.memory as any).buffer);
			dataView.setInt32(bytesReadPtr, totalBytesRead, true);
		}
		}
		return 0;
	}
	environ_get(environPtr: number, environBufferPtr: number) {
		if(this.#instance) { 
		const envByteLength = this.#envEncodedStrings.map(s => s.byteLength).reduce((sum, val) => sum + val, 0);
		const environsPointerBuffer = new Uint32Array((this.#instance.exports.memory as any).buffer, environPtr, this.#envEncodedStrings.length);
		const environsBuffer = new Uint8Array((this.#instance.exports.memory as any).buffer, environBufferPtr, envByteLength)

		let pointerOffset = 0;
		for (let i = 0; i < this.#envEncodedStrings.length; i++) {
			const currentPointer = environBufferPtr + pointerOffset;
			environsPointerBuffer[i] = currentPointer;
			environsBuffer.set(this.#envEncodedStrings[i], pointerOffset)
			pointerOffset += this.#envEncodedStrings[i].byteLength;
		}
		}
		return 0;
	}
	environ_sizes_get(environCountPtr: number, environBufferSizePtr: number) {
		if(this.#instance) { 
		const envByteLength = this.#envEncodedStrings.map(s => s.byteLength).reduce((sum, val) => sum + val, 0);
		const countPointerBuffer = new Uint32Array((this.#instance.exports.memory as any).buffer, environCountPtr, 1);
		const sizePointerBuffer = new Uint32Array((this.#instance.exports.memory as any).buffer, environBufferSizePtr, 1);
		countPointerBuffer[0] = this.#envEncodedStrings.length;
		sizePointerBuffer[0] = envByteLength;
		}
		return 0;
	}
	proc_exit() { 
		console.log("EXIT"); 
	}
	fd_close() { return 0 }
	fd_seek() { return 0 }

}