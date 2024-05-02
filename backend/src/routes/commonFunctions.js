import { User } from "../models/User.js"
import { Quotes } from "../models/Quotes.js"
import mongoose from "mongoose"
import _ from "lodash"

export const QuotesLabels =
  [{ label: "Autor", value: "author" },
  { label: "Tags", value: "tags" },
  { label: "Source", value: "source" },
  { label: "Upload por", value: "uploadByUsername" },
  { label: "Contexto", value: "context" },
  { label: "Ordem", value: "sort"}]

export function getPropertyLabel(rawValue) {
  let response
  const findLabel = QuotesLabels.find((prop) => prop.value === rawValue)
  findLabel ? response = findLabel.label : response = null
  return response
}

// Função que seleciona o usuário através de qualquer propriedade. Usa sempre o primeiro objeto da requisição ( {propriedade: valorDaPropriedade} ). Serve para selecionar o usuário caso a rota não explicite a propriedade selecionada.
export async function selectUser(searchQuery) {
  let property = Object.keys(searchQuery)[0]
  let target = searchQuery[property]
  let query = { [property]: target }

  if (property !== "_id") {
    return false
  }

  let foundUser = await User.find(searchQuery).lean()
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

export async function selectQuote(searchQueryArg, sort, skipItems = null, limit = null) {
  const searchQueryKeys = Object.keys(searchQueryArg)
  const searchQuery = searchQueryArg
  let quotesQtd
  let queriesToDo = {}

  console.log("searchQuery: ", searchQuery)
  if (searchQueryKeys.includes("uploadByUsername")) {
    console.log("entrou no if upuser")
    let foundUser = await User.find({ username: searchQuery.uploadByUsername })
    foundUser = foundUser[0]
    if (foundUser) {
      const userId = _.pick(foundUser, "_id")
      const userIdStr = userId._id.toString()
      delete searchQuery.uploadByUsername
      let uploadByUsernameQuery = { uploadByUser: userIdStr }
      queriesToDo = { ...queriesToDo, ...uploadByUsernameQuery }
    } else {
      queriesToDo = { ...queriesToDo, ...{ "uploadByUsername": null } }
    }
  }

  if (searchQueryKeys.includes("tags")) {
    let tagsToSearch = searchQuery.tags.split(",")
    tagsToSearch = tagsToSearch.map(tag => tag.trim())
    delete searchQuery.tags
    let tagsQuery = { tags: { $in: tagsToSearch } }
    queriesToDo = { ...queriesToDo, ...tagsQuery }
  }
  queriesToDo = { ...queriesToDo, ...searchQuery }

  let quotesCount = {}
  let findingQuotes = []
  let successQueries = []
  let failedQueries = []
  let mostQueryRes = null

  const fullQueryTry = await Quotes.find
    (queriesToDo)
    .sort({ uploadDate: sort })
    .skip(skipItems)
    .limit(limit).lean()

  console.log("fullquerytry: ", fullQueryTry)

  if (fullQueryTry.length > 0) {
    successQueries = fullQueryTry
    quotesQtd = await Quotes.countDocuments(queriesToDo)
  } else {
    for (const [key, value] of Object.entries(queriesToDo)) {
      const quotes = await Quotes.find
        ({ [key]: value })
        .sort({ uploadDate: sort })
        .skip(skipItems)
        .limit(limit).lean()

      findingQuotes.push(...quotes)
      // contabiliza a query com mais resultados
      const keyValuePair = `{"${key}":"${value}"}`
      quotesCount[keyValuePair] = (quotesCount[keyValuePair] || 0) + quotes.length
    }
    
    let maxQuotes = -1
    //define qual query teve mais resultados
    for (const [key, value] of Object.entries(quotesCount)) {
      if (value > maxQuotes) {
        maxQuotes = value
        mostQueryRes = { [key]: value }
      }
    }
    console.log("quotesCount: ", quotesCount)

    const qtsCntKeys = _.keys(quotesCount)
    let doneQueries = qtsCntKeys.map(str => JSON.parse(str))
    doneQueries = _.merge({}, ...doneQueries)
    const mQrKey = Object.keys(mostQueryRes)[0]
    mostQueryRes = JSON.parse(mQrKey)

    console.log("mostQueryRes: ", mostQueryRes)
    console.log("qtsCntKeys: ", qtsCntKeys)
    console.log("doneQueries: ", doneQueries)

    if (findingQuotes.length > 0) {
      for (const key in doneQueries) {
        let keyAdded = false
        for (const obj of findingQuotes) {
          if (obj[key] !== mostQueryRes[key]) {
            if (!keyAdded) {
              failedQueries.push(key)
              keyAdded = true
            }
          } else {
            successQueries.push(obj)
          }
        }
      }
    }
    // console.log("failedQueries: ", failedQueries)
    // console.log("successQueries: ", successQueries)
    //todo: falta o quotesqtd caso nao for uma fullquerytry
  }

  let message = null
  let frmtFailedQueries = failedQueries.map((k) => getPropertyLabel(k) || k).join(" + ")
  console.log("qq: ", quotesQtd)

  if (failedQueries.length > 0 && successQueries.length > 0) {
    message = `Resultados de apenas ${getPropertyLabel(..._.keys(mostQueryRes))}.
    ${frmtFailedQueries} não encontrado(s)`
  } else if (successQueries.length === 0) {
    message = `${frmtFailedQueries} não encontrado(s)`
  }
  return { quotes: successQueries, message: message, quotesQtd: quotesQtd }

  //   let finalFailedQueries = failedQueries.map((q) => getPropertyLabel(q) || q).join(" • ")
  //   return { message: `${finalFailedQueries} não encontrado(s)` }
  // }
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