import React, { useState, useEffect } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import { ButtonContainer, ModalTitle, ModalBody } from "../../Modal/ModalContextStyles"
import { SourceNames } from "../SourceCommonFunctions"
import _ from "lodash"

export function QuotesPageFirstVisitModalBox(props) {
    const [show, setShow] = useState(true)


    const handleClose = () => {
        setShow(false)
        localStorage.setItem("hadVisitedQuotesPageBefore", true)
    }

    return (
        <>
            <Modal show={show} onHide={handleClose} centered >
                <Modal.Header closeButton>
                    <ModalTitle>Avisos importantes</ModalTitle>
                </Modal.Header>

                <ModalBody>
                    <p>Não leve nada daqui a sério. Todas as frases são para fins unicamente cômicos</p>
                    <p>Clique em qualquer ícone de source ou no autor da quote para fazer uma pesquisa específica</p>
                    <img src={`/images/${SourceNames[_.random(SourceNames.length-1)].value}.png` }></img>
                    <p>Alguns dialógos são grandes então clique em ᨆ para expandir</p>

                    <Button onClick={handleClose}>Entendi</Button>
                </ModalBody>
            </Modal>
        </>
    )
}