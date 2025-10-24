/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

const remarkAdmonitions: Plugin = () => {
    return (tree) => {
        visit(tree, (node: any) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                const data = node.data || (node.data = {});
                const hName = node.type === 'textDirective' ? 'span' : 'div';

                data.hName = hName;
                data.hProperties = {
                    className: `admonition admonition-${node.name}`,
                    'data-admonition-type': node.name
                };
            }
        });
    };
};

export default function Preview({ content }: { content: string }) {
    //* Simple regex to convert ==text== to <mark>text</mark>
    const processedContent = content.replace(/==(.*?)==/g, '<mark>$1</mark>');

    return (
        <section className="markdown prose break-words font-en">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkDirective, remarkAdmonitions]}
                rehypePlugins={[rehypeRaw]}
            >
                {processedContent}
            </ReactMarkdown>
        </section>
    )
}