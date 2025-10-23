import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function Preview({ content }: { content: string }) {
    //* Simple regex to convert ==text== to <mark>text</mark>
    const processedContent = content.replace(/==(.*?)==/g, '<mark>$1</mark>');

    return (
        <section className="markdown prose break-words font-os">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
            >
                {processedContent}
            </ReactMarkdown>
        </section>
    )
}