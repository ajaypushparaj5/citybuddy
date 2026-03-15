import { useEffect, useState } from "react"
import { Search } from "lucide-react"

export default function CommandPalette({ open, setOpen, actions }) {

const [query,setQuery] = useState("")

useEffect(() => {

const handler = (e) => {

if((e.metaKey || e.ctrlKey) && e.key === "q"){
e.preventDefault()
setOpen(prev => !prev)
}

if(e.key === "Escape"){
setOpen(false)
}

}

window.addEventListener("keydown",handler)

return () => window.removeEventListener("keydown",handler)

},[])

if(!open) return null

const filtered = actions.filter(a =>
a.name.toLowerCase().includes(query.toLowerCase())
)

return (

<div className="fixed inset-0 z-50 flex items-start justify-center pt-40 bg-black/40 backdrop-blur">

<div className="w-[520px] bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

{/* search */}

<div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">

<Search size={18} className="text-white/40"/>

<input
autoFocus
value={query}
onChange={e=>setQuery(e.target.value)}
placeholder="Type a command..."
className="flex-1 bg-transparent outline-none text-white placeholder:text-white/40"
/>

</div>

{/* results */}

<div className="max-h-[320px] overflow-y-auto">

{filtered.map((action,i)=>(

<button
key={i}
onClick={()=>{
action.run()
setOpen(false)
setQuery("")
}}
className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition"
>

{action.icon}

<span>{action.name}</span>

</button>

))}

</div>

</div>

</div>

)

}