// @ts-nocheck
import * as LitJsSdk_accessControlConditions from "@lit-protocol/access-control-conditions";
import * as LitJsSdk_blsSdk from "@lit-protocol/bls-sdk";
import * as LitJsSdk_authHelpers from "@lit-protocol/auth-helpers";
import * as LitJsSdk_types from "@lit-protocol/types";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { AccsDefaultParams, AuthSig, AuthCallback } from "@lit-protocol/types";
import { Button , ButtonGroup } from "@chakra-ui/react";
import { GoogleLogin } from "@react-oauth/google";
import { ethers, utils } from "ethers";
import { computeAddress } from "ethers/lib/utils";
import { useState } from "react";

type CredentialResponse = any;

declare global {
	interface Window {
		cbor: any;
	}
}

const RELAY_API_URL = process.env.NEXT_PUBLIC_RELAY_API_URL || "http://localhost:3001";

function Oauthgoogle() {
	const [registeredPkpEthAddress, setRegisteredPkpEthAddress] = useState<
		string
	>("");
	const [
		googleCredentialResponse,
		setGoogleCredentialResponse,
	] = useState<CredentialResponse | null>(null);
	const [registeredPkpPublicKey, setRegisteredPkpPublicKey] = useState<
		string
	>("");
	const [
		authenticatedPkpEthAddress,
		setAuthenticatedPkpEthAddress,
	] = useState<string>("");
	const [authenticatedPkpPublicKey, setAuthenticatedPkpPublicKey] = useState<
		string
	>("");
	const [status, setStatus] = useState("");
	const [selectedAuthMethod, setSelectedAuthMethod] = useState(6);
	const [encryptedSymmetricKey, setEncryptedSymmetricKey] = useState<
		Uint8Array
	>(new Uint8Array());
	const [encryptedString, setEncryptedString] = useState<Blob | null>(null);

	console.log("STATE", {
		authenticatedPkpPublicKey,
		authenticatedPkpEthAddress,
	});

	const handleLoggedInToGoogle = async (
		credentialResponse: CredentialResponse
	) => {
		setStatus("Logged in to Google");
		console.log("Got response from google sign in: ", {
			credentialResponse,
		});
		setGoogleCredentialResponse(credentialResponse);
	};

	return (
		<div className="Oauthgoogle">
			<div style={{ height: 80 }} />
			<h1>Sign up with Google to get your PKP !</h1>
			<div style={{ height: 24 }} />
			<h3>Choose an authentication method to begin:</h3>
			<ButtonGroup variant="outlined">
				<Button
					variant={
						selectedAuthMethod === 6 ? "contained" : "outlined"
					}
					onClick={() => setSelectedAuthMethod(6)}
				>
					Google
				</Button>
				<Button
					variant={
						selectedAuthMethod === 3 ? "contained" : "outlined"
					}
					onClick={() => setSelectedAuthMethod(3)}
				>
					WebAuthn
				</Button>
			</ButtonGroup>
			<div style={{ height: 24 }} />
			<h1>{status}</h1>
			<div style={{ height: 24 }} />
			{selectedAuthMethod === 6 && (
				<>
					<h3>Step 1: Log in with Google.</h3>
					<GoogleLogin
						onSuccess={handleLoggedInToGoogle}
						onError={() => {
							console.log("Login Failed");
						}}
						useOneTap
					/>
					{googleCredentialResponse && (
						<div>
							<b>Google Credential Response: </b>
							{JSON.stringify(googleCredentialResponse)}
						</div>
					)}
					<h3>Step 2: Use Google Credential to Mint PKP.</h3>
					<Button
						onClick={() =>
							handleMintPkpUsingGoogleAuth(
								googleCredentialResponse,
								setStatus,
								({ pkpEthAddress, pkpPublicKey }) => {
									setRegisteredPkpEthAddress(pkpEthAddress);
									setRegisteredPkpPublicKey(pkpPublicKey);
								}
							)
						}
					>
						Mint PKP
					</Button>
					{registeredPkpEthAddress && (
						<div>
							Registered PKP Eth Address:{" "}
							{registeredPkpEthAddress}
						</div>
					)}
					<h3>
						Step 3: Generate auth sigs from Lit Nodes, then generate
						session sigs for storing an encryption condition.
					</h3>
					<Button
						variant="contained"
						onClick={async () => {
							const {
								encryptedString,
								encryptedSymmetricKey,
								authenticatedPkpPublicKey,
							} = await handleStoreEncryptionConditionNodes(
								setStatus,
								googleCredentialResponse
							);
							setEncryptedString(encryptedString);
							setEncryptedSymmetricKey(encryptedSymmetricKey);
							setAuthenticatedPkpPublicKey(
								authenticatedPkpPublicKey
							);
							setAuthenticatedPkpEthAddress(
								publicKeyToAddress(authenticatedPkpPublicKey)
							);
						}}
					>
						Authenticate + Encrypt with Lit
					</Button>
					{authenticatedPkpEthAddress && (
						<div>
							Authenticated PKP Eth Address:{" "}
							{authenticatedPkpEthAddress}
						</div>
					)}
					<h3>
						Step 4: Retrieve the decrypted symmetric key from Lit
						Nodes.
					</h3>
					<Button
						variant="contained"
						onClick={async () => {
							await handleRetrieveSymmetricKeyNodes(
								setStatus,
								encryptedSymmetricKey,
								encryptedString!,
								googleCredentialResponse,
								authenticatedPkpEthAddress
							);
						}}
					>
						Decrypt
					</Button>
				</>
			)}
		</div>
	);
}

