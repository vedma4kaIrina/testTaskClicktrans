import './App.css';
import { Field, Formik } from 'formik';
import * as Yup from 'yup'
import { useState } from 'react';
import axios from 'axios';
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);
mock.onPost('/someplase').reply(204);
//mock.onPost('/someplase').reply(400);


const DisplayingErrorMessagesSchema = Yup.object().shape({
  description: Yup.string()
    .max(255, 'You can’t enter more than 255 characters')
    .required('Text is required'),
  sendConfirmation: Yup.string()
    .required('Text is required'),
  vat: Yup.string()
    .required('Text is required'),
  priceNettoEUR: Yup.string()
  .matches(/^[0-9]*[.,]?[0-9]*$/, 'Please, input number')
  .required('Text is required'),
  
});

const saveData = async (data) => {
  try {
    const dataAnswer = await axios.post('/someplase', data);
    if (dataAnswer.status === 204)
      return {answer: '204', message: 'Success'}
    
    return {answer: null, message: 'fail'}

  } catch (error) {
    let message = 'fail';

    switch(error.response?.status) {
      case 403:
      case 404:
        //message = error.response.data.message;
        message = 'there may be a message processing from the server'
        break
      default:
        message='Failed to create'
    }
    return {answer: null, message: message}
  }
}

function App() {

  const [descriptionBlur, setDescriptionBlur] = useState(false);
  const [priceNettoEURFocus, setPriceNettoEURFocus] = useState(false);
  const [remainder, setRemainder] = useState(255);
  const [showForm, setShowForm] = useState(true);
  const [messageServer, setMessageServer] = useState('');
  const [showMessageServer, setShowMessageServer] = useState(false);
  const [showMessageServerSuccess, setShowMessageServerSuccess] = useState(false);


  const submitFun = (values) => {
    saveData(values).then((data) => {
      if (data.answer) {
        setShowForm(false);
        setShowMessageServerSuccess(true);
      }
      setMessageServer(data.message);
      setShowMessageServer(true);
    });
  }
  
  return (
    <div className="App">
      {showForm? (     
      <Formik
        initialValues={{ description: '',
                       sendConfirmation: '',
                       vat: '',
                       priceNettoEUR: '',
                       priceBruttoEUR: ''}}   
        validationSchema={DisplayingErrorMessagesSchema}
        onSubmit={(values) => {
          submitFun(values);       
        }}
      >
        {({
          values,
          errors,
          setFieldValue,
          touched,
          handleSubmit
        }) => (
          <form onSubmit={handleSubmit} className='main'>
            <div className='form_block'>
            <label htmlFor="description">Description: </label>
            <Field 
              name='description'
              value={values.description}
              onChange={ (ev)=> {
                setFieldValue('description', ev.target.value);
                setRemainder(255 - ev.target.value.length);
              }}
              onFocus={ () => setDescriptionBlur(true)}
            />
            <div>remainder - {remainder}</div>
            {(errors.description && descriptionBlur) || touched.description ? <div className='red'>{errors.description}</div> : null}
            </div>

            <div className='form_block'>
            <label htmlFor="sendConfirmation">Send confirmation: </label>
            <div role="group" >
              <label>
                <Field type="radio" name="sendConfirmation" value="Yes" />
                Yes
              </label>
              <label>
                <Field type="radio" name="sendConfirmation" value="No" />
                No
              </label>
            </div>
            {errors.sendConfirmation && touched.sendConfirmation ? <div className='red'>{errors.sendConfirmation}</div> : null}
            </div>

            <div className='form_block'>
            <label htmlFor="description">VAT: </label>
            <Field as="select" 
              name="vat" 
              value={values.vat}
              onChange={ (ev)=> { 
                if (values.priceNettoEUR)  {                        
                const numEdit = values.priceNettoEUR.replace(',', '.');     
                if (Number(numEdit)) 
                  setFieldValue('priceBruttoEUR', numEdit - (numEdit * values.vat / 100))
                else 
                  setFieldValue('priceBruttoEUR', '' )
                } 
                setFieldValue('vat', ev.target.value);
              }}    
              >
              <option value="" hidden>Choose VAT</option>
              <option value="19">19%</option>
              <option value="21">21%</option>
              <option value="23">23%</option>
              <option value="25">25%</option>
            </Field>
            {errors.vat && touched.vat ? <div className='red'>{errors.vat}</div> : null}
            </div>

            <div className='form_block'>
            <label htmlFor="description">Price netto EUR: </label>
            <Field 
              name='priceNettoEUR'
              value={values.priceNettoEUR}
              disabled={!values.vat}
              onChange={ (ev)=> {              
                setPriceNettoEURFocus(true);                
                const numEdit = ev.target.value.replace(',', '.');         
                if (Number(numEdit)) 
                  setFieldValue('priceBruttoEUR', numEdit - (numEdit * values.vat / 100))
                else 
                  setFieldValue('priceBruttoEUR', '' )
                
                setFieldValue('priceNettoEUR', ev.target.value);
              }}             
            />         
            {(errors.priceNettoEUR && priceNettoEURFocus) || touched.priceNettoEUR ? <div className='red'>{errors.priceNettoEUR}</div> : null}
            </div>

            <div className='form_block'>
            <label htmlFor="description">Price brutto EUR: </label>
            <Field 
              name='priceBruttoEUR'
              disabled={true}
              value={values.priceBruttoEUR}             
            />
            </div>

            <div className='form_block'>
              <button type="submit">Submit</button>
            </div>

          </form>
        )}

      </Formik>
      ) : ''} 
    { showMessageServerSuccess && showMessageServer ? (
      <div  className='success'> {messageServer} </div>
    ) : ( showMessageServer && (
      <div  className='red'> {messageServer} </div>
    )
    )}
    </div>
  );
}

export default App;
