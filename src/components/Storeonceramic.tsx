import { DID } from 'dids'
//@ts-ignore
import { Integration } from 'lit-ceramic-sdk'
import React from 'react';
//@ts-ignore
import styles from "../styles/storeonceramic.module.css";

declare global {
  interface Window {
    did?: DID
  }
}

const Storeonceramic = () => {

  let litCeramicIntegration = new Integration('https://ceramic-clay.3boxlabs.com', 'polygon')

  let streamID = 'kjzl6cwe1jw1479rnblkk5u43ivxkuo29i4efdx1e7hk94qrhjl0d4u0dyys1au' // test data

  const updateAlert = (status: string, message: string) => {
    const alert = document.getElementById('alerts')

    if (alert !== null) {
      alert.textContent = message
      alert.classList.add(`alert-${status}`)
      alert.classList.remove('hide')
      setTimeout(() => {
        alert.classList.add('hide')
      }, 5000)
    }
  }
  const updateStreamID = (resp: string | String) => {
    streamID = resp as string
    console.log('you now have this as your streamID', streamID)
    // @ts-ignore
    document.getElementById('stream').innerText = resp
  }

  document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContent.........')
    litCeramicIntegration.startLitClient(window)
  })

  document.getElementById('readCeramic')?.addEventListener('click', () => {
    if (document.getElementById('stream') === null) {
      updateAlert('danger', `Error, please write to ceramic first so a stream can be read`)
    } else {
      // @ts-ignore
      console.log('this is the streamID youre sending: ', streamID)
      const response = litCeramicIntegration.readAndDecrypt(streamID).then(
        (value : any) =>
          // @ts-ignore
          (document.getElementById('decryption').innerText = value)
      )
      console.log(response)
    }
  })

  // encrypt with Lit and write to ceramic

  document.getElementById('encryptLit')?.addEventListener('click', function () {
    console.log('chain in litCeramicIntegration: ', litCeramicIntegration.chain)
    // @ts-ignore
    const stringToEncrypt = document.getElementById('secret').value
    // User must posess at least 0.000001 ETH on eth
    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: '1000000000000',
        },
      },
    ]
    const response = litCeramicIntegration
      .encryptAndWrite(stringToEncrypt, accessControlConditions)
      .then((value : any) => updateStreamID(value))
    console.log(response)

    // const evmContractConditions = [
    //   {
    //     contractAddress: '0xb71a679cfff330591d556c4b9f21c7739ca9590c',
    //     functionName: 'members',
    //     functionParams: [':userAddress'],
    //     functionAbi: {
    //       constant: true,
    //       inputs: [
    //         {
    //           name: '',
    //           type: 'address',
    //         },
    //       ],
    //       name: 'members',
    //       outputs: [
    //         {
    //           name: 'delegateKey',
    //           type: 'address',
    //         },
    //         {
    //           name: 'shares',
    //           type: 'uint256',
    //         },
    //         {
    //           name: 'loot',
    //           type: 'uint256',
    //         },
    //         {
    //           name: 'exists',
    //           type: 'bool',
    //         },
    //         {
    //           name: 'highestIndexYesVote',
    //           type: 'uint256',
    //         },
    //         {
    //           name: 'jailed',
    //           type: 'uint256',
    //         },
    //       ],
    //       payable: false,
    //       stateMutability: 'view',
    //       type: 'function',
    //     },
    //     chain: 'xdai',
    //     returnValueTest: {
    //       key: 'shares',
    //       comparator: '>=',
    //       value: '1',
    //     },
    //   },
    // ]

    // const response = litCeramicIntegration
    //   .encryptAndWrite(stringToEncrypt, evmContractConditions, 'evmContractConditions')
    //   .then((value) => updateStreamID(value))
    // console.log(response)
  })

  return (
    <div className={styles.container}>
    <header>
      <div className="row">
        <div className="col-xs-12 alert hide" role="alert" id="alerts"></div>
        <div className="col-xs-offset-10 col-xs-2">
          <span className="badge rounded-pill bg-secondary" id="userDID">Not Connected</span>
        </div>
      </div>
      <div>
        <img id="logo" src="images/lit-logo.png" alt="lit ceramic playground" className='h-100 w-100' />
        +
        <img id="logo" src="images/web-playground-logo.svg" alt="web playground logo" className='h-100 w-100' />
      </div>
      <h1>Lit / Ceramic Web Playground</h1>
      <p>
        Test out the Lit / Ceramic integration.
        <br />
        Encrypt with Lit and commit to the Ceramic network
        <br />
        then read from it back using ceramic and decrypt with Lit.
      </p>
      <form>
        <br />
        <label htmlFor="fname">Secret:</label>
        <input type="text" id="secret" name="secret" value="Type Secret Here!" /><br />
      </form>
    </header>

    <main className={styles.main}>
      <div className="row">
        <div className="col-xs-12 space-around">
          <br />
          <br />
          <div id="stream"></div>
        </div>
        <div className="col-xs-12 col-lg-6">
          <iframe
            className="documentation"
            src="https://developers.ceramic.network/build/javascript/quick-start/"
            id="ceramic_docs"
          >
          </iframe>
        </div>
        <div className="col-xs-12 col-lg-6 text-right">
          <iframe
            className="documentation"
            src="https://developers.idx.xyz/build/quick-start/"
            id="idx_docs"
          ></iframe>
        </div>
      </div>

      <div id="encryptLit">
        <button
          id="encryptLit"
          type="button"
          className="btn btn-primary center"
        >
          Encrypt w/ Lit + Send
        </button>
      </div>

      <div id="readCeramic">
        <button
          id="readCeramic"
          type="button"
          className="btn btn-primary center"
        >
          Read then Decrypt w/ Lit
        </button>
      </div>
      <div id="decryption"></div>
    </main>
  </div>
  )
}

export default Storeonceramic