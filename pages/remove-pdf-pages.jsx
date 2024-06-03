import Head from 'next/head';
import React, { useState } from 'react';

const RemovePdfPage = () => {

    const [files, setFiles] = useState([]);
    const [uid, setUid] = useState("");
    const [loading, setLoading] = useState(false);


    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };


    const handleDownload = async () => {
        const response = await fetch(`/api/download?uid=${uid}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${uid}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            console.log("Download failed");
        }
    };


    // File upload
    const handleFileUpload = async (e) => {
        e.preventDefault();
        const pages = e.target.pages.value
        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append("files", file);
        })
        formData.append("pages", pages);

        try {
            setLoading(true)

            const response = await fetch("/api/remove-pdf-pages", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setUid(data?.uid)
            setLoading(false)

        } catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Head>
                <title>Remove PDF Pages</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div style={{ display: 'flex', justifyContent: "center" }}>


                <div style={{ border: "1px solid gray", padding: "10px 40px" }}>
                    <h2> Remove Pdf Pages</h2>

                    <form onSubmit={handleFileUpload}>
                        <input
                            type="file"
                            required
                            style={{ marginTop: "50px", border: "1px solid gray", padding: "20px" }}
                            onChange={handleFileChange}
                        />
                        <br />
                        <br />

                        <label htmlFor="pages">Remove Pages</label>
                        <br />
                        <input
                            type="text"
                            required
                            name="pages"
                            id="pages"
                        />
                        <br />
                        <br />

                        <button style={{ padding: "10px 40px" }} type='submit'>
                            {
                                loading ? "Loading" : "Upload"
                            }
                        </button>
                    </form>
                    <br />
                    <br />

                    {
                        uid && <>
                            <input
                                type="text"
                                style={{ width: "350px" }}
                                value={uid}
                                onChange={(e) => setUid(e.target.value)}
                                placeholder="Enter UID"
                            />
                            <button
                                style={{ color: 'green', marginLeft: "10px" }}
                                onClick={handleDownload}>
                                Download
                            </button>
                        </>
                    }

                </div>
            </div>
        </>
    );
};

export default RemovePdfPage;