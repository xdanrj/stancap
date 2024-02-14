import React from "react";
import { useState, useEffect } from "react"
import Button from "react-bootstrap/Button";
import { Form, Col, Row, Dropdown, DropdownButton } from "react-bootstrap";
import { FloatingLabel, FormGroup, CenteredFormControl, CenteredFormGroup } from "../../../CommonStyles/CommonStyles";
import TagSelectorComponent from "../TagsSelector/TagsSelectorComponent";
import MultipleQuoteInputs from "./MultipleQuoteInputs/MultipleQuoteInputs";
import dayjs from "dayjs";
import { SourceNames } from "../SourceCommonFunctions";
import { useAlertMsg } from "../../Alert/AlertContext";
import { useModalBox } from "../../Modal/ModalContext";
import { isValidDate } from "../../../Formatting/DateFormatting";
import quoteEditingServices from "../../../services/quoteServices"

const quoteEditingService = new quoteEditingServices()

export default function MultipleQuoteGenericForm(props) {
    const useAlert = useAlertMsg()
    const useModal = useModalBox()
    //form pra: quote, tags, autor, source e data. As outras propriedades são automaticas
    const [multipleQuotes, setMultipleQuotes] = useState([])
    const [tags, setTags] = useState([])
    const [quoteData, setQuoteData] = useState({
        quotes: [],
        date: '',
        source: '',
        context: '',
        tags: [],
    })


    useEffect(() => {
        async function getQuoteToEdit() {
            if (props.quoteIdToEdit) {
                const response = await quoteEditingService.getQuote(props.quoteIdToEdit)
                console.log(response[0].tags)
                setMultipleQuotes(response[0].quotes)
                setTags(response[0].tags)

                setQuoteData((prevData) => ({
                    ...prevData,
                    date: response.date,
                    source: response.source,
                    context: response.context,
                    tags: response.tags
                }))
            }
        }
        getQuoteToEdit()
    }, [])

    const handleSourceSelect = (eventKey) => {
        if (eventKey) {
            setQuoteData((prevData) => ({
                ...prevData,
                source: eventKey
            }))
        }
    }

    const finalSubmitQuote = async () => {
        let response
        try {
            if (multipleQuotes.length > 1) {
                if (props.type === "addQuote") {
                    const updatedQuoteData = {
                        ...quoteData,
                        quotes: multipleQuotes,
                        tags: tags,
                        uploadDate: dayjs().format(),
                        uploadByUser: localStorage.getItem("userId"),
                        quoteType: "multiple"
                    }
                    response = await quoteEditingService.addQuote(updatedQuoteData)
                } else if (props.type === "editQuote") {
                    const updatedQuoteData = {
                        ...quoteData,
                        quotes: multipleQuotes,
                        tags: tags
                    }
                    response = await quoteEditingService.editQuote(props.quoteIdToEdit, updatedQuoteData)
                }
                if (response === true) {
                    alert(props.texts.submitSuccess)
                    window.location.reload()
                } else {
                    useAlert(response)
                }
            } else {
                useAlert("Diálogos precisam de 2 ou mais falas")
            }
        } catch (error) {
            useAlert(error)
        }
    }

    const handleSubmitQuote = async (e) => {
        e.preventDefault()
        try {
            // condicoes
            let paragraph
            let buttons = [{
                text: "Vou inserir", action: ["handleClose()"]
            },
            {
                text: "Deixa assim mesmo", action: [finalSubmitQuote]
            }]

            if (!(quoteData.date)) {
                paragraph = "Você se esqueceu da data. Não se lembra nem do ano?"
            }

            if (paragraph) {
                useModal({ title: "Faltam informações", paragraph: paragraph, buttons: buttons })
            } else {
                if (tags.length === 0) {
                    useAlert("Insira pelo menos uma tag.")
                } else if (!(isValidDate(quoteData.date))) {
                    useAlert("Insira pelo menos o ano ou mês/ano. Ex.: 2022 ou 05/2020.")
                } else {
                    finalSubmitQuote()
                }
            }
        } catch (error) {
            useAlert(error)
        }
    }

    const handleGenericChange = (e) => {
        const { name, value } = e.target
        if (name === "otherSourceName") {
            setQuoteData((prevData) => ({
                ...prevData,
                source: value
            }))
        }
        if (name === "quotes") {
            setMultipleQuotes((prevQuoteData) => ({
                ...prevQuoteData,
                ["quote"]: value
            }))
        }
        setQuoteData((prevData) => ({
            ...prevData,
            [name]: value
        }))
    }

    const handleMultipleQuoteChange = (e, index) => {
        const { name, value } = e.target
        const updatedMultipleQuotes = [...multipleQuotes]
        if (!updatedMultipleQuotes[index]) {
            updatedMultipleQuotes[index] = {}
        }

        updatedMultipleQuotes[index] = {
            ...updatedMultipleQuotes[index],
            [name]: value
        }
        setMultipleQuotes(updatedMultipleQuotes)
    }

    return (
        <>        
            <Row className="justify-content-center">
                <Col xs={12} sm={8} md={6} lg={5}>
                    <Form onSubmit={handleSubmitQuote}>
                        <MultipleQuoteInputs
                            onChange={handleMultipleQuoteChange}
                            setMultipleQuotes={setMultipleQuotes}
                            multipleQuotes={multipleQuotes}
                        />
                        <FormGroup className="mt-5 mx-auto">
                            <Row>
                                <Col>
                                    <FloatingLabel label="Data">
                                        <CenteredFormControl name="date" placeholder="Data" onChange={handleGenericChange} value={quoteData.date}>
                                        </CenteredFormControl>
                                    </FloatingLabel>

                                </Col>

                                <Col>
                                    <FloatingLabel label="Contexto (Opcional)">
                                        <Form.Control name="context" placeholder="Contexto (Opcional)" onChange={handleGenericChange} value={quoteData.context}>
                                        </Form.Control>
                                    </FloatingLabel>

                                </Col>
                            </Row>
                        </FormGroup>
                        <Row>
                            <FormGroup>
                                <DropdownButton drop="down" align="end" title={quoteData.source ? quoteData.source : "Source"} onSelect={handleSourceSelect}>
                                    {SourceNames.map((item) => (
                                        <Dropdown.Item key={item.value} eventKey={item.value}>{item.name}</Dropdown.Item>
                                    ))}
                                    <Dropdown.Divider />
                                    <div className="px-1 pb-2">
                                        <FloatingLabel label="Outro">
                                            <Form.Control name="otherSourceName" placeholder="Outro" onChange={handleGenericChange} value={SourceNames.includes(quoteData.source) ? "" : quoteData.source}>
                                            </Form.Control>
                                        </FloatingLabel>
                                    </div>
                                </DropdownButton>
                            </FormGroup>
                            <FormGroup>
                                <TagSelectorComponent tags={tags} setTags={setTags} />
                            </FormGroup>
                        </Row>
                        <Button type="submit">{props.texts.submitButton}</Button>
                    </Form>
                </Col>
            </Row>
        </>
    )
}