export default Oauthgoogle;

const handleMintPkpUsingGoogleAuth = async (
	credentialResponse: CredentialResponse,
	setStatusFn: (status: string) => void,
	onSuccess: ({
		pkpEthAddress,
		pkpPublicKey,
	}: {
		pkpEthAddress: string;
		pkpPublicKey: string;
	}) => void
) => {
	setStatusFn("Minting PKP...");
	const requestId = await mintPkpUsingRelayerGoogleAuthVerificationEndpoint(
		credentialResponse,
		setStatusFn
	);
	return pollRequestUntilTerminalState(requestId, setStatusFn, onSuccess);
};

async function getLitNodeClient(): Promise<LitJsSdk.LitNodeClient> {
	const litNodeClient = new LitJsSdk.LitNodeClient({
		litNetwork: "serrano",
	});
	await litNodeClient.connect();

	return litNodeClient;
}

async function handleExecuteJs(
	setStatusFn: (status: string) => void,
	authSig: AuthSig,
	pkpPublicKey: string
): Promise<string> {
	setStatusFn("Executing JS...");
	const litActionCode = `
const go = async () => {
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the response from the node
  // and combined into a full signature by the LitJsSdk for you to use on the client
  // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
};

go();
`;
	const litNodeClient = await getLitNodeClient();

	const results = await litNodeClient.executeJs({
		code: litActionCode,
		authSig,
		// all jsParams can be used anywhere in your litActionCode
		jsParams: {
			// this is the string "Hello World" for testing
			toSign: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100],
			publicKey: `0x${pkpPublicKey}`,
			sigName: "sig1",
		},
	});
	console.log("results: ", results);

	return results.signatures["sig1"].signature;
}

async function mintPkpUsingRelayerGoogleAuthVerificationEndpoint(
	credentialResponse: any,
	setStatusFn: (status: string) => void
) {
	setStatusFn("Minting PKP with relayer...");

	const mintRes = await fetch(`${RELAY_API_URL}/auth/google`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"api-key": "1234567890",
		},
		body: JSON.stringify({
			idToken: credentialResponse.credential,
		}),
	});

	if (mintRes.status < 200 || mintRes.status >= 400) {
		console.warn("Something wrong with the API call", await mintRes.json());
		setStatusFn("Uh oh, something's not quite right.");
		return null;
	} else {
		const resBody = await mintRes.json();
		console.log("Response OK", { body: resBody });
		setStatusFn("Successfully initiated minting PKP with relayer.");
		return resBody.requestId;
	}
}

