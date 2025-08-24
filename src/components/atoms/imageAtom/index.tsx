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

const ImageAtom: NextPage<ImageAtomProps> = (props) => {
  const {
    alt,
    src,
    placeholderSrc,
    defaultImage,
    className,
    width,
    height,
    priority = false,
  } = props
  const [hasError, setHasError] = useState(false)

  if (width && height) {
    return (
      <Image
        src={hasError ? defaultImage || src : src || defaultImage || ''}
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
      src={hasError ? defaultImage || src || '' : src || defaultImage || ''}
      loading={priority ? 'eager' : 'lazy'}
      data-has-placeholder={!!placeholderSrc}
      onError={() => !hasError && setHasError(true)}
      style={{
        ...(placeholderSrc
          ? {
              backgroundImage: `url(${placeholderSrc})`,
            }
          : {}),
      }}
    />
  )
}

export default ImageAtom
