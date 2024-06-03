import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div style={{display:"flex", justifyContent:"center"}}>
          MOM PDF API
        </div>
      </main>
    </>
  );
}
