import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    ConditionalContents,
    diffSourcePlugin,
    headingsPlugin,
    HighlightToggle,
    imagePlugin,
    InsertAdmonition,
    InsertTable,
    InsertThematicBreak,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    quotePlugin,
    Separator,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo,
    directivesPlugin,
    AdmonitionDirectiveDescriptor
} from "@mdxeditor/editor";
import '@mdxeditor/editor/style.css';
import "./dark-editor.css";

interface EditorProps {
    value?: string;
    onChange?: (value: string) => void;
}

function Editor({ value = "", onChange }: EditorProps) {
    return (
        <MDXEditor
            markdown={value}
            onChange={onChange}
            className="markdown-editor dark-editor grid w-full border"
            plugins={[
                headingsPlugin(),
                listsPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                tablePlugin(),
                imagePlugin(),
                directivesPlugin({
                    directiveDescriptors: [AdmonitionDirectiveDescriptor]
                }),
                diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
                toolbarPlugin({
                    toolbarContents: () => (
                        <ConditionalContents
                            options={[
                                {
                                    fallback: () => (
                                        <>
                                            <UndoRedo />
                                            <Separator />
                                            <BlockTypeSelect />
                                            <Separator />
                                            <BoldItalicUnderlineToggles />
                                            <HighlightToggle />
                                            <Separator />
                                            <ListsToggle />
                                            <Separator />
                                            <InsertTable />
                                            <InsertAdmonition />
                                            <InsertThematicBreak />
                                        </>
                                    ),
                                },
                            ]}
                        />
                    ),
                }),
            ]}
        />
    )
}

export default Editor;