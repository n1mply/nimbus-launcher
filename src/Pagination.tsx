import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

type EllipsisJumpProps = {
  totalPages: number;
  onJump: (page: number) => void;
};

function EllipsisJump({ totalPages, onJump }: EllipsisJumpProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    setVal("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ""); // Только цифры
    if (!raw) {
      setVal("");
      return;
    }
    let num = parseInt(raw, 10);
    if (num > totalPages) num = totalPages;
    if (num < 1) num = 1;
    setVal(String(num));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(val, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onJump(page);
      }
      setIsEditing(false);
      setVal("");
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setVal("");
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={val}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="#"
        className="h-8 w-10 rounded-lg border border-blue-500/50 bg-[#1A1B23] text-center text-[13px] font-medium text-blue-300 outline-none shadow-inner"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      title="Click to jump to page"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[13px] font-semibold text-gray-500 transition-colors hover:border-white/10 hover:bg-white/[0.05] hover:text-gray-300 cursor-pointer"
    >
      ...
    </button>
  );
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis-prev" | "ellipsis-next")[] = [];

  const delta = 2; // сколько страниц отображать слева и справа от текущей
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);

  if (left > 2) {
    pages.push("ellipsis-prev");
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < totalPages - 1) {
    pages.push("ellipsis-next");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {/* Кнопка "Назад" */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-gray-400 transition-colors hover:bg-white/[0.07] hover:text-white disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Список страниц */}
      {pages.map((p, idx) => {
        if (p === "ellipsis-prev" || p === "ellipsis-next") {
          return (
            <EllipsisJump
              key={`${p}-${idx}`}
              totalPages={totalPages}
              onJump={(page) => onPageChange(page)}
            />
          );
        }

        const isCurrent = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-[13px] font-medium transition-colors cursor-pointer ${
              isCurrent
                ? "border border-blue-400/30 bg-blue-500/20 text-blue-300 font-semibold"
                : "border border-transparent text-gray-400 hover:border-white/5 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            {p}
          </button>
        );
      })}

      {/* Кнопка "Вперед" */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-gray-400 transition-colors hover:bg-white/[0.07] hover:text-white disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}