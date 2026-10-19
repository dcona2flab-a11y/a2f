import { getImageProps, type StaticImageData } from "next/image";

type Source = { media: string; src: StaticImageData };

type Props = {
  sources: Source[];         // widest media query first
  fallback: StaticImageData; // smallest layout
  alt: string;
  className?: string;
};

// <picture> for Figma assets that are drawn differently per breakpoint (not just scaled).
// SVGs are served as is (unoptimized); CSS sets the displayed size.
export default function ArtDirectedImage({ sources, fallback, alt, className }: Props) {
  const { props } = getImageProps({ src: fallback, alt, unoptimized: true });

  return (
    <picture>
      {sources.map(({ media, src }) => (
        <source key={media} media={media} srcSet={src.src} width={src.width} height={src.height} />
      ))}
      {/* a plain <img> inside <picture> (art direction); next/image cannot render <source> */}
      <img {...props} alt={alt} className={className} />
    </picture>
  );
}
