const DEBUG = true;

const getScriptUrl = function(embededPage) {
	if (typeof embededPage !== 'string') throw new Error('Invalid argument: argument must be type of "string"');
	const match = Array.from(embededPage.matchAll(/<script\s+src\s*=\s*"(?<path>[-a-zA-Z0-9@:%._\/\+~#=]+)\/base.js"/g));
	if (match.length === 0) throw new Error('Script */base.js does not exists');
	return match[0].groups.path + '/base.js';
};

const Searcher = function(script) {
	const _getDecipherCode = function() {
		/*
			source from youtube-dl: _parse_sig_js(self, jscode);
		*/
		const commonPtrn = [
			/\b[cs]\s*&&\s*[adf]\.set\([^,]+\s*,\s*encodeURIComponent\s*\(\s*(?<funcName>[a-zA-Z0-9$]+)\(/,
	        /\b[a-zA-Z0-9]+\s*&&\s*[a-zA-Z0-9]+\.set\([^,]+\s*,\s*encodeURIComponent\s*\(\s*(?<funcName>[a-zA-Z0-9$]+)\(/,
	        /(?:\b|[^a-zA-Z0-9$])(?<funcName>[a-zA-Z0-9$]{2})\s*=\s*function\(\s*a\s*\)\s*{\s*a\s*=\s*a\.split\(\s*""\s*\)/,
	        /(?<funcName>[a-zA-Z0-9$]+)\s*=\s*function\(\s*a\s*\)\s*{\s*a\s*=\s*a\.split\(\s*""\s*\)/
		];
		let entryFunc = null;
		commonPtrn.some((r) => {
			const match = script.match(r);
			if (!match) return false;
			entryFunc = match.groups.funcName;
			return true
		})
		if (!entryFunc) throw new Error('Cannot find entry function for decryption');
		const entryFuncCode = _getVarDefinition(entryFunc);
		printLog(`varName: ${entryFunc}, def: ${entryFuncCode}`);
		const funcList = [entryFuncCode];
		let maxAllowedTry = 100;
		return (function () {
			eval(entryFuncCode);
			do {
				try {
					--maxAllowedTry;
					printLog('eval entry function: ' + maxAllowedTry);
					eval(entryFunc)('_dummy_string_');
					break;
				} catch (e) {
					if (e.name === 'ReferenceError') {
						const fname = _getUndefinedVarName(e.message);
						const fcode = _getVarDefinition(fname);
						printLog(`varName: ${fname}, def: ${fcode}`);
						eval(fcode);
						funcList.push(fcode);
					} else {
						printLog(`Unknown error: ${e}`);
						throw e;
					}
				}
			} while (maxAllowedTry > 0)
			if (maxAllowedTry === 0) throw new Error('Cannot obtain decrypt function within 100 tries');
			return {
				entry: entryFunc,
				code: funcList.join('\n')
			};
		})();
	}
	const _getUndefinedVarName = function(errMsg) {
		printLog(`getUndefinedVarName: ${errMsg}`)
		const match = errMsg.match(/^(?<varName>\w+) is not defined$/);
		if (!match) throw new Error(`Unexpected error: ${errMsg}`);
		else printLog(match.groups.varName);
		return match.groups.varName;
	}
	const _getVarDefinition = function(varName) {
		// accept var definition in following style:
		// (var|let|const|) varName=(*|function(*))
		// special checking: varName cannot follow any character other than [,;\s]
		// assume var definition ends with ';' and no string literals included
		const dec = script.match(new RegExp(`(?:\\b(?:var|let|const)\\s+)?(?:[,;\\s]+|^)${varName}\\s*=\\s*(?<f>function\\s*\\([^)]*\\))?`));
		if (!dec) throw new Error(`Cannot find variable ${varName}`);
		const sIdx = dec.index + dec[0].length;
		let eIdx = 0;
		if (!dec.groups.f) {
			// non-function definition
			let c = script[sIdx];
			if (c === '{' || c === '[' || c === '(') {
				eIdx = _balanceSymbol(sIdx);
			} else {
				eIdx = sIdx;
				do {
					c = script[++eIdx];
				}
				while (c !== ';')
			}
		} else {
			// function definition
			eIdx = _balanceSymbol(sIdx);
		}
		return dec[0] + script.substring(sIdx, eIdx);
	}
	const _balanceSymbol = function(startIdx) {
		// find end index of symbol that balances code starts with start index
		// assume no string literals in code
		let idx = startIdx;
		let stack = [];
		while (idx < script.length) {
			const c = script[idx];
			++idx;
			switch (c) {
				case '{':
				case '(':
				case '[':
					stack.push(c);
					break;
				case '}':
					if (stack.length > 0 && stack[stack.length-1] === '{') {
						stack.pop();
					} else throw new Error('Inbalanced bracket "}"');
					break;
				case ')':
					if (stack.length > 0 && stack[stack.length-1] === '(') {
						stack.pop();
					} else throw new Error('Inbalanced bracket ")"');
					break;
				case ']':
					if (stack.length > 0 && stack[stack.length-1] === '[') {
						stack.pop();
					} else throw new Error('Inbalanced bracket "]"');
					break;
			}
			if (stack.length === 0) break;
		}
		if (stack.length !== 0) throw new Error('Inbalanced brackets');
		return idx;
	}
	this.decipherCode = _getDecipherCode();
};

const Decrypter = function(decipherCode) {
	eval(decipherCode.code);
	const decipher = eval(decipherCode.entry);
	this.getDecryptedUrl = function(cipher) {
		// cipher contains 3 url parameters: s(encrypted signature), sp(param to be added to result url), url
		const params = cipher.split('&');
		let paramMap = {};
		params.forEach((pair) => {
			let kV = pair.split('=');
			if (kV.length == 2) {
				paramMap[kV[0]] = kV[1];
			}
		});
		if (!paramMap.s) throw new Error('Missing "s" parameter in signatureCipher');
		if (!paramMap.sp) throw new Error('Missing "sp" parameter in signatureCipher');
		if (!paramMap.url) throw new Error('Missing "url" parameter in signatureCipher');
		const signature = decipher(decodeURIComponent(paramMap.s));
		return decodeURIComponent(paramMap.url) + '&' + paramMap.sp + '=' + signature +
			'&ratebypass=yes';
	};
};

const printLog = function(message) {
	if (DEBUG) console.log(message);
}

module.exports = { getScriptUrl, Searcher, Decrypter };
