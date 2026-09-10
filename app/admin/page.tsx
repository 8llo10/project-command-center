'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LogOut, Plus, Save, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { seedProjects, statusMeta } from '@/lib/projects';
import type { Project, ProjectPrivateNote, ProjectStatus } from '@/types/project';

const OWNER_EMAIL = 'ghalaalhashmi80@gmail.com';
const emptyProject: Project = { id:'', name:'', subtitle:'', summary:'', status:'planned', progress:0, priority:'medium', stack:[], live_url:null, github_url:null, updated_at:new Date().toISOString(), sort_order:100 };

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [selected, setSelected] = useState<Project>(emptyProject);
  const [privateNote, setPrivateNote] = useState('');

  const isOwner = userEmail?.toLowerCase() === OWNER_EMAIL;

  useEffect(() => { if (!supabase) return; supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null)); }, [supabase]);
  useEffect(() => { if (!supabase || !isOwner) return; void loadProjects(); }, [supabase, isOwner]);

  async function loadProjects(){ if(!supabase)return; const {data,error}=await supabase.from('projects').select('*').order('sort_order'); if(error){setMessage(error.message);return;} setProjects((data??[]) as Project[]); }
  async function sendMagicLink(e:FormEvent){e.preventDefault(); if(!supabase)return setMessage('أضيفي متغيرات Supabase أولًا.'); if(loginEmail.trim().toLowerCase()!==OWNER_EMAIL)return setMessage('هذا البريد غير مصرح له بالدخول.'); const redirectTo=`${window.location.origin}/auth/callback?next=/admin`; const {error}=await supabase.auth.signInWithOtp({email:loginEmail,options:{emailRedirectTo:redirectTo}}); setMessage(error?error.message:'أرسلت لك رابط الدخول على البريد.');}
  async function selectProject(project:Project){setSelected(project);setPrivateNote('');if(!supabase||!isOwner)return;const {data,error}=await supabase.from('project_private_notes').select('*').eq('project_id',project.id).maybeSingle();if(error){setMessage(error.message);return;}setPrivateNote((data as ProjectPrivateNote|null)?.note??'');}
  async function saveProject(e:FormEvent){e.preventDefault();if(!supabase||!isOwner)return setMessage('غير مصرح لك بالتعديل.');const id=selected.id.trim()||crypto.randomUUID();const payload={...selected,id,updated_at:new Date().toISOString()};const {error}=await supabase.from('projects').upsert(payload);if(error)return setMessage(error.message);const {error:noteError}=await supabase.from('project_private_notes').upsert({project_id:id,note:privateNote,updated_at:new Date().toISOString()});if(noteError)return setMessage(`تم حفظ المشروع، لكن تعذر حفظ الملاحظة الخاصة: ${noteError.message}`);setMessage('تم الحفظ.');setSelected(emptyProject);setPrivateNote('');await loadProjects();}
  async function removeProject(id:string){if(!supabase||!isOwner||!confirm('حذف المشروع؟'))return;const {error}=await supabase.from('projects').delete().eq('id',id);setMessage(error?error.message:'تم الحذف.');await loadProjects();}
  async function signOut(){if(supabase)await supabase.auth.signOut();setUserEmail(null);}

  if(!userEmail)return <main className="admin-shell compact"><Link href="/" className="back"><ArrowRight size={16}/> العودة للموقع</Link><section className="login-card"><p className="eyebrow">OWNER ONLY</p><h1>لوحة التحكم</h1><p>الدخول محصور ببريد المالكة فقط، والتحكم محمي أيضًا بسياسات RLS داخل قاعدة البيانات.</p><form onSubmit={sendMagicLink}><input type="email" required placeholder="your@email.com" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}/><button>إرسال رابط الدخول</button></form>{message&&<p className="notice">{message}</p>}</section></main>;

  if(!isOwner)return <main className="admin-shell compact"><Link href="/" className="back"><ArrowRight size={16}/> العودة للموقع</Link><section className="login-card"><p className="eyebrow">ACCESS DENIED</p><h1>غير مصرح</h1><p>الحساب الحالي لا يملك صلاحية إدارة المشاريع.</p><button onClick={signOut}><LogOut size={15}/> تسجيل الخروج</button></section></main>;

  return <main className="admin-shell"><header className="admin-top"><div><p className="eyebrow">PRIVATE CONTROL PANEL</p><h1>إدارة المشاريع</h1><p>{userEmail}</p></div><div className="admin-actions"><Link href="/">عرض الموقع</Link><button onClick={signOut}><LogOut size={15}/> خروج</button></div></header>{message&&<p className="notice">{message}</p>}<div className="admin-grid"><aside className="project-list"><button className="new-btn" onClick={()=>{setSelected({...emptyProject,updated_at:new Date().toISOString()});setPrivateNote('')}}><Plus size={16}/> مشروع جديد</button>{projects.map(p=><button key={p.id} className="project-row" onClick={()=>void selectProject(p)}><b>{p.name}</b><span>{statusMeta[p.status].label}</span></button>)}</aside><form className="editor" onSubmit={saveProject}><div className="form-grid"><label>الاسم<input required value={selected.name} onChange={e=>setSelected({...selected,name:e.target.value})}/></label><label>العنوان المختصر<input value={selected.subtitle} onChange={e=>setSelected({...selected,subtitle:e.target.value})}/></label><label>الحالة<select value={selected.status} onChange={e=>setSelected({...selected,status:e.target.value as ProjectStatus})}>{Object.entries(statusMeta).map(([v,m])=><option key={v} value={v}>{m.label}</option>)}</select></label><label>التقدم %<input type="number" min="0" max="100" value={selected.progress} onChange={e=>setSelected({...selected,progress:Number(e.target.value)})}/></label><label>الأولوية<select value={selected.priority} onChange={e=>setSelected({...selected,priority:e.target.value as Project['priority']})}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label>الترتيب<input type="number" value={selected.sort_order} onChange={e=>setSelected({...selected,sort_order:Number(e.target.value)})}/></label></div><label>الوصف<textarea rows={4} value={selected.summary} onChange={e=>setSelected({...selected,summary:e.target.value})}/></label><label>التقنيات — افصلي بفاصلة<input value={selected.stack.join(', ')} onChange={e=>setSelected({...selected,stack:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)})}/></label><div className="form-grid"><label>Live URL<input value={selected.live_url??''} onChange={e=>setSelected({...selected,live_url:e.target.value||null})}/></label><label>GitHub URL<input value={selected.github_url??''} onChange={e=>setSelected({...selected,github_url:e.target.value||null})}/></label></div><label className="private-field">ملاحظات خاصة — لا تظهر للعامة<textarea rows={4} value={privateNote} onChange={e=>setPrivateNote(e.target.value)}/></label><div className="editor-actions"><button className="save"><Save size={16}/> حفظ</button>{selected.id&&<button type="button" className="danger" onClick={()=>void removeProject(selected.id)}><Trash2 size={16}/> حذف</button>}</div></form></div></main>;
}
