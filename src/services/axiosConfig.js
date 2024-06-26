import axios from "axios"

console.log("apiUrl: ", import.meta.env.VITE_API_URL)

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || process.env.API_URL,
})

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se o erro tem uma resposta, retorna a resposta mesmo que seja um erro 4xx
        if (error.response) {
            console.log(error)
            if (error.response.status === 498) {
                alert("Token de usuário expirado. Faça login novamente.")
                
            }
            return Promise.resolve(error.response)
        }
        // Se o erro não tem uma resposta, retorna o próprio erro
        return Promise.reject(error)
    }
)

axiosInstance.interceptors.request.use(
    (config) => {
        if (localStorage.getItem("userToken")) {
            const userToken = localStorage.getItem("userToken")

            if (userToken) {
                config.headers['authorization'] = `Bearer ${userToken}`
                //return config
            }

        } else if (localStorage.getItem("tempToken")) {
            const tempToken = localStorage.getItem("tempToken")
            console.log("tempToken aqui: ", tempToken)
            if (tempToken) {
                config.headers['tempauthorization'] = `Bearer ${tempToken}`
                //return config
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default axiosInstance