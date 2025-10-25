import React from 'react'
import {
  VideoPlayer,
  VideoPlayerControlBar,
  VideoPlayerPlayButton,
  VideoPlayerTimeRange,
  VideoPlayerTimeDisplay,
  VideoPlayerMuteButton,
  VideoPlayerVolumeRange,
  VideoPlayerContent,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
} from '@/components/atoms/video-player'
import { cn } from '@/lib/utils'

interface VideoPlayerFullProps {
  src: string
  poster?: string
  className?: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  aspectRatio?: '16/9' | '4/3' | '21/9' | '1/1'
}

const VideoPlayerFull: React.FC<VideoPlayerFullProps> = ({
  src,
  poster,
  className,
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  aspectRatio = '16/9',
}) => {
  const aspectRatioClass = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '21/9': 'aspect-[21/9]',
    '1/1': 'aspect-square',
  }[aspectRatio]

  return (
    <VideoPlayer
      className={cn(
        'w-full rounded-lg overflow-hidden',
        aspectRatioClass,
        className,
      )}
      autohide='2'
    >
      <VideoPlayerContent
        src={src}
        slot='media'
        poster={poster}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        playsInline
      />
      {controls && (
        <VideoPlayerControlBar className='flex items-center gap-1'>
          <VideoPlayerPlayButton />
          <VideoPlayerSeekBackwardButton />
          <VideoPlayerSeekForwardButton />
          <VideoPlayerTimeDisplay showDuration />
          <VideoPlayerTimeRange className='flex-1' />
          <VideoPlayerMuteButton />
          <VideoPlayerVolumeRange />
        </VideoPlayerControlBar>
      )}
    </VideoPlayer>
  )
}

export default VideoPlayerFull
