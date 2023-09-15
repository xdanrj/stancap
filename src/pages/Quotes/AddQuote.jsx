import React from "react"
import GenericQuoteForm from "../../components/Quote/GenericQuoteForm/GenericQuoteForm"

export default function AddQuote() {
    return (
        <>
            <GenericQuoteForm
                texts={{
                    submitButton: "Criar quote", submitSuccess: "Quote criada com sucesso"
                }}
                type={"addQuote"}
            />
        </>
    )
}