import styled from 'styled-components'
import { sizes } from '../../../CommonStyles/screenSizes'
import { MDBIcon as originalMDBIcon } from 'mdb-react-ui-kit'
import { Modal as originalModal } from 'react-bootstrap'

export const Modal = styled(originalModal).attrs(() => ({
  className: ""
}))`

    font-size: 2.5vh;
    color: white;
`

export const ModalHeader = styled(originalModal.Header).attrs(() => ({
  className: ""
}))`
    
`

export const ModalTitle = styled(originalModal.Title).attrs(() => ({
  className: ""
}))`
    color: black;
    font-size: 1.1em;
`

export const ModalBody = styled(originalModal.Body).attrs(() => ({
  className: "text-center"
}))`
   background-color: rgb(40, 40, 40);

`
export const TextTitle = styled.p.attrs(() => ({
  className: "my-0"
}))`

    font-size: 1.1em;
    font-weight: bold;
`

export const TextParagraph = styled.p.attrs(() => ({
  className: "text-secondary"
}))`
    font-size: 0.9em;
`

export const ClickabeTextParagraph = styled.p.attrs(() => ({
  className: "d-inline"
}))`
  font-size: 0.9em;
  &:hover {
    color: #0275d8
  }
`