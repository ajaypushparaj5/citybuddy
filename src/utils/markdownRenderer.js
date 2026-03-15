export function renderMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/^# (.+)$/gm, '<h1 class="text-xl font-extrabold mt-5 mb-2 border-b border-opacity-20 pb-2">$1</h1>')
        .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/^---$/gm, '<hr class="border-opacity-20 my-3"/>')
        .replace(/^\|(.+)\|$/gm, (_, row) => {
            const isSep = row.split('|').every(c => /^[-: ]+$/.test(c.trim()));
            if (isSep) return '';
            const cells = row.split('|').map(c => `<td class="p-2 border border-opacity-20 text-[0.75rem]">${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        })
        .replace(/((<tr>.*<\/tr>\s*)+)/gs, '<table class="w-full border-collapse my-2">$1</table>')
        .replace(/^[\*\-] (.+)$/gm, '<li class="my-1 text-[0.8rem] leading-relaxed">$1</li>')
        .replace(/((<li.*<\/li>\s*)+)/gs, '<ul class="my-2 ml-4 list-disc">$1</ul>')
        .replace(/\n/g, '<br/>');
}
