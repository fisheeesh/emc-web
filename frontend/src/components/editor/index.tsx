import {
    AdmonitionDirectiveDescriptor,
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    ConditionalContents,
    CreateLink,
    diffSourcePlugin,
    directivesPlugin,
    headingsPlugin,
    HighlightToggle,
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
    type MDXEditorMethods
} from "@mdxeditor/editor";
import '@mdxeditor/editor/style.css';
import { forwardRef } from "react";
import "./dark-editor.css";

interface EditorProps {
    value?: string;
    onChange?: (value: string) => void;
}

const Editor = forwardRef<MDXEditorMethods, EditorProps>(({ value = "", onChange }, ref) => {
    return (
        <MDXEditor
            ref={ref}
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
                                            <CreateLink />
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
});

Editor.displayName = "Editor";

export default Editor;