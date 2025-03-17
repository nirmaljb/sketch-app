"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function Home() {
  const [slug, setSlug] = useState("");
  const router = useRouter();
  
  const submitHandler = (e: any) => {
    e.preventDefault();
    console.log(slug);
    router.push(`/room/${slug}`);
  }

  return (
    <div>
      <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <button onClick={submitHandler}>Join</button>
    </div>
  );
}
