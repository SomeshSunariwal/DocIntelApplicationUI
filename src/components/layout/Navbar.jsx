import React from 'react';import{Bell,ChevronDown,Command,FileText,Home,Search,BarChart3,Settings,Sun,Moon}from'lucide-react';
export default function Navbar({dark,setDark}){return <header className="nav flex h-[66px] shrink-0 items-center border-b border-slate-200 bg-white px-7 shadow-[0_1px_8px_rgba(30,64,175,.04)] dark:border-slate-800 dark:bg-[#0e1728]"><div className="flex w-[330px] items-center gap-3"><div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-sky-400 via-blue-600 to-violet-500"><div className="absolute left-2 top-2 h-6 w-4 rounded-l-md bg-white/90"/></div><div><div className="text-[20px] font-extrabold tracking-tight">DocMind</div><div className="text-[12px] text-slate-500">Your knowledge, instantly.</div></div></div><nav className="flex flex-1 items-center gap-1"><Nav active icon={Home} label="Dashboard"/><Nav icon={FileText} label="Documents"/><Nav icon={Search} label="Search"/><Nav icon={BarChart3} label="Analytics"/><Nav icon={Settings} label="Settings"/></nav><div className="flex items-center gap-3"><div className="hidden h-9 w-[205px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 xl:flex dark:border-slate-700 dark:bg-slate-900"><Search size={16}/><span>Search anything...</span><span className="ml-auto rounded border px-1.5 py-0.5 text-[10px]"><Command size={10} className="inline"/> K</span></div><button className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Bell size={20}/><i className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"/></button><button onClick={()=>setDark(v=>!v)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button><div className="relative flex items-center gap-2">
<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-400 text-xs font-bold">RK</div>
<div><div className="text-[13px] font-semibold">Rahul Kumar</div><div className="text-[11px] text-slate-500">Free Plan</div></div>
<ProfileMenu/>
</div></div></header>}
function Nav({icon:Icon,label,active}){return <button className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium ${active?'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300':'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Icon size={18}/>{label}</button>}

function ProfileMenu(){
  const [open,setOpen]=React.useState(false);
  return <div className="relative">
    <button type="button" onClick={()=>setOpen(v=>!v)} className="rounded-md p-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Open profile menu" aria-expanded={open}>
      <ChevronDown size={16}/>
    </button>
    {open && <div className="profile-dropdown">
      <button type="button" className="profile-dropdown-item">Edit Profile</button>
      <div className="profile-dropdown-divider"/>
      <button type="button" className="profile-dropdown-item profile-dropdown-logout" onClick={()=>{setOpen(false);window.dispatchEvent(new Event('docmind:logout'));}}>Logout</button>
    </div>}
  </div>}