async function pollRequestUntilTerminalState(
	requestId: string,
	setStatusFn: (status: string) => void,
	onSuccess: ({
		pkpEthAddress,
		pkpPublicKey,
	}: {
		pkpEthAddress: string;
		pkpPublicKey: string;
	}) => void
) {
	if (!requestId) {
		return;
	}

	const maxPollCount = 20;
	for (let i = 0; i < maxPollCount; i++) {
		setStatusFn(`Waiting for auth completion (poll #${i + 1})`);
		const getAuthStatusRes = await fetch(
			`${RELAY_API_URL}/auth/status/${requestId}`,
			{
				headers: {
					"api-key": "1234567890",
				},
			}
		);

		if (getAuthStatusRes.status < 200 || getAuthStatusRes.status >= 400) {
			console.warn(
				"Something wrong with the API call",
				await getAuthStatusRes.json()
			);
			setStatusFn("Uh oh, something's not quite right.");
			return;
		}

		const resBody = await getAuthStatusRes.json();
		console.log("Response OK", { body: resBody });

		if (resBody.error) {
			// exit loop since error
			console.warn("Something wrong with the API call", {
				error: resBody.error,
			});
			setStatusFn("Uh oh, something's not quite right.");
			return;
		} else if (resBody.status === "Succeeded") {
			// exit loop since success
			console.info("Successfully authed", { ...resBody });
			setStatusFn("Successfully authed and minted PKP!");
			onSuccess({
				pkpEthAddress: resBody.pkpEthAddress,
				pkpPublicKey: resBody.pkpPublicKey,
			});
			return;
		}

		// otherwise, sleep then continue polling
		await new Promise(r => setTimeout(r, 15000));
	}

	// at this point, polling ended and still no success, set failure status
	setStatusFn(`Hmm this is taking longer than expected...`);
}

async function handleStoreEncryptionConditionNodes(
	setStatusFn: (status: string) => void,
	googleCredentialResponse: any
): Promise<{
	encryptedSymmetricKey: Uint8Array;
	encryptedString: Blob;
	authenticatedPkpPublicKey: string;
}> {
	setStatusFn("Storing encryption condition with the network...");

	// get the user a session with it
	const litNodeClient = await getLitNodeClient();

	const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
		"this is a secret message"
	);

	// key parameter - encrypt symmetric key then hash it
	const encryptedSymmetricKey = LitJsSdk_blsSdk.wasmBlsSdkHelpers.encrypt(
		LitJsSdk.uint8arrayFromString(litNodeClient.subnetPubKey, "base16"),
		symmetricKey
	);

	// get the session sigs
	const { sessionSigs, authenticatedPkpPublicKey } = await getSessionSigs(
		litNodeClient,
		encryptedSymmetricKey,
		litNodeClient.generateAuthMethodForGoogleJWT(
			googleCredentialResponse.credential
		)
	);

	const pkpEthAddress = publicKeyToAddress(authenticatedPkpPublicKey);

	const unifiedAccessControlConditions = getUnifiedAccessControlConditions(
		pkpEthAddress
	);
	console.log(
		"unifiedAccessControlConditions: ",
		unifiedAccessControlConditions
	);

	// store the decryption conditions
	await litNodeClient.saveEncryptionKey({
		unifiedAccessControlConditions,
		symmetricKey,
		encryptedSymmetricKey,
		sessionSigs, // Not actually needed for storing encryption condition.
		chain: "ethereum",
	});

	console.log("encryptedSymmetricKey: ", encryptedSymmetricKey);

	return {
		encryptedSymmetricKey,
		encryptedString,
		authenticatedPkpPublicKey,
	};
}

async function getSessionSigs(
	litNodeClient: LitJsSdk.LitNodeClient,
	encryptedSymmetricKey: Uint8Array,
	authMethod: LitJsSdk_types.AuthMethod
): Promise<{
	sessionSigs: LitJsSdk_types.SessionSigsMap;
	authenticatedPkpPublicKey: string;
}> {
	let authenticatedPkpPublicKey: string;

	// this will be fired if auth is needed. we can use this to prompt the user to sign in
	const authNeededCallback: AuthCallback = async ({
		resources,
		expiration,
		statement,
	}) => {
		console.log("authNeededCallback fired");

		// Generate authMethod.
		const authMethods = [authMethod];

		// Get AuthSig
		const { authSig, pkpPublicKey } = await litNodeClient.signSessionKey({
			authMethods,
			statement,
			expiration:
				expiration ||
				new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
			resources: resources || [],
		});
		console.log("got session sig from node and PKP: ", {
			authSig,
			pkpPublicKey,
		});

		authenticatedPkpPublicKey = pkpPublicKey;

		return authSig;
	};

	const hashedEncryptedSymmetricKeyStr = await hashBytes({
		bytes: new Uint8Array(encryptedSymmetricKey),
	});

	// Construct the LitResource
	const litResource = new LitJsSdk_authHelpers.LitAccessControlConditionResource(
		hashedEncryptedSymmetricKeyStr
	);

	// Get the session sigs
	const sessionSigs = await litNodeClient.getSessionSigs({
		expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
		chain: "ethereum",
		resourceAbilityRequests: [
			{
				resource: litResource,
				ability:
					LitJsSdk_authHelpers.LitAbility
						.AccessControlConditionDecryption,
			},
		],
		switchChain: false,
		authNeededCallback,
	});
	console.log("sessionSigs: ", sessionSigs);
	console.log("authenticatedPkpPublicKey: ", authenticatedPkpPublicKey!);

	return {
		sessionSigs,
		authenticatedPkpPublicKey: authenticatedPkpPublicKey!,
	};
}

