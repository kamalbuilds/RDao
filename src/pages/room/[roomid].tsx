import React from "react";
import { useEffect } from "react";
import { HuddleIframe, IframeConfig } from "@huddle01/huddle01-iframe";
import Upload from "../../components/lighthouse/upload";
import { useRouter } from "next/router";
import AccessControl from "../../components/lighthouse/acesscontrol";
import { Box } from "@chakra-ui/react";

export default function Meeting() {
    const router = useRouter();
    const roomIdFromUrl = router.query.roomid?.toString() || "";
    const [roomUrl, setRoomUrl] = React.useState("");

    const iframeConfig: IframeConfig = {
        roomUrl: roomUrl,
        height: "600px",
        width: "100%",
        noBorder: false, // false by default
    };

    useEffect(() => {
        const fetchRoomUrl = async () => {
          // Perform the necessary API call or logic to get the room URL
          const url = "https://iframe.huddle01.com/zfu-djdf-dzs"; // Replace with your actual API call or logic
          setRoomUrl(`https://iframe.huddle01.com/${roomIdFromUrl}`);
        };
    
        fetchRoomUrl();
      }, []);

    return (
        <>
            <p className="fixed flex justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 min-w-fit mr-4">
            Room ID:&nbsp;
            <code className="font-mono font-bold">{roomIdFromUrl}</code>
            </p>
            <div>
            <HuddleIframe config={iframeConfig} />
            <Box className="flex justify-center items-center">
                <Upload />
                <AccessControl />
            </Box>
        </div>
        </>
    );
}
 