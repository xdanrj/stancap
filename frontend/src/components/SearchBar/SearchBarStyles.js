import styled from "styled-components";
import { sizes } from "../../CommonStyles/screenSizes";
import { InputGroup as originalInputGroup } from "react-bootstrap";

export const InputGroup = styled(originalInputGroup).attrs(() => ({
    className: `mb-5`
}))`
    
`