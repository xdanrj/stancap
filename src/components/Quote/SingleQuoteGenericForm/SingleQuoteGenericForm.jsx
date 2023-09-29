import React from "react";
import { useState, useEffect } from "react"
import Button from "react-bootstrap/Button";
import { Form, Col, Row, Dropdown, DropdownButton, ButtonGroup } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { FloatingLabel, FormGroup, CenteredFormGroup } from "../../../CommonStyles/CommonStyles";
import TagSelectorComponent from "../TagsSelector/TagsSelectorComponent";
import dayjs from "dayjs";
import { SourceNames } from "../SourceCommonFunctions";

import quoteEditingServices from "../../../services/quoteServices"

const quoteEditingService = new quoteEditingServices()

export default function SingleQuoteGenericForm(props) {
    
    //form pra: quote, tags, autor, source e data. As outras propriedades são automaticas
    const [quotes, setQuotes] = useState([])
    const [tags, setTags] = useState([])
    const [quoteData, setQuoteData] = useState({
        quotes: [],
        author: '',
        date: '',
        source: '',
        context: '',
        tags: [],
    })
    console.log(quoteData)
    useEffect(() => {
        async function getQuoteToEdit() {
            if (props.quoteIdToEdit) {
                console.log("entrou na condicao certa")
                const apiResponse = await quoteEditingService.getQuote(props.quoteIdToEdit)
                const response = await apiResponse.data.response.response[0]
                console.log(response)
                console.log(response.quotes[0].quote)
                setQuoteData((prevData) => ({
                    ...prevData,
                    quotes: response.quotes[0].quote,
                    author: response.author,
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
        if(eventKey){
        setQuoteData((prevData) => ({
            ...prevData,
            source: eventKey
        }))
    }
    }

    const handleSubmitQuote = async (e) => {
        e.preventDefault();
        let response
        try {
            if (props.type === "addQuote") {
                const updatedQuoteData = {
                    ...quoteData,
                    quotes: quotes,
                    tags: tags,
                    uploadDate: dayjs().format(),
                    uploadByUser: localStorage.getItem("username")
                }
                response = await quoteEditingService.addQuote(updatedQuoteData)
            } else if (props.type === "editQuote") {
                const updatedQuoteData = {
                    ...quoteData,
                    quotes: quotes,
                    tags: tags
                }
                const response = await quoteEditingService.editQuote(props.quoteIdToEdit, updatedQuoteData)
            }
            if (response === true) {
                alert(props.texts.submitSuccess)
            } else {
                alert(response)
            }
        } catch (error) {
            alert(error)
        }
    }

    const handleGenericChange = (e) => {
        const { name, value } = e.target

        if(name === "otherSourceName") {
            setQuoteData((prevData) => ({
                ...prevData,
                source: value
            }))
        }

        if (name === "quotes") {
            setQuotes((prevQuoteData) => ({
                ...prevQuoteData,
                ["quote"]: value
            }))
        }

        setQuoteData((prevData) => ({
            ...prevData,
            [name]: value
        }))
    }

    return (
        <>
            <Form onSubmit={handleSubmitQuote}>
                <Row>
                    <FormGroup>
                        <FloatingLabel label="Quote">
                            <Form.Control name="quotes" placeholder="Quote" onChange={handleGenericChange} value={quoteData.quotes}>
                            </Form.Control>
                        </FloatingLabel>
                    </FormGroup>

                    <Col>
                        <FormGroup>
                            <FloatingLabel label="Autor">
                                <Form.Control name="author" placeholder="Autor" onChange={handleGenericChange} value={quoteData.author}>
                                </Form.Control>
                            </FloatingLabel>
                        </FormGroup>
                    </Col>

                    <Col>
                        <FormGroup>
                            <FloatingLabel label="Data">
                                <Form.Control name="date" placeholder="Data" onChange={handleGenericChange} value={quoteData.date}>
                                </Form.Control>
                            </FloatingLabel>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <FloatingLabel label="Contexto (Opcional)">
                                <Form.Control name="context" placeholder="Contexto (Opcional)" onChange={handleGenericChange} value={quoteData.context}>
                                </Form.Control>
                            </FloatingLabel>
                        </FormGroup>
                    </Col>
                </Row>
                <Col>

                    <FormGroup>
                        <DropdownButton title={quoteData.source ? quoteData.source : "Source"} onSelect={handleSourceSelect}>
                            {SourceNames.map((item) => (
                                <Dropdown.Item key={item} eventKey={item}>{item}</Dropdown.Item>
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
                </Col>

                <FormGroup>
                    <TagSelectorComponent tags={quoteData.tags} setTags={setTags} />
                </FormGroup>

                <Button type="submit">{props.texts.submitButton}</Button>
            </Form>
        </>
    )
}