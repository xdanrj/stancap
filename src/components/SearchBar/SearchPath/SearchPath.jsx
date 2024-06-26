import React, { useState, useEffect } from "react"
import { Breadcrumb } from "react-bootstrap"
import { useNavigate, useLocation } from "react-router-dom"
import Sources from "../../Quote/Sources"
import { QuotesProps } from "../../../Formatting/QuotesProps"

export default function SearchPath({ searchParams }) {
  const QuoteProp = new QuotesProps()
    const Source = new Sources()
    const location = useLocation()
    const navigate = useNavigate()
    const [queryParams, setQueryParams] = useState([])

    useEffect(() => {
        let updatedQueryParams = []
        for (const [key, value] of searchParams.entries()) {
            if (key !== "page") {
                let modifiedValue
                if (key === 'quoteType') {
                    modifiedValue = (value === 'single') ? 'Citação' : 'Diálogo'
                }
                else if (key === 'sort') {
                    modifiedValue = (value === 'ascending') ? 'crescente' : 'decrescente'
                }
                else if (key === "source") {
                    modifiedValue = Source.getLabel(value)
                } else {
                    modifiedValue = value
                }
                updatedQueryParams.push({ "key": key, "value": modifiedValue })
            }
            console.log(key, value)
        }
       
        setQueryParams(updatedQueryParams)
    }, [location.search])

    const handlePathClick = (queryKey) => {
      console.log(queryKey.toLowerCase())
        searchParams.delete(queryKey.toLowerCase())
        navigate({ search: searchParams.toString() })
    }

    return (
        <div className="d-flex justify-content-center mx-auto mb-4 text-center">
            <Breadcrumb>
                {queryParams.map((item, index) => (
                    item.value && (
                        <Breadcrumb.Item key={index} onClick={() => handlePathClick(item.key)} className="justify-content-center mx-auto">
                        {`${QuoteProp.getLabel(item.key)}: ${item.value}` }
                    </Breadcrumb.Item>
                    )                    
                ))}
            </Breadcrumb>
        </div>
    )
}