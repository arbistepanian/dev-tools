export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function highlightJson(json: string): string {
  const escaped = escapeHtml(json);

  return escaped.replace(
    /("(\\u[\dA-Fa-f]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        const className = /:$/.test(match) ? "syntax-key" : "syntax-string";
        return `<span class="${className}">${match}</span>`;
      }

      if (/^null$/.test(match)) {
        return `<span class="syntax-null">${match}</span>`;
      }

      if (/^(true|false)$/.test(match)) {
        return `<span class="syntax-boolean">${match}</span>`;
      }

      return `<span class="syntax-number">${match}</span>`;
    },
  );
}

export function highlightXml(xml: string): string {
  const escaped = escapeHtml(xml);

  return escaped
    .replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="syntax-comment">$1</span>',
    )
    .replace(
      /(&lt;\?)([\s\S]*?)(\?&gt;)/g,
      '<span class="syntax-tag">$1</span><span class="syntax-attr-value">$2</span><span class="syntax-tag">$3</span>',
    )
    .replace(
      /(&lt;\/?)([\w:.-]+)([\s\S]*?)(\/?&gt;)/g,
      (_, open: string, tagName: string, inner: string, close: string) => {
        const highlightedInner = inner.replace(
          /([\w:.-]+)(=)("[^"]*"|'[^']*')/g,
          '<span class="syntax-attr-name">$1</span>$2<span class="syntax-attr-value">$3</span>',
        );

        return `<span class="syntax-tag">${open}${tagName}${highlightedInner}${close}</span>`;
      },
    );
}

export function highlightCode(code: string, language: "json" | "xml"): string {
  return language === "json" ? highlightJson(code) : highlightXml(code);
}
