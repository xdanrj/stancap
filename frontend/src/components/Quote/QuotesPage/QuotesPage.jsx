import React, { useEffect, useState } from "react"
import { useParams, useLocation, useSearchParams } from "react-router-dom"
import quoteEditingServices from "../../../services/quoteServices"
import SingleQuote from "../SingleQuote/SingleQuote"
import MultipleQuote from "../MultipleQuote/MultipleQuote"
import { sizes } from "../../../CommonStyles/screenSizes"
import { SearchBar } from "../../SearchBar/SearchBar"
import { useAlertMsg } from "../../Alert/AlertContext"
import { Col, Row, Container } from "react-bootstrap"
import userServices from "../../../services/userServices"
import { QuotesPageDiv } from "./QuotesPageStyles"
import { useModalBox } from "../../Modal/ModalContext"
import { QuotesPageFirstVisitModal } from "./QuotesPageFirstVisitModal/QuotesPageFirstVisitModal"
import PageSelector from "../../PageSelector/PageSelector"
import { useNavigate } from "react-router-dom"

export default function QuotesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const useAlert = useAlertMsg()
  const [quotesPageFirstVisitModalVisible, setQuotesPageFirstVisitModalVisible] = useState(localStorage.getItem("hadVisitedQuotesPageBefore"))
  const [quotesResponse, setQuotesResponse] = useState([])
  const [singleQuotesArray, setSingleQuotesArray] = useState([])
  const [multipleQuotesArray, setMultipleQuotesArray] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const [quotesQtd, setQuotesQtd] = useState(0)
  const quoteService = new quoteEditingServices()
  const userService = new userServices()



  async function getNoQueryQuotes() {
    const { quotes, quotesQtd } = await quoteService.getNoQueryQuotes(Object.fromEntries(searchParams))
    setQuotesQtd(quotesQtd)
    setQuotesResponse(quotes)
  }

  async function getQueryQuotes() {
    const { quotes, message, quotesQtd } = await quoteService.getQueryQuotes(Object.fromEntries(searchParams))
    setQuotesResponse(quotes)
    setQuotesQtd(quotesQtd)
    message && useAlert(message)
  }

  useEffect(() => {
    const currentSingleQuotesArray = []
    const currentMultipleQuotesArray = []

    // TRATAMENTOS/ FORMATAÇÃO PRÉ DIVISÃO DE TIPOS DE QUOTE:
    if (quotesResponse) {
      const setUploadersNames = async () => {
        quotesResponse.map(async (data) => {
          data.uploadByUser = await userService.getUsername(data.uploadByUser)
        })
      }
      setUploadersNames()

      if (Array.isArray(quotesResponse)) {
        quotesResponse.forEach((data) => {
          if (data.quotes.length === 1) {
            currentSingleQuotesArray.push(data)
          }
          else if (data.quotes.length > 1) {
            currentMultipleQuotesArray.push(data)
          }
        })
        setSingleQuotesArray(currentSingleQuotesArray)
        setMultipleQuotesArray(currentMultipleQuotesArray)
      }
    }
    console.log(quotesResponse)
  }, [quotesResponse])

  return (
    <>
      {!quotesPageFirstVisitModalVisible && (<QuotesPageFirstVisitModal />)}

      <QuotesPageDiv>
        <SearchBar getQueryQuotes={getQueryQuotes} getNoQueryQuotes={getNoQueryQuotes} searchParams={searchParams} />

        <Row className="justify-content-center">
          <Col xs={12} sm={9} md={7} lg={6} xl={5} >
            <SingleQuote singleQuotes={singleQuotesArray} />
            <MultipleQuote multipleQuotes={multipleQuotesArray} />
          </Col>
        </Row>
      </QuotesPageDiv>
      <PageSelector searchParams={searchParams} quotesQtd={quotesQtd} setQuotesQtd={setQuotesQtd} />
    </>
  )
}

