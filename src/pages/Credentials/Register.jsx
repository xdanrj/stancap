import { useState } from "react"
import Button from "react-bootstrap/Button";
import { Form, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FloatingLabel } from "../../CommonStyles/CommonStyles";
import { passwordValidation, usernameValidation } from "../../Validations/RegisterValidations";
import loginAndRegisterServices from "../../services/loginAndRegisterServices";
import { useAlertMsg } from "../../components/Alert/AlertContext";
import dayjs from "dayjs";
const loginAndRegisterService = new loginAndRegisterServices()

function RegisterForm() {
  const navigate = useNavigate()
  const useAlert = useAlertMsg()

  // definição dos valores
  const [email, setEmail] = useState([])
  const [code, setCode] = useState([])
  const [registerData, setRegisterData] = useState([])
  // visibilidade dos Forms
  const [sendCodeForm, setSendCodeForm] = useState(true)
  const [checkCodeForm, setCheckCodeForm] = useState(false)
  const [registerForm, setRegisterForm] = useState(false)
  const [retryState, setRetryState] = useState(60)
  const [retryHasClicked, setRetryHasClicked] = useState(false)

  const handleSubmitSendCode = async (e) => {
    e.preventDefault()
    try {
      const response = await loginAndRegisterService.sendCode({ email })
      if (response === true) {
        alert('Código enviado com sucesso')
        setSendCodeForm(false)
        setCheckCodeForm(true)
        const timer = setInterval(() => {
          setRetryState(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
      else {
        useAlert(response)
      }
    } catch (error) { alert(error.response.data.error) }
  }

  const handleSubmitCheckCode = async (e) => {
    e.preventDefault();
    try {
      const response = await loginAndRegisterService.checkCode({
        email, code
      })
      console.log(response)
      if (response.status) {
        alert(response.message)
        setCheckCodeForm(false)
        setRegisterForm(true)
      }
      else {
        useAlert(response.message)
      }
    } catch (error) { useAlert(error) }
  }

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    try {
      const passwordResult = passwordValidation(registerData.password)
      const usernameResult = await usernameValidation(registerData.username)
      console.log(registerData)
      if (!passwordResult.response || !usernameResult.response) {
        const errorMessage = passwordResult.response ? usernameResult.message : passwordResult.message
        console.log(errorMessage)
        useAlert(errorMessage)
      } else {
        const loginData = {
          email,
          username: registerData.username,
          password: registerData.password
        }
        const response = await loginAndRegisterService.register(loginData)
        if (response === true) {
          alert('Usuário cadastrado com sucesso')
          const response = await loginAndRegisterService.login(loginData)
          if (response.userToken) {
            localStorage.setItem("userToken", response.userToken)
            localStorage.setItem("userId", response.userId)
            localStorage.setItem("username", response.username)
            console.log("logou")
          } else {
            alert('Falha no auto-login. Faça login manualmente.')
          }
          navigate('/quotes')
        } else {
          console.log(response)
          alert(response)
        }
      }
    } catch (error) {
      console.log(error)
      useAlert(error)
    }
  }
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }
  const handleCodeChange = (e) => {
    //old: "" "" /\
    setCode(e.target.value.trim())
    console.log(code)
  }
  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
      email: email.email
    })
    console.log("registerData: ", registerData)
  }

  return (
    <>
      <Row className="justify-content-center">
        <Col xs={8} sm={6} md={4} lg={3} >
          {sendCodeForm && (
            <>
              <h2 className="mb-4">Criação de conta</h2>
              <h5>Use um e-mail válido</h5>
              <Form onSubmit={handleSubmitSendCode}>
                <FloatingLabel label="E-mail">
                  <Form.Control
                    className="mb-3"
                    name="email"
                    type="email"
                    onChange={handleEmailChange}
                    placeholder="E-mail" />
                </FloatingLabel>
                <Button type="submit">Enviar código</Button>
              </Form>
            </>
          )}
//todo: capturar erro do twilio
          {checkCodeForm && (
            <>
              <h2 className="mb-4">Verifique seu e-mail</h2>
              <Form onSubmit={handleSubmitCheckCode}
              >
                <div className="d-flex justify-content-center  align-items-center">
                  <FloatingLabel label="Código" className="w-50"  >
                    <Form.Control
                      className=" mb-3"
                      name="code"
                      type="text"
                      required
                      onChange={handleCodeChange}
                      placeholder=""
                    />
                  </FloatingLabel>
                </div>
                <Button className="" type="submit"
                  disabled={retryHasClicked && retryState > 0}>
                  Enviar {retryHasClicked && `(${retryState})`}
                </Button>
              </Form>
            </>
          )}

          {registerForm && (
            <>
              <h5 className="mb-3">Você logará com seu e-mail</h5>
              <Form onSubmit={handleSubmitRegister}>
                <FloatingLabel label="E-mail" className="mb-8">
                  <Form.Control style={{ color: 'grey' }}
                    className="mb-3"
                    name="email"
                    type="email"
                    value={email}
                    disabled
                  />
                </FloatingLabel>
                <h2 className="mb-3">Finalizando cadastro</h2>
                <FloatingLabel label="Username">
                  <Form.Control
                    className="mb-3"
                    name="username"
                    type="text"
                    onChange={handleRegisterChange}
                    placeholder=""
                  />
                </FloatingLabel>
                <FloatingLabel label="Senha">
                  <Form.Control
                    className="mb-3"
                    name="password"
                    type="password"
                    onChange={handleRegisterChange}
                    placeholder=""
                  />
                </FloatingLabel>
                <Button type="submit">Registrar</Button>
              </Form>
            </>
          )}
        </Col>
      </Row>
    </>

  )
}

export default RegisterForm