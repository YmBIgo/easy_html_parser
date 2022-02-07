var domParserTokenizer = /(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:]*)(?:\s([^>]*?))?((?:\s*\/)?)>)/gm;
// 1 : / 2 : tag_name 3 : attribute 4 : /
var splitAttrsTokenizer = /([a-z0-9_\:\-]*)\s*?=\s*?(['"]?)(.*?)\2\s+/gim;
// 1 : name 2 : "' 3 : value 4 : 2
function parseAttribute(data) {
    var attribute_array;
    var token;
    while (token = splitAttrsTokenizer.exec(data)) {
        attribute_array[token[1]] = token[3];
    }
    return attribute_array;
}
function parseHTML(data) {
    console.log(data);
    var parent = {
        nodeName: "document",
        childrenNode: [],
        parentNode: undefined,
        textContent: "",
        attributes: undefined,
        DocumentPosition: undefined,
        isSelfClosingTag: false
    };
    var tags = [parent];
    var token;
    while (token = domParserTokenizer.exec(data)) {
        if (token[1] !== "/") {
            var position = {
                openTag: { start: domParserTokenizer.lastIndex - token[0].length,
                    end: domParserTokenizer.lastIndex },
                closeTag: { start: undefined, end: undefined }
            };
            var tag = {
                nodeName: token[2].toLowerCase(),
                childrenNode: [],
                parentNode: parent,
                textContent: "",
                attributes: parseAttribute(token[3]),
                DocumentPosition: position,
                isSelfClosingTag: false
            };
            tags.push(tag);
            tag.parentNode.childrenNode.push(tag);
            if (token[4] && token[4].indexOf("/") != -1) {
                tag.DocumentPosition.closeTag = tag.DocumentPosition.openTag;
                tag.isSelfClosingTag = true;
            }
            else {
                parent = tag;
            }
        }
        else {
            if (token[2].toLowerCase() == parent.nodeName) {
                var tag = parent;
                parent = tag.parentNode;
                tag.isSelfClosingTag = false;
                tag.DocumentPosition.closeTag = {
                    start: domParserTokenizer.lastIndex - token[0].length,
                    end: domParserTokenizer.lastIndex
                };
                var tag_start = tag.DocumentPosition ? tag.DocumentPosition.openTag.end : 0;
                var tag_end = tag.DocumentPosition ? tag.DocumentPosition.closeTag.start : 0;
                tag.textContent = data.substring(tag_start, tag_end);
            }
            else {
                console.warn('tag mismatch');
            }
        }
    }
    console.log(tags);
}
parseHTML("<p>hoge</p>");