// TODO: use when system migrates to reading from chain for access control conditions
async function handleStoreEncryptionConditionRelay(
	setStatusFn: (status: string) => void,
	pkpEthAddress: string
) {
	setStatusFn("Storing encryption condition...");

	// get the user a session with it
	const litNodeClient = await getLitNodeClient();

	const { encryptedZip, symmetricKey } = await LitJsSdk.zipAndEncryptString(
		"this is a secret message"
	);

	// get the ACCs
	const unifiedAccessControlConditions = getUnifiedAccessControlConditions(
		pkpEthAddress
	);

	// value parameter - hash unified conditions
	const hashedAccessControlConditions = await LitJsSdk_accessControlConditions.hashUnifiedAccessControlConditions(
		unifiedAccessControlConditions
	);
	console.log("hashedAccessControlConditions", {
		hashedAccessControlConditions,
	});
	const hashedAccessControlConditionsStr = LitJsSdk.uint8arrayToString(
		new Uint8Array(hashedAccessControlConditions),
		"base16"
	);

	// key parameter - encrypt symmetric key then hash it
	const encryptedSymmetricKey = LitJsSdk_blsSdk.wasmBlsSdkHelpers.encrypt(
		LitJsSdk.uint8arrayFromString(litNodeClient.subnetPubKey, "base16"),
		symmetricKey
	);
	const hashedEncryptedSymmetricKeyStr = await hashBytes({
		bytes: new Uint8Array(encryptedSymmetricKey),
	});

	// securityHash parameter - encrypt symmetric key, concat with creator address
	const pkpEthAddressBytes = utils.arrayify(pkpEthAddress);
	const securityHashPreimage = new Uint8Array([
		...encryptedSymmetricKey,
		...pkpEthAddressBytes,
	]);

	const securityHashStr = await hashBytes({
		bytes: securityHashPreimage,
	});

	console.log("Storing encryption condition with relay", {
		hashedEncryptedSymmetricKeyStr,
		hashedAccessControlConditionsStr,
		securityHashStr,
	});

	// call centralized conditions relayer to write encryption conditions to chain.
	const storeRes = await fetch(`${RELAY_API_URL}/store-condition`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"api-key": "1234567890",
		},
		body: JSON.stringify({
			key: hashedEncryptedSymmetricKeyStr,
			value: hashedAccessControlConditionsStr,
			securityHash: securityHashStr,
			chainId: "1",
			permanent: false,
			capabilityProtocolPrefix: "litEncryptionCondition",
		}),
	});

	if (storeRes.status < 200 || storeRes.status >= 400) {
		console.warn(
			"Something wrong with the API call",
			await storeRes.json()
		);
		setStatusFn("Uh oh, something's not quite right");
	} else {
		setStatusFn("Successfully stored encryption condition with relayer!");
	}
}

async function handleRetrieveSymmetricKeyNodes(
	setStatusFn: (status: string) => void,
	encryptedSymmetricKey: Uint8Array,
	encryptedString: Blob,
	googleCredentialResponse: any,
	pkpEthAddress: string
) {
	setStatusFn("Retrieving symmetric key...");
	const litNodeClient = await getLitNodeClient();

	// get the session sigs
	const { sessionSigs } = await getSessionSigs(
		litNodeClient,
		encryptedSymmetricKey,
		litNodeClient.generateAuthMethodForGoogleJWT(
			googleCredentialResponse.credential
		)
	);

	// get the ACC
	const unifiedAccessControlConditions = getUnifiedAccessControlConditions(
		pkpEthAddress
	);
	console.log(
		"unifiedAccessControlConditions: ",
		unifiedAccessControlConditions
	);

	const retrievedSymmKey = await litNodeClient.getEncryptionKey({
		unifiedAccessControlConditions,
		toDecrypt: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"),
		sessionSigs,
	});

	const decryptedString = await LitJsSdk.decryptString(
		encryptedString,
		retrievedSymmKey
	);
	console.log("decrypted string", decryptedString);
}

