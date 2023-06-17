// @ts-nocheck
import { useEffect, useState } from 'react';
import { DID } from 'dids';
// @ts-ignore
import { Integration } from 'lit-ceramic-sdk';
import styles from "../styles/storeonceramic.module.css";

const Storeonceramic = () => {
  const [streamID, setStreamID] = useState('kjzl6cwe1jw1479rnblkk5u43ivxkuo29i4efdx1e7hk94qrhjl0d4u0dyys1au'); // test data
  const [decryption, setDecryption] = useState('');
  const [stringToEncrypt, setStringToEncrypt] = useState('Type Secret Here!');
  const [litCeramicIntegration,setLitCeramicIntegration] = useState();


  useEffect(() => {
    if (typeof window !== 'undefined' || typeof document !== 'undefined') {
      console.log('DOMContent.........');
      let litCeramicIntegration = new Integration('https://ceramic-clay.3boxlabs.com', 'polygon');
      setLitCeramicIntegration(litCeramicIntegration);
      litCeramicIntegration.startLitClient(window);
    }
  }, []);

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
    if (document.getElementById('stream') === null) {
      updateAlert('danger', 'Error, please write to ceramic first so a stream can be read');
    } else {
      console.log('this is the streamID youre sending: ', streamID);
      litCeramicIntegration.readAndDecrypt(streamID).then((value: any) => {
        setDecryption(value);
      });
    }
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
    
    litCeramicIntegration.encryptAndWrite(stringToEncrypt, accessControlConditions)
      .then((value: any) => {
        updateStreamID(value);
      });
  };

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
            <input
              type="text"
              id="secret"
              name="secret"
              value={stringToEncrypt}
              onChange={handleSecretChange}
            />
        </form>
      </header>

      <main className={styles.main}>
        <div className="row">
          <div className="col-xs-12 space-around">
            <br />
            <br />
            <div id="stream">{streamID}</div>
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
            onClick={encryptLit}
          >
            Encrypt w/ Lit + Send
          </button>
        </div>

        <div id="readCeramic">
          <button
            id="readCeramic"
            type="button"
            className="btn btn-primary center"
            onClick={readCeramic}
          >
            Read then Decrypt w/ Lit
          </button>
        </div>
        <div id="decryption">{decryption}</div>
      </main>
    </div>
  );
};

export default Storeonceramic;
