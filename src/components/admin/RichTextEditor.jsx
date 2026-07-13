import { useCallback, useEffect, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TRANSFORMERS } from '@lexical/markdown';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getRoot,
  $insertNodes,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode } from '@lexical/list';
import { TOGGLE_LINK_COMMAND, AutoLinkNode, LinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Code,
  Quote,
  Undo2,
  Redo2,
  Image,
  Heading1,
  ChevronDown,
} from 'lucide-react';

// ─── Theme ──────────────────────────────────────────────────────────────────

const editorTheme = {
  root: 'rte-root min-h-[300px] outline-none',
  paragraph: 'mb-3 last:mb-0',
  quote: 'border-l-4 border-purple-400 pl-4 italic text-gray-600 my-4',
  heading: {
    h1: 'text-3xl font-bold mt-6 mb-3 text-gray-900',
    h2: 'text-2xl font-bold mt-5 mb-2 text-gray-800',
    h3: 'text-xl font-semibold mt-4 mb-2 text-gray-800',
    h4: 'text-lg font-semibold mt-3 mb-1 text-gray-800',
    h5: 'text-base font-semibold mt-3 mb-1 text-gray-700',
    h6: 'text-sm font-semibold mt-2 mb-1 text-gray-700',
  },
  list: {
    ul: 'list-disc list-inside my-3 space-y-1',
    ol: 'list-decimal list-inside my-3 space-y-1',
    listitem: 'ml-4',
  },
  link: 'text-purple-700 underline hover:text-purple-900 cursor-pointer',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
    code: 'bg-gray-100 text-purple-700 rounded px-1 py-0.5 text-sm font-mono',
  },
  code: 'bg-gray-900 text-gray-100 rounded-lg p-4 my-4 font-mono text-sm overflow-x-auto block',
  codeHighlight: {
    atrule: 'text-purple-400',
    attr: 'text-yellow-300',
    boolean: 'text-red-400',
    builtin: 'text-green-400',
    cdata: 'text-gray-400',
    char: 'text-green-300',
    class: 'text-yellow-300',
    'class-name': 'text-yellow-300',
    comment: 'text-gray-500 italic',
    constant: 'text-red-400',
    deleted: 'text-red-400',
    doctype: 'text-gray-400',
    entity: 'text-yellow-300',
    function: 'text-blue-300',
    important: 'text-red-400',
    inserted: 'text-green-400',
    keyword: 'text-purple-400',
    namespace: 'text-yellow-300',
    number: 'text-red-300',
    operator: 'text-gray-300',
    prolog: 'text-gray-400',
    property: 'text-blue-300',
    punctuation: 'text-gray-400',
    regex: 'text-red-300',
    selector: 'text-green-400',
    string: 'text-green-300',
    symbol: 'text-red-400',
    tag: 'text-red-400',
    url: 'text-blue-300',
    variable: 'text-orange-300',
  },
};

// ─── Nodes ───────────────────────────────────────────────────────────────────

const EDITOR_NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  CodeNode,
  CodeHighlightNode,
];

// ─── Image insert plugin ─────────────────────────────────────────────────────

/**
 * Watches `imageToInsert` (a MediaAsset object). When it changes to a non-null
 * value, inserts an <img> element into the Lexical editor at the current cursor
 * position (or at the end of the document if no selection exists).
 */
function ImageInsertPlugin({ imageToInsert, onImageInserted }) {
  const [editor] = useLexicalComposerContext();
  const prevImageRef = useRef(null);

  useEffect(() => {
    // Only act when imageToInsert is a new, non-null value
    if (!imageToInsert || imageToInsert === prevImageRef.current) return;
    prevImageRef.current = imageToInsert;

    editor.update(() => {
      const parser = new DOMParser();
      const imgHtml = `<p><img src="${imageToInsert.url}" alt="${imageToInsert.altText || imageToInsert.fileName}" style="max-width:100%;height:auto;" /></p>`;
      const dom = parser.parseFromString(imgHtml, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);

      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $insertNodes(nodes);
      } else {
        const root = $getRoot();
        root.append(...nodes);
      }
    });

    // Notify parent that insertion is done so it can reset imageToInsert
    if (onImageInserted) onImageInserted();
  }, [editor, imageToInsert, onImageInserted]);

  return null;
}