function publicKeyToAddress(publicKey: string) {
	return computeAddress(`0x${publicKey}`);
}

async function hashBytes({ bytes }: { bytes: Uint8Array }): Promise<string> {
	const hashOfBytes = await crypto.subtle.digest("SHA-256", bytes);
	const hashOfBytesStr = LitJsSdk.uint8arrayToString(
		new Uint8Array(hashOfBytes),
		"base16"
	);
	return hashOfBytesStr;
}

// async function handleEncryptThenDecrypt(
// 	setStatusFn,
// 	googleCredentialResponse,
// 	pkpEthAddress,
// 	pkpPublicKey
// ) {
// 	setStatusFn("Encrypting then decrypting...");
// 	var unifiedAccessControlConditions = [
// 		{
// 			conditionType: "evmBasic",
// 			contractAddress: "",
// 			standardContractType: "",
// 			chain: "mumbai",
// 			method: "",
// 			parameters: [":userAddress"],
// 			returnValueTest: {
// 				comparator: "=",
// 				value: pkpEthAddress,
// 			},
// 		},
// 	];

// 	// this will be fired if auth is needed. we can use this to prompt the user to sign in
// 	const authNeededCallback = async ({
// 		chain,
// 		resources,
// 		expiration,
// 		uri,
// 		litNodeClient,
// 	}) => {
// 		console.log("authNeededCallback fired");
// 		const sessionSig = await litNodeClient.signSessionKey({
// 			sessionKey: uri,
// 			authMethods: [
// 				{
// 					authMethodType: 6,
// 					accessToken: googleCredentialResponse.credential,
// 				},
// 			],
// 			pkpPublicKey,
// 			expiration,
// 			resources,
// 			chain,
// 		});
// 		console.log("got session sig from node and PKP: ", sessionSig);
// 		return sessionSig;
// 	};

// 	// get the user a session with it
// const litNodeClient = await getLitNodeClient();

// 	const sessionSigs = await litNodeClient.getSessionSigs({
// 		expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
// 		chain: "ethereum",
// 		resources: [`litEncryptionCondition://*`],
// 		switchChain: false,
// 		authNeededCallback,
// 	});
// 	console.log("sessionSigs before saving encryption key: ", sessionSigs);

// 	const { encryptedZip, symmetricKey } = await LitJsSdk.zipAndEncryptString(
// 		"this is a secret message"
// 	);

// 	const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
// 		unifiedAccessControlConditions,
// 		symmetricKey,
// 		sessionSigs,
// 	});

// 	const hashOfKey = await LitJsSdk.hashEncryptionKey({
// 		encryptedSymmetricKey,
// 	});

// 	console.log("encrypted symmetric key", encryptedSymmetricKey);

// 	const retrievedSymmKey = await litNodeClient.getEncryptionKey({
// 		unifiedAccessControlConditions,
// 		toDecrypt: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"),
// 		sessionSigs,
// 	});

// 	const decryptedFiles = await LitJsSdk.decryptZip(
// 		encryptedZip,
// 		retrievedSymmKey
// 	);
// 	const decryptedString = await decryptedFiles["string.txt"].async("text");
// 	console.log("decrypted string", decryptedString);

// 	setStatusFn("Success!");
// }

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545";


function getUnifiedAccessControlConditions(
	pkpEthAddress?: string
): AccsDefaultParams[] {
	return [
		{
			conditionType: "evmBasic",
			contractAddress: "",
			standardContractType: "",
			chain: "mumbai",
			method: "",
			parameters: [":userAddress"],
			returnValueTest: {
				comparator: "=",
				value:
					pkpEthAddress ||
					"0x3c3CA2BFFfffE532aed2923A34D6c1F9307F8076",
			},
		},
	];
}
