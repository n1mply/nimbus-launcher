import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { openExternal } from "./utils/openExternal";

// Стили — в markdown.css (класс .markdown-body)

const components: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      onClick={(e) => {
        // Без preventDefault Electron увёл бы окно лаунчера на чужой сайт
        e.preventDefault();
        if (href && !href.startsWith("#")) openExternal(href);
      }}
      className="cursor-pointer text-blue-400 hover:underline"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => <img src={src} alt={alt ?? ""} loading="lazy" />,
};

type Props = { children: string };

export default function MarkdownView({ children }: Props) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // Описания на Modrinth часто содержат HTML (<img>, <br>, <details>).
        // rehype-raw его разбирает, rehype-sanitize вырезает опасное (script, iframe, on* и т.п.)
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}