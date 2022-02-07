type MyHTMLElement = {
	nodeName: string;
	childrenNode: MyHTMLElement[];
	parentNode: MyHTMLElement | undefined;
	textContent: string;
	attributes: MyAttribute | undefined;
	DocumentPosition: MyDocumentPosition | undefined;
	isSelfClosingTag: boolean;
}

type MyAttribute = {
	[key in string]: string
}

type MyDocumentPosition = {
	openTag: { start: number | undefined; end: number | undefined; }
	closeTag: { start: number | undefined; end: number | undefined; }
}

let domParserTokenizer = /(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:]*)(?:\s([^>]*?))?((?:\s*\/)?)>)/gm;
// 1 : / 2 : tag_name 3 : attribute 4 : /
let splitAttrsTokenizer = /([a-z0-9_\:\-]*)\s*?=\s*?(['"]?)(.*?)\2\s+/gim
// 1 : name 2 : "' 3 : value 4 : 2

function parseAttribute(data: string): MyAttribute{
	let attribute_array: MyAttribute = {class: "", id: "", name: ""};
	let token: RegExpExecArray | null;
	while(token = splitAttrsTokenizer.exec(data)) {
		let name: string = token[1]
		let value: string = token[3]
		attribute_array[name] = value
	}
	return attribute_array
}

function parseHTML(data: string) {
	let parent: MyHTMLElement = {
		nodeName: "document",
		childrenNode: [],
		parentNode: undefined,
		textContent: "",
		attributes: undefined,
		DocumentPosition: undefined,
		isSelfClosingTag: false
	}
	let tags: MyHTMLElement[] = [parent]
	let token: RegExpExecArray | null;
	while(token = domParserTokenizer.exec(data)) {
		if (token[1] !== "/") {
			let position: MyDocumentPosition = {
				openTag: {start: domParserTokenizer.lastIndex - token[0].length,
						  end: domParserTokenizer.lastIndex},
				closeTag: {start: undefined, end: undefined}
			}
			let tag: MyHTMLElement = {
				nodeName: token[2].toLowerCase(),
				childrenNode: [],
				parentNode: parent,
				textContent: "",
				attributes: parseAttribute(token[3]),
				DocumentPosition: position,
				isSelfClosingTag: false
			}
			tags.push(tag)
			if (tag.parentNode != undefined) { tag.parentNode.childrenNode.push(tag) }
			if (token[4] && token[4].indexOf("/") != -1 && tag.DocumentPosition != undefined) {
				tag.DocumentPosition.closeTag = tag.DocumentPosition.openTag
				tag.isSelfClosingTag = true
			} else {
				parent = tag
			}
		} else {
			if (token[2].toLowerCase() == parent.nodeName) {
				let tag: MyHTMLElement = parent
				if (tag.parentNode != undefined) {
					parent = tag.parentNode
				}
				tag.isSelfClosingTag = false
				if (tag.DocumentPosition != undefined) {
					tag.DocumentPosition.closeTag = {
						start: domParserTokenizer.lastIndex - token[0].length,
						end: domParserTokenizer.lastIndex
					}
					let tag_start = tag.DocumentPosition && tag.DocumentPosition.openTag.end ? tag.DocumentPosition.openTag.end : 0
					let tag_end = tag.DocumentPosition ? tag.DocumentPosition.closeTag.start : 0
					tag.textContent = data.substring(tag_start, tag_end)
				}
			} else {
				console.warn('tag mismatch')
			}
		}
	}
	return tags[0]
}

let result_tags = parseHTML("<p><div>hoge</div></p>")
