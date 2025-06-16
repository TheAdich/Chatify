import React,{useState} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import Groupinfo from './pages/Groupinfo';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './redux/store';
import RenamegroupInfo from './pages/RenamegroupInfo';
import RagPdf from './pages/rag_pdf';
import VideoRoom from './pages/VideoRoom';
import PaymentGateway from './pages/PaymentGateway';
function App() {

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route exact path='/' element={<Login/>}></Route>
            <Route path='signup' element={<Signup />} />
            <Route path='/chat' element={<Chat />} />
            <Route path='/creategroup' element={<Groupinfo/>}></Route>
            <Route path='/renamegroup' element={<RenamegroupInfo/>}></Route>
            <Route path='/ragpdf' element={<RagPdf/>}></Route>
            {/* <Route path='/videochat' element={<VideoRoom/>}></Route> */}
            {/* <Route path='/payment' element={<PaymentGateway/>}></Route> */}
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>


  )
}

export default App
