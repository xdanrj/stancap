import { User } from "../models/User.js"
import { Quotes } from "../models/Quotes.js"
import mongoose from "mongoose"
import _ from "lodash"

export const QuotesProperties =
[   { label: "Autor", value: "author" },
    { label: "Tags", value: "tags" },
    { label: "Source", value: "source" },
    { label: "Upload por", value: "uploadByUsername" },
    { label: "Contexto", value: "context" }]
// Função que seleciona o usuário através de qualquer propriedade. Usa sempre o primeiro objeto da requisição ( {propriedade: valorDaPropriedade} ). Serve para selecionar o usuário caso a rota não explicite a propriedade selecionada.
export async function selectUser(searchquery) {
  let property = Object.keys(searchquery)[0]
  let target = searchquery[property]
  let query = { [property]: target }

  if (property !== "_id") {
    return false
  }

  let foundUser = await User.find(searchquery).lean()
  if (foundUser) {
    return _.pick(foundUser[0], "username")
  } else {
    return false
  }
}

// Essa função permite selecionar qualquer usuário usando qualquer propriedade como filtro. Recebe como parâmetro um único OBJETO (propriedade: valorPropriedade)
export async function userExists(proprietyTarget) {
  const user = await User.findOne(proprietyTarget)
  if (user) {
    return user
  }
  else {
    return false
  }
}


export async function selectQuote(searchquery, sort, skipItems = null, limit = null) {
  console.log("searchquery: ")
  console.log(searchquery)
  const searchQueryKeys = Object.keys(searchquery)
  console.log("searchQueryKeys: ")
  console.log(searchQueryKeys)
  let property = _.without(searchQueryKeys, "sort", "page")[0]
  console.log("---------------")
  console.log(property)
  let quotesQtd
  let foundQuote
  let finalQuery

  if (searchQueryKeys.includes("uploadByUsername")) {
    const foundUser = await User.find({ username: searchquery.uploadByUsername })
    const userId = _.pick(foundUser[0], "_id")
    const userIdStr = userId._id.toString()
    searchquery = { uploadByUser: userIdStr }
  }

  quotesQtd = await Quotes.find(searchquery).countDocuments()

  if (searchQueryKeys.includes("tags")) {
    let tagsToSearch = searchquery.tags.split(",")
    tagsToSearch = tagsToSearch.map(tag => tag.trim())
    console.log("tagsToSearch:")
    console.log(tagsToSearch)
   
    delete searchquery.tags
    console.log("searchquery pos:")
    console.log(searchquery)
    finalQuery = { tags: { $in: tagsToSearch }, ...searchquery }
    console.log("finalQuery: ")
    console.log(finalQuery)


    quotesQtd = await Quotes.find(finalQuery).countDocuments()
    foundQuote = await Quotes.find(finalQuery).sort({ uploadDate: sort }).skip(skipItems).limit(limit)

  } else {
    if (limit !== null && skipItems !== null) {
      foundQuote = await Quotes.find(searchquery).sort({ uploadDate: sort }).skip(skipItems).limit(limit)
    } else {
      foundQuote = await Quotes.find(searchquery)
    }
  }
  console.log("quotesQTD:")
  console.log(quotesQtd)
  if (foundQuote.length > 0) {
    return { foundQuote, quotesQtd }
  } else {
    return {message:`${_.capitalize(property)} não encontrado!`}
  }
}

// Essa função permite selecionar qualquer quote usando qualquer propriedade como filtro. Recebe como parâmetro um único OBJETO (propriedade: valorPropriedade)
export async function quoteExists(proprietyTarget) {
  const quote = await Quotes.findOne({ proprietyTarget })
  if (quote) {
    return true
  }
  else {
    return false
  }
}