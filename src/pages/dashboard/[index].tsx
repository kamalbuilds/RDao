import React, { useRef, useState } from "react";
import { useEventListener, useHuddle01 } from "@huddle01/react";
import { Audio, Video } from "@huddle01/react/components";
import { Box, Flex, HStack, Link, Stack, useColorMode, useColorModeValue, useDisclosure, Avatar, Menu, MenuButton, MenuList, MenuDivider, MenuItem, Center } from '@chakra-ui/react';
import { useEffect } from "react";
import {
  useAudio,
  useLobby,
  useMeetingMachine,
  usePeers,
  useRoom,
  useVideo,
  useRecording,
} from "@huddle01/react/hooks";
import axios from "axios";
import { useDisplayName } from "@huddle01/react/app-utils";
import Button from "../../components/Button";
import Router from "next/router";
import TokenGated from "../../components/TokenGated";
import lighthouse from "@lighthouse-web3/sdk";
import FileListButton from "../../components/lighthouse/FileListButton";
import { useToast } from "@chakra-ui/react";

const App = () => {
  // refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const toast = useToast();
  const { state, send } = useMeetingMachine();

  const [roomId, setRoomId] = useState("");
  const [displayNameText, setDisplayNameText] = useState("Guest");
  const [projectId, setProjectId] = useState( process.env.NEXT_PUBLIC_PROJECT_ID || "");
  const [accessToken, setAccessToken] = useState("");
  // accessToken is used for creating token-gated rooms

  const { initialize } = useHuddle01();
  const { joinLobby } = useLobby();
  const {
    fetchAudioStream,
    produceAudio,
    stopAudioStream,
    stopProducingAudio,
    stream: micStream,
  } = useAudio();
  const {
    fetchVideoStream,
    produceVideo,
    stopVideoStream,
    stopProducingVideo,
    stream: camStream,
  } = useVideo();
  const { joinRoom, leaveRoom } = useRoom();

  // Event Listner
  useEventListener("lobby:cam-on", () => {
    if (camStream && videoRef.current) videoRef.current.srcObject = camStream;
  });

  const { peers } = usePeers();

  const {
    startRecording,
    stopRecording,
    error,
    data: recordingData,
  } = useRecording();

  const { setDisplayName, error: displayNameError } = useDisplayName();

  useEventListener("room:joined", () => {
    console.log("room:joined");
  });
  useEventListener("lobby:joined", () => {
    console.log("lobby:joined");
  });

  const createiframe = async () => {
    try {
      const response = await axios.post(
        "https://iriko.testing.huddle01.com/api/v1/create-iframe-room",
        {
          title: "Huddle01-Test",
          roomLocked: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );
      console.log(response.data.data);
      toast ({
        title: "Iframe Created",
        description: `RoomId: ${response.data.data.roomId}`,
        status: "success",
        duration: 9000,
        isClosable: true,
        });
      const roomId = response.data.data.roomId;
      console.log(roomId);
      Router.push(`/room/${roomId}`);
    } catch (error) {
      throw error;
    }
  };

  const createRoom = async () => {
    try {
      const { data } = await axios.post(
        "https://iriko.testing.huddle01.com/api/v1/create-room",
        {
          title: "Huddle01-Test",
          roomLock: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_HUDDLE_API_KEY,
          },
        }
      );

      return data;
    } catch (error) {
      throw error;
    }
  };
  const handleCreateRoom = async () => {
    try {
      const response = await createRoom();
      toast ({
        title: "Room Created",
        description: `RoomId: ${response.data.roomId}`,
        status: "success",
        duration: 9000,
        isClosable: true,
       });
      setRoomId(response.data.roomId);
    } catch (error) {
      // Handle errors here
      console.error(error);
    }
  };

  useEffect(() => {
    initialize(projectId || "");
  }, []);

  return (
    <>
      <div className="grid grid-cols-2">
        <div>
          <h1 className="text-2xl font-bold text-center">Dashboard</h1>
          <Box className="p-4 bg-blue-400 rounded-lg">
            <h2 className="text-2xl">My Id</h2>
            <div className="break-words bg-gray-200 p-4 rounded-lg">
              <pre className="text-sm">
                <code className="text-gray-800">
                  {JSON.stringify(state.context.peerId, null, 2)}
                </code>
              </pre>
            </div>
            <h2 className="text-2xl font-bold">DisplayName</h2>
            <div className="break-words bg-gray-200 p-4 rounded-lg">
              <pre className="text-sm">
                <code className="text-gray-800">
                  {JSON.stringify(state.context.displayName, null, 2)}
                </code>
              </pre>
            </div>

            <h2 className="text-2xl font-bold">Recording Data</h2>
            <div className="break-words bg-gray-200 p-4 rounded-lg">
              <pre className="text-sm">
                <code className="text-gray-800">
                  {JSON.stringify(recordingData, null, 2)}
                </code>
              </pre>
            </div>

            <h2 className="text-2xl font-bold">Error</h2>
            <div className="break-words bg-red-100 p-4 rounded-lg">
              <pre className="text-sm">
                <code className="text-red-500">
                  {JSON.stringify(state.context.error, null, 2)}
                </code>
              </pre>
            </div>

            <h2 className="text-2xl font-bold">Peers</h2>
            <div className="break-words bg-gray-200 p-4 rounded-lg">
              <pre className="text-sm">
                <code className="text-gray-800">
                  {JSON.stringify(peers, null, 2)}
                </code>
              </pre>
            </div>

            <h2 className="text-2xl font-bold">Consumers</h2>
            <div className="break-words bg-gray-200 p-4 rounded-lg">
              <pre className="text-sm">
                <code className="text-gray-800">
                  {JSON.stringify(state.context.consumers, null, 2)}
                </code>
              </pre>
            </div>
          </Box>
          {/* room state */}
          <Box className="p-4 bg-gray-100 rounded-lg my-4">
            <h2 className="text-2xl font-bold text-black">Room State</h2>
            <div className="flex gap-4 my-4">
              <Button onClick={handleCreateRoom} className="p-2 text-sm">
                Create Room
              </Button>

              <Button onClick={createiframe} className="p-2 text-sm">
                Create Iframe
              </Button>
            </div>
            {/* <div className="break-words bg-gray-200 p-4 rounded-lg">
              <pre className="text-sm">
                <code className="text-gray-800">         
                <h3 className="break-words">{JSON.stringify(state.value)}</h3>
                </code>
              </pre>
            </div> */}

            <h2 className="text-3xl text-red-500 font-extrabold mt-4">
              Initialized
            </h2>
            <div className="flex gap-2 my-4">
              <input
                type="text"
                placeholder="Your Room Id"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="border-2 border-gray-300 h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
              />

              <input
                type="text"
                placeholder="Your Access Token (Token gated rooms only)"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="border-2 border-gray-300 h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
              />

              <Button
                disabled={!joinLobby.isCallable}
                onClick={() => {
                  if (accessToken) joinLobby(roomId, accessToken);
                  else joinLobby(roomId);
                }}
                className="p-2 text-sm"
              >
                JOIN_LOBBY
              </Button>
            </div>
          </Box>
          <br />
          <Box className="p-4 bg-gray-200 rounded-lg">
            <h2 className="text-3xl text-yellow-500 font-extrabold">
              Lobby Controls
            </h2>
            <div className="flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="Your Room Id"
                value={displayNameText}
                onChange={(e) => setDisplayNameText(e.target.value)}
                className="border-2 border-gray-300 h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none mr-2"
              />

              <Button
                disabled={!setDisplayName.isCallable}
                onClick={() => {
                  setDisplayName(displayNameText);
                }}
                className="p-2 text-sm"
              >
                SET_DISPLAY_NAME
              </Button>

              <Button
                disabled={!fetchVideoStream.isCallable}
                onClick={fetchVideoStream}
                className="p-2 text-sm"
              >
                FETCH_VIDEO_STREAM
              </Button>

              <Button
                disabled={!fetchAudioStream.isCallable}
                onClick={fetchAudioStream}
                className="p-2 text-sm"
              >
                FETCH_AUDIO_STREAM
              </Button>

              <Button
                disabled={!joinRoom.isCallable}
                onClick={joinRoom}
                className="p-2 text-sm"
              >
                JOIN_ROOM
              </Button>

              <Button
                disabled={!state.matches("Initialized.JoinedLobby")}
                onClick={() => send("LEAVE_LOBBY")}
                className="p-2 text-sm"
              >
                LEAVE_LOBBY
              </Button>

              <Button
                disabled={!stopVideoStream.isCallable}
                onClick={stopVideoStream}
                className="p-2 text-sm"
              >
                STOP_VIDEO_STREAM
              </Button>

              <Button
                disabled={!stopAudioStream.isCallable}
                onClick={stopAudioStream}
                className="p-2 text-sm"
              >
                STOP_AUDIO_STREAM
              </Button>
            </div>
          </Box>
          <br />
          <Box className="p-4 bg-gray-200 rounded-lg">
            <h2 className="text-3xl text-green-600 font-extrabold">
              Room Controls
            </h2>
            <div className="flex gap-4 flex-wrap">
              <Button
                disabled={!produceAudio.isCallable}
                onClick={() => produceAudio(micStream)}
              >
                PRODUCE_MIC
              </Button>

              <Button
                disabled={!produceVideo.isCallable}
                onClick={() => produceVideo(camStream)}
              >
                PRODUCE_CAM
              </Button>

              <Button
                disabled={!stopProducingAudio.isCallable}
                onClick={() => stopProducingAudio()}
              >
                STOP_PRODUCING_MIC
              </Button>

              <Button
                disabled={!stopProducingVideo.isCallable}
                onClick={() => stopProducingVideo()}
              >
                STOP_PRODUCING_CAM
              </Button>

              <Button
                disabled={!startRecording.isCallable}
                onClick={() =>
                  startRecording(`https://researchdao-gilt.vercel.app/rec/room/${roomId}`)
                }
              >
                {`START_RECORDING error: ${error}`}
              </Button>
              <Button
                disabled={!stopRecording.isCallable}
                onClick={stopRecording}
              >
                STOP_RECORDING
              </Button>

              <Button disabled={!leaveRoom.isCallable} onClick={leaveRoom}>
                LEAVE_ROOM
              </Button>
            </div>
          </Box>
        </div>
        <div className="my-12 mx-12">
          <video ref={videoRef} autoPlay muted></video>
          <br />
          <div className="grid grid-cols-4">
            {Object.values(peers)
              .filter((peer) => peer.cam)
              .map((peer) => (
                <>
                  role: {peer.role} <br />
                  <Video
                    key={peer.peerId}
                    peerId={peer.peerId}
                    track={peer.cam}
                    debug
                  />
                </>
              ))}
            {Object.values(peers)
              .filter((peer) => peer.mic)
              .map((peer) => (
                <Audio
                  key={peer.peerId}
                  peerId={peer.peerId}
                  track={peer.mic}
                />
              ))}
          </div>
          <br />
          <TokenGated  />
          <br/>
          <Box bg={useColorModeValue('gray.100', 'gray.900')} p={8}>
                <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                <Flex alignItems={'center'}>
                    <Stack direction={'row'} spacing={7}>
                    <FileListButton />
                    </Stack>
                </Flex>
                </Flex>
           </Box>
        </div>
      </div>
    </>
  );
};

export default App;