// ─── Initial content loader plugin ──────────────────────────────────────────

function InitialContentPlugin({ initialHtml }) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !initialHtml) return;
    initialized.current = true;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      $insertNodes(nodes);
    });
  }, [editor, initialHtml]);

  return null;
}

// ─── HTML export plugin ──────────────────────────────────────────────────────

function HtmlExportPlugin({ onHtmlChange }) {
  const [editor] = useLexicalComposerContext();

  const handleChange = useCallback(() => {
    editor.read(() => {
      const html = $generateHtmlFromNodes(editor, null);
      onHtmlChange(html);
    });
  }, [editor, onHtmlChange]);

  return <OnChangePlugin onChange={handleChange} />;
}

// ─── Toolbar plugin ──────────────────────────────────────────────────────────

const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

function ToolbarPlugin({ onImageInsert }) {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const [headingDropdownOpen, setHeadingDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Track active formatting state
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setActiveFormats({
            bold: selection.hasFormat('bold'),
            italic: selection.hasFormat('italic'),
            underline: selection.hasFormat('underline'),
            strikethrough: selection.hasFormat('strikethrough'),
          });
        }
      });
    });
  }, [editor]);

  // Close heading dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setHeadingDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatText = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (level) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(level));
      }
    });
    setHeadingDropdownOpen(false);
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
    setHeadingDropdownOpen(false);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const formatCode = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => new CodeNode());
      }
    });
  };

  const insertUnorderedList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const insertOrderedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const insertLink = () => {
    const url = window.prompt('Entrez l\'URL du lien :');
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url, target: '_blank' });
    }
  };

  const undo = () => editor.dispatchCommand(UNDO_COMMAND, undefined);
  const redo = () => editor.dispatchCommand(REDO_COMMAND, undefined);

  // ── Reusable toolbar button ───────────────────────────────────────────
  const ToolbarButton = ({ onClick, active = false, title, children, className = '' }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`
        p-1.5 rounded transition-colors
        ${active
          ? 'bg-purple-100 text-purple-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
        ${className}
      `}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <span className="mx-1 w-px h-5 bg-gray-200 self-center flex-shrink-0" aria-hidden="true" />
  );

  return (
    <div
      role="toolbar"
      aria-label="Barre d'outils de l'éditeur"
      className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg"
    >
      {/* Undo / Redo */}
      <ToolbarButton onClick={undo} title="Annuler (Ctrl+Z)">
        <Undo2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={redo} title="Rétablir (Ctrl+Y)">
        <Redo2 className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Text formatting */}
      <ToolbarButton onClick={() => formatText('bold')} active={activeFormats.bold} title="Gras (Ctrl+B)">
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatText('italic')} active={activeFormats.italic} title="Italique (Ctrl+I)">
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatText('underline')} active={activeFormats.underline} title="Souligné (Ctrl+U)">
        <Underline className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatText('strikethrough')} active={activeFormats.strikethrough} title="Barré">
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Headings dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setHeadingDropdownOpen((o) => !o);
          }}
          title="Titres"
          aria-label="Sélectionner un niveau de titre"
          aria-haspopup="true"
          aria-expanded={headingDropdownOpen}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors"
        >
          <Heading1 className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </button>

        {headingDropdownOpen && (
          <div
            className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]"
            role="menu"
            aria-label="Niveaux de titre"
          >
            <button
              type="button"
              role="menuitem"
              onMouseDown={(e) => { e.preventDefault(); formatParagraph(); }}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Paragraphe
            </button>
            {HEADINGS.map((h) => (
              <button
                key={h}
                type="button"
                role="menuitem"
                onMouseDown={(e) => { e.preventDefault(); formatHeading(h); }}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span className="font-semibold text-xs text-purple-600 uppercase w-6">{h.toUpperCase()}</span>
                <span>
                  {h === 'h1' && 'Titre 1'}
                  {h === 'h2' && 'Titre 2'}
                  {h === 'h3' && 'Titre 3'}
                  {h === 'h4' && 'Titre 4'}
                  {h === 'h5' && 'Titre 5'}
                  {h === 'h6' && 'Titre 6'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* Lists */}
      <ToolbarButton onClick={insertUnorderedList} title="Liste à puces">
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={insertOrderedList} title="Liste numérotée">
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Link */}
      <ToolbarButton onClick={insertLink} title="Insérer un lien">
        <Link className="w-4 h-4" />
      </ToolbarButton>

      {/* Code block */}
      <ToolbarButton onClick={formatCode} title="Bloc de code">
        <Code className="w-4 h-4" />
      </ToolbarButton>

      {/* Blockquote */}
      <ToolbarButton onClick={formatQuote} title="Citation">
        <Quote className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Image insertion */}
      <ToolbarButton
        onClick={onImageInsert}
        title="Insérer une image"
      >
        <Image className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}

// ─── Error boundary for LexicalComposer ─────────────────────────────────────

function onError(error) {
  console.error('[RichTextEditor] Lexical error:', error);
}

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * RichTextEditor — Lexical-based rich text editor for article composition.
 *
 * Requirements: 2.1 (bold, italic, underline, strikethrough)
 *               2.2 (headings H1–H6)
 *               2.3 (ordered/unordered lists)
 *               2.4 (hyperlinks)
 *               2.5 (image insertion — wired to MediaLibrary via imageToInsert)
 *               2.6 (code blocks)
 *               2.7 (blockquotes)
 *
 * @param {{
 *   initialContent?: string,             // Initial HTML content
 *   onChange?: (html: string) => void,   // Called whenever content changes
 *   onImageInsert?: () => void,          // Opens the MediaLibrary modal
 *   imageToInsert?: object | null,       // MediaAsset to insert; reset to null after insertion
 *   onImageInserted?: () => void,        // Called after image is inserted so parent can reset imageToInsert
 *   placeholder?: string,
 *   className?: string,
 *   readOnly?: boolean,
 * }} props
 */
const RichTextEditor = ({
  initialContent = '',
  onChange,
  onImageInsert,
  imageToInsert = null,
  onImageInserted,
  placeholder = 'Commencez à rédiger votre article…',
  className = '',
  readOnly = false,
}) => {
  const handleHtmlChange = useCallback(
    (html) => {
      if (onChange) onChange(html);
    },
    [onChange]
  );

  const handleImageInsert = useCallback(() => {
    if (onImageInsert) {
      onImageInsert();
    } else {
      window.alert(
        'Insertion d\'image : veuillez configurer onImageInsert pour ouvrir la médiathèque.'
      );
    }
  }, [onImageInsert]);

  const initialConfig = {
    namespace: 'LmaazaRichTextEditor',
    theme: editorTheme,
    nodes: EDITOR_NODES,
    editable: !readOnly,
    onError,
  };

  return (
    <div
      className={`rte-wrapper border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent ${className}`}
      role="group"
      aria-label="Éditeur de contenu riche"
    >
      <LexicalComposer initialConfig={initialConfig}>
        {/* Toolbar */}
        {!readOnly && (
          <ToolbarPlugin onImageInsert={handleImageInsert} />
        )}

        {/* Editor area */}
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="px-4 py-4 min-h-[320px] text-gray-800 text-base leading-relaxed focus:outline-none"
                aria-label="Zone de saisie de l'article"
                aria-multiline="true"
                spellCheck="true"
                role="textbox"
              />
            }
            placeholder={
              <div
                className="absolute top-4 left-4 text-gray-400 text-base pointer-events-none select-none"
                aria-hidden="true"
              >
                {placeholder}
              </div>
            }
            ErrorBoundary={({ children }) => children}
          />
        </div>

        {/* Plugins */}
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

        {/* Load initial HTML */}
        {initialContent && <InitialContentPlugin initialHtml={initialContent} />}

        {/* Export HTML on change */}
        <HtmlExportPlugin onHtmlChange={handleHtmlChange} />

        {/* Image insertion plugin — Task 9.5 */}
        <ImageInsertPlugin
          imageToInsert={imageToInsert}
          onImageInserted={onImageInserted}
        />
      </LexicalComposer>
    </div>
  );
};

export default RichTextEditor;
