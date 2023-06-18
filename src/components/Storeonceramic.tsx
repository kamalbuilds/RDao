// @ts-nocheck
import { useEffect, useState } from 'react';
import { DID } from 'dids';
// @ts-ignore
import { Integration } from 'lit-ceramic-sdk';
// import styles from "../styles/storeonceramic.module.css";
import litlogo from "../asset/lit-logo.png";
import ceramiclogo from "../asset/web-playground-logo.svg";
import Image from 'next/image';

const Storeonceramic = () => {
  const [streamID, setStreamID] = useState(''); // test data
  const [decryption, setDecryption] = useState('');
  const [stringToEncrypt, setStringToEncrypt] = useState('Upload on Ceramic');
  const [litCeramicIntegration,setLitCeramicIntegration] = useState();


  useEffect(() => {
    // if (typeof window !== 'undefined' || typeof document !== 'undefined') {
    //   console.log('DOMContent.........');
    //   let litCeramicIntegration = new Integration('https://ceramic-clay.3boxlabs.com', 'polygon');
    //   setLitCeramicIntegration(litCeramicIntegration);
    //   litCeramicIntegration.startLitClient(window);
    // }
  }, []);
  console.log(litCeramicIntegration,"hello");

  const updateAlert = (status: string, message: string) => {
    // Update the alert state or display it using a toast/notification library
  };

  const handleSecretChange = (event : any) => {
    setStringToEncrypt(event.target.value);
  };

  const updateStreamID = (resp: string | String) => {
    setStreamID(resp as string);
    console.log('you now have this as your streamID', streamID);
  };

  const readCeramic = () => {
    // if (typeof document !== 'undefined' && document.getElementById('stream') === null) {
    //   updateAlert('danger', 'Error, please write to ceramic first so a stream can be read');
    // } else if (litCeramicIntegration) {
    //   console.log('this is the streamID you\'re sending: ', streamID);
    //   litCeramicIntegration.readAndDecrypt(streamID).then((value: any) => {
    //     setDecryption(value);
    //   });
    // }
  };

  const encryptLit = () => {
    console.log('chain in litCeramicIntegration: ', litCeramicIntegration.chain);
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
    ];
    
    // litCeramicIntegration.encryptAndWrite(stringToEncrypt, accessControlConditions)
    //   .then((value: any) => {
    //     updateStreamID(value);
    //   });
  };

  return (
    <div className="flex justify-center items-center h-screen">
    <div className="container mx-auto p-4">
      <header>
        <div className="flex justify-between items-center mb-4">
          <div className="alert hide" role="alert" id="alerts"></div>
          <div>
            <span className="badge rounded-pill bg-secondary" id="userDID">Not Connected</span>
          </div>
        </div>
        <div className="flex items-center mb-4">
          <Image src={litlogo} alt="lit ceramic" className="h-12 w-12" />
          <span className="mx-2">+</span>
          <Image src={ceramiclogo} alt="lit ceramic" className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold">Store encrypted data</h1>
        <p className="text-lg">
          Encrypt your Research Paper using Lit PKP and store on Ceramic.
          <br />
          Encrypt with Lit and commit to the Ceramic network
          <br />
          then read from it back using ceramic and decrypt with Lit.
        </p>
        <form>
          <div className="my-4">
            <label htmlFor="secret">Research File:</label>
            <input
              type="text"
              id="secret"
              name="secret"
              value={stringToEncrypt}
              onChange={handleSecretChange}
              className="border border-gray-400 px-2 py-1"
            />
          </div>
        </form>
      </header>

      <main>
        <div className="my-4">
          <div id="stream">{streamID}</div>
        </div>

        <div id="encryptLit">
          <button
            id="encryptLit"
            type="button"
            className="btn btn-primary"
            onClick={encryptLit}
          >
            Encrypt w/ Lit + Send
          </button>
        </div>

        <div id="readCeramic">
          <button
            id="readCeramic"
            type="button"
            className="btn btn-primary"
            onClick={readCeramic}
          >
            Read then Decrypt w/ Lit
          </button>
        </div>
        <div id="decryption">{decryption}</div>
      </main>
    </div>
    </div>
  );
};


export default Storeonceramic;
