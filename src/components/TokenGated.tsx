import { useState } from "react";
import axios from "axios";
import { Input, Select, Button, Box} from "@chakra-ui/react";
const tokenTypes = ["ERC20", "ERC721", "ERC1155", "SPL", "BEP20"];
const chains = ["ETHEREUM", "COSMOS", "SOLANA", "TEZOS", "BSC"];
const add = "0x4d224452801ACEd8B2F0aebE155379bb5D594381";
import { useToast } from "@chakra-ui/react";

export default function TokenGated() {
  const [roomId, setRoomId] = useState("");
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [tokenType, setTokenType] = useState("ERC20");
  const [chain, setChain] = useState("ETHEREUM");
  const [contractAddress, setContractAddress] = useState("0x4d224452801ACEd8B2F0aebE155379bb5D594381");
  console.log(title,tokenType,chain,contractAddress,"title,tokenType,chain,contractAddress");
  const handleSubmit = async (e : any) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://iriko.testing.huddle01.com/api/v1/create-room",
        {
            title: title,
            roomLock: true,
            "tokenType": tokenType,
            "chain": chain,
            "contractAddress": [contractAddress]
        },
        {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.NEXT_PUBLIC_HUDDLE_API_KEY,
            },
        }
      );
      toast ({
        title: "Token Gated Room Created Successfully",
        description: "RoomId: "+response.data.data.roomId,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      // Handle the response here
      setRoomId(response.data.data.roomId);
      console.log(response.data.data.roomId);
    } catch (error) {
      // Handle any errors here
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Box
        maxW="lg"
        p="8"
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="lg"
      >
    <h2 className="text-center text-cyan-300">Conditional TokenGated Room </h2>
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title:</label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="tokenType">Token Type:</label>
        <Select
          id="tokenType"
          value={tokenType}
          onChange={(e) => setTokenType(e.target.value)}
        >
          {tokenTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="chain">Chain:</label>
        <Select
          id="chain"
          value={chain}
          onChange={(e) => setChain(e.target.value)}
        >
          {chains.map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="contractAddress">Token Address: </label>
        <Input
          type="text"
          id="contractAddress"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
      </div>
      <div className="flex justify-center my-4">
      <Button type="submit">Create Tokengated Room</Button>
      <Button onClick={() => window.open(`/room/${roomId}`)} className="mx-4">Join Tokengated Room</Button>
      </div>
    </form>
    </Box>
    </div>
  );
}
