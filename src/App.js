import Footer from './com/Footer'
import Header from './com/Header'
import Main from './com/Main'
import useURL from './hook/useURL'
import './App.css'


export default function App() {
  useURL()
  
  return <>
    <Header />
    <Main />
    <Footer />
  </>
}