import React, { useEffect, useState } from "react"
import dayjs from "dayjs"
import { MinimalQuoteContainer, InternalContainer, Paragraph, ParagraphAutor, MdbIcon } from "./SummaryQuoteStyles";
import { Col, Row, Button } from "react-bootstrap";
import quoteEditingServices from "../../../services/quoteServices"
import { useNavigate } from "react-router-dom";
import QuoteInfo from "./QuoteInfo/QuoteInfo";
import { useAlertMsg } from "../../Alert/AlertContext";

const quoteService = new quoteEditingServices()

export default function SummaryQuote() {
    const useAlert = useAlertMsg()
    const navigate = useNavigate()
    const [quotesResponse, setQuotesResponse] = useState([])
    const [quotesResponseArray, setQuotesResponseArray] = useState([])
    const [userId, setUserId] = useState([localStorage.getItem("userId")])
    const [deletedQuotes, setDeletedQuotes] = useState([])

    useEffect(() => {
        async function fetchQuotes() {
            let query = { "uploadByUser": userId }
            const response = await quoteService.getQuote(query)
            setQuotesResponse(response)
            setQuotesResponseArray(response)
        }
        fetchQuotes()
    }, [])

    const handleEditQuote = async (quoteId, quoteType) => {
        try {
            navigate(`/edit_quote/${quoteType}/${quoteId}`)
        } catch (error) {
            useAlert(error)
        }
    }

    const handleDeleteQuote = async (quoteId) => {
        try {
            console.log(quoteId)
            console.log(userId[0])
            const response = await quoteService.deleteQuote(quoteId, userId[0])
            console.log(response)
            if (response) {
                setDeletedQuotes(deletedQuotes => [...deletedQuotes, response])
                useAlert("Quote excluída com sucesso")
            } else {
                useAlert("Erro ao tentar excluir quote")
            }
        } catch (error) {
            useAlert(error)
            console.log(error)
        }
    }

    const quoteToRecover = async (deletedQuoteId) => {
        return deletedQuotes.find((obj) => obj._id === deletedQuoteId)
    }

    const handleUndoDeleteQuote = async (deletedQuoteId) => {
        try {
            const recoveredQuote = quoteToRecover(deletedQuoteId)
            if(recoveredQuote){
                await quoteService.addQuote(quoteToRecover)                
                useAlert("Exclusão desfeita")
            }            
        } catch (error) {
            
        }
    }

    return (
        <>
            <Row className="justify-content-center">
                <Col xs={12} sm={8} md={6} lg={5}>
                    {
                        quotesResponse.length > 0 ? (
                            quotesResponseArray.map((data) => (
                                <div key={data._id}>
                                    <MinimalQuoteContainer>
                                        <InternalContainer>
                                            <Paragraph>{data.quotes[0].quote} </Paragraph>
                                            <ParagraphAutor>—{data.quoteType == "single" ? data.author : data.quotes[0].author}</ParagraphAutor>
                                            <MdbIcon icon="info-circle" />
                                            <MdbIcon icon="trash-alt" onClick={() => handleDeleteQuote(data._id)} />
                                            <MdbIcon icon="pencil-alt" onClick={() => handleEditQuote(data._id, data.quoteType)} />

                                            {quoteToRecover(data._id) ?
                                                <>
                                                    <Button onClick={handleUndoDeleteQuote(data._id)}> Desfazer exclusão</Button>
                                                </>
                                                :
                                                <></>
                                            }

                                        </InternalContainer>
                                    </MinimalQuoteContainer>
                                </div>
                            ))
                        ) : (
                            <h4>Você ainda não criou nenhuma quote</h4>
                        )
                    }
                </Col>
            </Row >
        </>
    )
}