"use client"
import { useState } from "react"
export default function AreaForm() {
    const [letter, setLetter] = useState('')
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        try{
            const response = fetch('/api/areas', {
                method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: letter
        }),

        })
        if(!response){
            throw new Error('Failed to add area')
        }
        setLetter('')
        }catch(error){
            console.error(error)
        }
    }
  return (
    <div className="bg-white p-4 rounded-2xl text-black">
        <h2 className="text-2xl font-bold">Area Form</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col"><span>Area's Letter</span><input value={letter} onChange={(e) => setLetter(e.target.value)} type="text" className="border rounded p-2" /></label>
            <button type="submit" className="border p-2 rounded-lg">add</button>
        </form>
    </div>
  )
}
