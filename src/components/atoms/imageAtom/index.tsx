import clsx from 'clsx'
import { NextPage } from 'next'
import Image from 'next/image'
import { StyledImage } from './index.styled'
import { useState } from 'react'

type ImageAtomProps = {
  src: string
  alt: string
  placeholderSrc?: string
  defaultImage?: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

const ImageAtom: NextPage<ImageAtomProps> = ({
  alt,
  src,
  placeholderSrc,
  defaultImage,
  className,
  width,
  height,
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false)

  const fallbackSrc = defaultImage ?? ''
  const imageSrc = hasError ? fallbackSrc : (src ?? fallbackSrc)

  if (width && height) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={clsx(className, 'object-cover')}
        priority={priority}
        placeholder={placeholderSrc ? 'blur' : 'empty'}
        blurDataURL={placeholderSrc}
        onError={() => !hasError && setHasError(true)}
        loading={priority ? undefined : 'lazy'}
      />
    )
  }

  return (
    <StyledImage
      className={clsx(className, 'object-cover')}
      alt={alt}
      src={imageSrc}
      loading={priority ? 'eager' : 'lazy'}
      data-has-placeholder={!!placeholderSrc}
      onError={() => !hasError && setHasError(true)}
      style={{
        ...(placeholderSrc
          ? {
              backgroundImage: `url(${placeholderSrc})`,
              filter: 'blur(5px)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}),
      }}
    />
  )
}

export default ImageAtom
