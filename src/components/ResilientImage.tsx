import { useState } from 'react';
import { Leaf } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ResilientImage({ src, alt, className = '' }: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EFECE6] via-[#E8EFEA] to-[#EDE5F0] text-[#1B3B2B] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Leaf className="w-7 h-7 opacity-60 mb-1.5" strokeWidth={1.5} />
        <span className="text-xs font-medium opacity-75 line-clamp-2 max-w-[140px]">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
