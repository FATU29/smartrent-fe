import styled from 'styled-components'

export const StyledImage = styled.img`
  &[data-has-placeholder='true'] {
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
`
