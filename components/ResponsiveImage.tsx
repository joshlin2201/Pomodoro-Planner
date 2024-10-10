import Image from 'next/image';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ src, alt, width, height }) => (
  <div className="w-full">
    <Image
      src={src}
      alt={alt}
      layout="responsive"
      width={width}
      height={height}
    />
  </div>
);

export default ResponsiveImage;