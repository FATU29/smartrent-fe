import styled, { css } from 'styled-components'

export const Wrapper = styled.div`
  position: relative;
`

interface ScrollContainerProps {
  $fadeEdges?: boolean
}

export const ScrollContainer = styled.div<ScrollContainerProps>`
  display: flex;
  gap: 0.75rem; /* gap-3 */
  overflow-x: auto;
  padding-top: 0.25rem; /* py-1 */
  padding-bottom: 0.25rem;
  user-select: none;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  &::-webkit-scrollbar {
    display: none;
  }
`

export const FadeEdge = styled.div<{ $position: 'left' | 'right' }>`
  pointer-events: none;
  position: absolute;
  top: 0;
  height: 100%;
  width: 2rem; /* w-8 */
  ${(p) =>
    p.$position === 'left'
      ? css`
          left: 0;
          background: linear-gradient(to right, var(--background), transparent);
        `
      : css`
          right: 0;
          background: linear-gradient(to left, var(--background), transparent);
        `}
`
