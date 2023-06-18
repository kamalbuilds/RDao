import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { RiFilePaper2Line } from "react-icons/ri";
import lighthouse from "@lighthouse-web3/sdk";
import { Button } from "@chakra-ui/react";
import Link from "next/link";

const ResearchPaperBox = ({ fileName , publicKey , cid } : { fileName: string; publicKey: string; cid: string }) => (
  <Box
    borderWidth={1}
    borderRadius="md"
    p={4}
    boxShadow="sm"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
  >
    <RiFilePaper2Line size={24} />
    <Text fontSize="lg" fontWeight="bold" mt={2} mb={1}>
      {fileName}
    </Text>
    <Text fontSize="sm" color="gray.500">
      Uploaded by: {publicKey}
    </Text>
    <Text fontSize="sm" color="gray.500">
      CID: {cid}
    </Text>
    <div className="flex justify-center items-center">
      <Link href= {`https://gateway.lighthouse.storage/ipfs/${cid}`}>
          <Button mx={4} mt={4} p-4>
            View
          </Button>
      </Link>
      <Button mx={4} mt={4}>
        Make it Public
      </Button>
      <Button mx={4} mt={4}>
        Fund this Paper
      </Button>
    </div>
    {/* Add more details here if needed */}
  </Box>
);

const Allpaper = () => {
  const { address } = useAccount();
  const [uploads, setUploads] = useState<any>({ data: { fileList: [] } });

  const getResearchPapers = async () => {
    const uploads = await lighthouse.getUploads(address as string);
    setUploads(uploads);
  };

  useEffect(() => {
    getResearchPapers();
  }, []);

  return (
    <Box p={4}>
      <SimpleGrid columns={3} spacing={4}>
        {uploads?.data.fileList.map((file: any) => (
          <ResearchPaperBox
            key={file.id}
            fileName={file.fileName}
            publicKey={file.publicKey}
            cid={file.cid}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Allpaper;
