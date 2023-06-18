// @ts-nocheck
import ResearchersList from '../components/researcher/ResearcherList';
import ResearchersModal from '../components/researcher/ResearcherModal';
import { Button } from '@chakra-ui/react';
import { useState , useEffect } from 'react';
import rrabi from '../abis/RRDao.json';
import { ethers } from 'ethers';
import { Box , Text } from '@chakra-ui/react';
import { RiFilePaper2Line } from 'react-icons/ri';
import Link from 'next/link';
import apeabi from '../abis/Ape.json';
import { useAccount } from 'wagmi';
import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import { Modal , ModalOverlay , ModalBody , ModalContent, ModalHeader , ModalCloseButton , ModalFooter } from '@chakra-ui/react';
const ResearchersPage = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const daocontractAddress = '0x8d72887163f8bD8A65649Ef4af37dcc21500e5A1';
  const apetokenAddress = '0x3ba884DbC5ab4a74F6e8a736Da81840Aec36b426';
  const { address } = useAccount();
  // @ts-ignore
  const provider = typeof window !== 'undefined' ? new ethers.providers.Web3Provider(window.ethereum) : null;

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openFundModal = () => {
    setIsFundModalOpen(true);
  };
  
  const closeFundModal = () => {
    setIsFundModalOpen(false);
  };
  
  const [papers, setPapers] = useState([]);

  const handlefund = async () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const walletAddress = accounts[0]    // first account in MetaMask
    const signer = provider.getSigner(walletAddress);
    const contract = new ethers.Contract(apetokenAddress, apeabi, signer);
    const transaction = await contract.transfer(recipientAddress, fundAmount); 
  }
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const contract = new ethers.Contract(daocontractAddress, rrabi, provider);
        const paperCount = await contract.paperCount();
  
        const papers = [];
  
        for (let i = 1; i <= paperCount; i++) {
          const paper = await contract.papers(i);
          papers.push(paper);
        }
  
        setPapers(papers);
      } catch (error) {
        console.error('Error fetching papers:', error);
      }
    };
  
    if (provider) {
      fetchPapers();
    }
  }, [provider]);
  console.log(papers);
  return (
    <div>
      <h1 className='text-center text-indigo-400 font-semibold text-2xl'>RR DataDao Marketplace</h1>
      <h1>ResearchPapers</h1>
        {papers.map((paper) => (
          <Box
            key={paper.title}
            borderWidth={1}
            borderRadius='md'
            p={4}
            boxShadow='sm'
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            textAlign='center'
          >
            <RiFilePaper2Line size={24} />
            <Text fontSize='lg' fontWeight='bold' mt={2} mb={1}>
              {paper.title}
            </Text>
            <Text fontSize='sm' color='gray.500'>
              Uploaded by: {paper.author}
            </Text>
            <Text fontSize='sm' color='gray.500'>
              Funding: {JSON.stringify(paper.funding)}
            </Text>
            <div className='flex justify-center items-center'>
              <Link href={'/funding'}>
                <Button mx={4} mt={4} p={4} onClick={openFundModal}>
                  Fund
                </Button>
                {isFundModalOpen && (
                    <Modal isOpen={isFundModalOpen} onClose={closeFundModal}>
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader>Fund Research</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                          <FormControl>
                            <FormLabel>Amount</FormLabel>
                            <Input
                              type="text"
                              placeholder="Enter amount"
                              value={fundAmount}
                              onChange={(e) => setFundAmount(e.target.value)}
                            />
                          </FormControl>
                          <FormControl mt={4}>
                            <FormLabel>Recipient Address</FormLabel>
                            <Input
                              type="text"
                              placeholder="Enter recipient address"
                              value={recipientAddress}
                              onChange={(e) => setRecipientAddress(e.target.value)}
                            />
                          </FormControl>
                        </ModalBody>
                        <ModalFooter>
                          <Button colorScheme="blue" onClick={handlefund}>
                            Fund
                          </Button>
                          <Button ml={2} onClick={closeFundModal}>
                            Cancel
                          </Button>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>
)}
              </Link>
              <Button mx={4} mt={4}>
                View
              </Button>
            </div>
          </Box>
      ))}
      <br />
      <ResearchersList />
      <ResearchersModal isOpen={isModalOpen} onClose={closeModal} />
      <Button onClick={openModal}>Add Researcher</Button>
    </div>
  );
};

export default ResearchersPage;
