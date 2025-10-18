import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Preview({ content }: { content: string }) {
    return (
        <section className="markdown prose break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </section>
    )
}
