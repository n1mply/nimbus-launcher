import { Instance } from "./types";

type GameBarMarqueeProps = {
  instance: Instance;
};

const MODLOADER_NAMES: Record<Instance["modloader"], string> = {
  vanilla: "Vanilla",
  fabric: "Fabric",
  forge: "Forge",
  neoforge: "NeoForge",
  quilt: "Quilt",
};

export default function GameBarMarquee({
  instance,
}: GameBarMarqueeProps) {
  const modloaderName = MODLOADER_NAMES[instance.modloader];

  const text = [
    instance.name,
    `Minecraft ${instance.minecraftVersion}`,
    instance.modloader === "vanilla"
      ? modloaderName
      : `${modloaderName}${
          instance.modloaderVersion
            ? ` ${instance.modloaderVersion}`
            : ""
        }`,
  ].join("  •  ");

  return (
    <div className="absolute bottom-full left-1/2 mb-2 w-full -translate-x-1/2 overflow-hidden rounded-[10px] border border-white/10 bg-[#1A1C23]/90 shadow-xl backdrop-blur-md">
      <div className="gamebar-marquee flex w-max whitespace-nowrap py-2 text-[12px] font-medium text-blue-300">
        {/* Первая копия */}
        <span className="shrink-0 px-4">
          {text}
        </span>

        {/* Вторая копия */}
        <span className="shrink-0 px-4">
          {text}
        </span>

        {/* Третья копия для надёжного заполнения */}
        <span className="shrink-0 px-4">
          {text}
        </span>

        {/* Четвёртая копия */}
        <span className="shrink-0 px-4">
          {text}
        </span>
      </div>

      <style>{`
        @keyframes gamebar-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-25%);
          }
        }

        .gamebar-marquee {
          animation: gamebar-marquee 8s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}