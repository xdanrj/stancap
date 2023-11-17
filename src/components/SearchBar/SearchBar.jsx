import { React, useState, useEffect } from "react";
import { Form, Button, DropdownButton } from "react-bootstrap";
import { InputGroup } from "./SearchBarStyles";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import { MDBIcon } from "mdb-react-ui-kit";
import { useAlertMsg } from "../Alert/AlertContext";

export function SearchBar(props) {
    const useAlert = useAlertMsg()

    const SearchTypes = [
        { label: "Autor", value: "author" },
        { label: "Tag", value: "tag" },
        { label: "Source", value: "source" },
        { label: "Upload por", value: "uploadByUser" },
        { label: "Contexto", value: "context" }
    ]

    const [selectedType, setSelectedType] = useState()
    const [typeColor, setTypeColor] = useState(false)
    const [inputColor, setInputColor] = useState(false)
    const [searchQuery, setSearchQuery] = useState({ "query": {}, "label": "" })
    const [initialSearchDone, setInitialSearchDone] = useState(false)
    console.log(searchQuery)

    //ainda refatorar pra aceitar qualquer tipo de query
    useEffect(() => {        
        async function handleParams() {
            const queryProp = Object.keys(props.urlQuery)
            console.log(queryProp.length)
            if (!initialSearchDone) {
                console.log("entrou funcao get")
                console.log(props.urlQuery)
                const foundType = SearchTypes.find((type) => type.value === Object.keys(props.urlQuery)[0])
                console.log(foundType)
                setSelectedType(foundType)

                setSearchQuery((prevSearchQuery) => ({
                    ...prevSearchQuery,
                    "query": props.urlQuery, "label": foundType?.label
                }))
                setInitialSearchDone(true)
            }
        }
        handleParams()

    }, [props.urlQuery, initialSearchDone])

    useEffect(() => {
        props.searchFunction(searchQuery)
    }, [searchQuery])

    const handleTypeSelect = (eventKey) => {
        console.log(selectedType)
        setSelectedType(SearchTypes[eventKey])
    }

    const handleSearchChange = (e) => {
        setSearchQuery({
            ["query"]: { [selectedType?.value]: e.target.value },
            ["label"]: selectedType?.label
        })
    }

    const checkAttributes = () => {
        console.log(selectedType)
        if (!selectedType) {
            setTypeColor(true)
            setTimeout(() => { setTypeColor(false) }, 500)
        } else if (!searchQuery.query[selectedType.value]) {
            setInputColor(true)
            setTimeout(() => { setInputColor(false) }, 500)
        } else {
            return true
        }
    }

    const handleSearchClick = () => {
        props.searchFunction(searchQuery)
    }

    return (
        <>
            <InputGroup>
                <DropdownButton variant={typeColor ? "danger" : "dark"} menuVariant="dark" title={selectedType ? selectedType.label : "Tipo"} onSelect={handleTypeSelect}>

                    {SearchTypes.map((item, index) => (
                        <DropdownItem eventKey={index} key={item.value}>{item.label}</DropdownItem>
                    ))}
                </DropdownButton>

                <Form.Control
                    className={inputColor ? "bg-danger" : "bg-light"}
                    placeholder="Pesquise..." onChange={handleSearchChange}
                    value={searchQuery.query["source"] ? searchQuery.query["source"] : "" || ""} />

                <Button variant="dark" onClick={() => checkAttributes() ? handleSearchClick() : null}>
                    <MDBIcon icon="search" />
                </Button>
            </InputGroup>
        </>
    )
}