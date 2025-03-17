import ChatRoom from "../../../components/ChatRoom";
import { BACKEND_URL } from "../../config";
import axios from "axios";

async function getRoomId(slug: string) {
    const response = await axios.get(`${BACKEND_URL}/roomid/${slug}`)
    return response.data.roomid;
}

export default async function Home({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const roomid = await getRoomId(slug);

    return <ChatRoom id={roomid} />
}