'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, Languages, LogOut, Plus, Save, ShieldCheck, Snooze, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { seedProjects, statusOrder } from '@/lib/projects';
import { healthReasonCopy, statusCopy } from '@/lib/i18n';
import { useLocale } from '@/components/LocaleProvider';
import { NotificationPanel } from '@/components/NotificationPanel';
import type { Project, ProjectPrivateNote, ProjectStatus } from '@/types/project';

const OWNER_EMAIL = 'ghalaalhashmi80@gmail.com';
const emptyProject: Project = { id:'', name:'', subtitle:'', summary:'', status:'planned', progress:0, priority:'medium', stack:[], live_url:null, github_url:null, updated_at:new Date().toISOString(), sort_order:100, maintenance_interval_days:45, health_label:'healthy', health_score:100 };

const healthLabels = {
  ar: { healthy:'سليم', watch:'راقبيه', attention:'يحتاج انتباه', maintenance:'صيانة مطلوبة' },
  en: { healthy:'Healthy', watch:'Watch', attention:'Needs attention', maintenance:'Maintenance due' },
};

export default function AdminPage() {
  const { locale, setLocale } = useLocale();
  const ar = locale === 'ar';
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
  async function sendMagicLink(e:FormEvent){e.preventDefault(); if(!supabase)return setMessage('Supabase unavailable'); if(loginEmail.trim().toLowerCase()!==OWNER_EMAIL)return setMessage(ar?'هذا البريد غير مصرح له بالدخول.':'This email is not authorized.'); const redirectTo=`${window.location.origin}/auth/callback?next=/admin`; const {error}=await supabase.auth.signInWithOtp({email:loginEmail,options:{emailRedirectTo:redirectTo}}); setMessage(error?error.message:(ar?'أرسلت لك رابط الدخول على البريد.':'Magic sign-in link sent.'));}
  async function selectProject(project:Project){setSelected(project);setPrivateNote('');if(!supabase||!isOwner)return;const {data,error}=await supabase.from('project_private_notes').select('*').eq('project_id',project.id).maybeSingle();if(error){setMessage(error.message);return;}setPrivateNote((data as ProjectPrivateNote|null)?.note??'');}
  async function saveProject(e:FormEvent){e.preventDefault();if(!supabase||!isOwner)return setMessage(ar?'غير مصرح لك بالتعديل.':'Not authorized.');const id=selected.id.trim()||crypto.randomUUID();const payload={...selected,id,updated_at:new Date().toISOString()};const {error}=await supabase.from('projects').upsert(payload);if(error)return setMessage(error.message);const {error:noteError}=await supabase.from('project_private_notes').upsert({project_id:id,note:privateNote,updated_at:new Date().toISOString()});if(noteError)return setMessage(ar?`تم حفظ المشروع، لكن تعذر حفظ الملاحظة: ${noteError.message}`:`Project saved, but note failed: ${noteError.message}`);setMessage(ar?'تم الحفظ ✅':'Saved ✅');setSelected({...emptyProject,updated_at:new Date().toISOString()});setPrivateNote('');await loadProjects();}
  async function removeProject(id:string){if(!supabase||!isOwner||!confirm(ar?'حذف المشروع؟':'Delete project?'))return;const {error}=await supabase.from('projects').delete().eq('id',id);setMessage(error?error.message:(ar?'تم الحذف.':'Deleted.'));await loadProjects();}
  async function signOut(){if(supabase)await supabase.auth.signOut();setUserEmail(null);}
  async function markReviewed(){if(!supabase||!selected.id)return;const now=new Date().toISOString();const {error}=await supabase.from('projects').update({last_reviewed_at:now,reminder_snoozed_until:null}).eq('id',selected.id);setMessage(error?error.message:(ar?'تم تسجيل المراجعة ✅':'Review recorded ✅'));await loadProjects();setSelected({...selected,last_reviewed_at:now,reminder_snoozed_until:null});}
  async function snoozeSevenDays(){if(!supabase||!selected.id)return;const until=new Date(Date.now()+7*86400000).toISOString();const {error}=await supabase.from('projects').update({reminder_snoozed_until:until}).eq('id',selected.id);setMessage(error?error.message:(ar?'تم تأجيل تذكيرات المشروع 7 أيام.':'Project reminders snoozed for 7 days.'));setSelected({...selected,reminder_snoozed_until:until});}

  const counts = useMemo(() => ({
    maintenance: projects.filter(p=>p.health_label==='maintenance').length,
    attention: projects.filter(p=>p.health_label==='attention').length,
    watch: projects.filter(p=>p.health_label==='watch').length,
    healthy: projects.filter(p=>!p.health_label||p.health_label==='healthy').length,
  }), [projects]);

  if(!userEmail)return <main className="admin-shell compact"><div className="top-inline"><Link href="/" className="back"><ArrowRight size={16}/>{ar?'العودة للموقع':'Back to site'}</Link><button className="locale-toggle" onClick={()=>setLocale(ar?'en':'ar')}><Languages size={15}/>{ar?'English':'العربية'}</button></div><section className="login-card"><p className="eyebrow">OWNER ONLY</p><h1>{ar?'لوحة التحكم':'Owner Console'}</h1><p>{ar?'الدخول محصور ببريد المالكة، والصلاحيات محمية أيضًا بسياسات RLS داخل قاعدة البيانات.':'Access is restricted to the owner email and enforced by database RLS policies.'}</p><form onSubmit={sendMagicLink}><input type="email" required placeholder="your@email.com" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}/><button>{ar?'إرسال رابط الدخول':'Send sign-in link'}</button></form>{message&&<p className="notice">{message}</p>}</section></main>;

  if(!isOwner)return <main className="admin-shell compact"><Link href="/" className="back"><ArrowRight size={16}/>{ar?'العودة للموقع':'Back to site'}</Link><section className="login-card"><p className="eyebrow">ACCESS DENIED</p><h1>{ar?'غير مصرح':'Access denied'}</h1><p>{ar?'الحساب الحالي لا يملك صلاحية إدارة المشاريع.':'This account cannot manage projects.'}</p><button onClick={signOut}><LogOut size={15}/>{ar?'تسجيل الخروج':'Sign out'}</button></section></main>;

  const currentHealth = selected.health_label ?? 'healthy';

  return <main className="admin-shell">
    <header className="admin-top"><div><p className="eyebrow">PRIVATE PROJECT OPERATING SYSTEM</p><h1>{ar?'مركز قيادة المشاريع':'Project Command Center'}</h1><p>{userEmail}</p></div><div className="admin-actions"><button className="locale-toggle" onClick={()=>setLocale(ar?'en':'ar')}><Languages size={15}/>{ar?'English':'العربية'}</button><Link href="/">{ar?'عرض الموقع':'Public view'}</Link><button onClick={signOut}><LogOut size={15}/>{ar?'خروج':'Sign out'}</button></div></header>
    {message&&<p className="notice">{message}</p>}

    <section className="health-dashboard">
      <div className="section-heading"><div className="icon-box"><Activity size={18}/></div><div><p className="eyebrow">OWNER INTELLIGENCE</p><h2>{ar?'صحة المشاريع':'Project Health'}</h2></div></div>
      <div className="health-stats"><div className="health-stat maintenance"><b>{counts.maintenance}</b><span>{healthLabels[locale].maintenance}</span></div><div className="health-stat attention"><b>{counts.attention}</b><span>{healthLabels[locale].attention}</span></div><div className="health-stat watch"><b>{counts.watch}</b><span>{healthLabels[locale].watch}</span></div><div className="health-stat healthy"><b>{counts.healthy}</b><span>{healthLabels[locale].healthy}</span></div></div>
    </section>

    <NotificationPanel/>

    <div className="admin-grid"><aside className="project-list"><button className="new-btn" onClick={()=>{setSelected({...emptyProject,updated_at:new Date().toISOString()});setPrivateNote('')}}><Plus size={16}/>{ar?'مشروع جديد':'New project'}</button>{projects.map(p=><button key={p.id} className="project-row" onClick={()=>void selectProject(p)}><div className="project-row-title"><b>{p.name}</b><i className={`health-dot ${p.health_label??'healthy'}`}/></div><span>{statusCopy(locale,p.status).label}</span></button>)}</aside>
      <form className="editor" onSubmit={saveProject}>
        {selected.id&&<section className={`health-card health-${currentHealth}`}><div><p className="eyebrow">PROJECT HEALTH · {selected.health_score??100}/100</p><h3>{healthLabels[locale][currentHealth]}</h3><p>{healthReasonCopy(locale,selected.health_reason) || (ar?'ما فيه ملاحظات حرجة حاليًا.':'No critical health findings right now.')}</p></div><div className="health-actions"><button type="button" className="secondary-button" onClick={markReviewed}><ShieldCheck size={15}/>{ar?'راجعت المشروع':'Mark reviewed'}</button><button type="button" className="secondary-button" onClick={snoozeSevenDays}><Snooze size={15}/>{ar?'أجّل 7 أيام':'Snooze 7 days'}</button></div></section>}
        <div className="form-grid"><label>{ar?'الاسم':'Name'}<input required value={selected.name} onChange={e=>setSelected({...selected,name:e.target.value})}/></label><label>{ar?'العنوان المختصر':'Subtitle'}<input value={selected.subtitle} onChange={e=>setSelected({...selected,subtitle:e.target.value})}/></label><label>{ar?'الحالة':'Status'}<select value={selected.status} onChange={e=>setSelected({...selected,status:e.target.value as ProjectStatus})}>{statusOrder.map(v=><option key={v} value={v}>{statusCopy(locale,v).label}</option>)}</select></label><label>{ar?'التقدم %':'Progress %'}<input type="number" min="0" max="100" value={selected.progress} onChange={e=>setSelected({...selected,progress:Number(e.target.value)})}/></label><label>{ar?'الأولوية':'Priority'}<select value={selected.priority} onChange={e=>setSelected({...selected,priority:e.target.value as Project['priority']})}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label>{ar?'الترتيب':'Sort order'}<input type="number" value={selected.sort_order} onChange={e=>setSelected({...selected,sort_order:Number(e.target.value)})}/></label><label>{ar?'دورة الصيانة بالأيام':'Maintenance cycle (days)'}<input type="number" min="7" max="365" value={selected.maintenance_interval_days??45} onChange={e=>setSelected({...selected,maintenance_interval_days:Number(e.target.value)})}/></label><label>{ar?'Issues المفتوحة':'Open issues'}<input readOnly value={selected.github_open_issues??0}/></label></div>
        <label>{ar?'الوصف':'Description'}<textarea rows={4} value={selected.summary} onChange={e=>setSelected({...selected,summary:e.target.value})}/></label><label>{ar?'التقنيات — افصلي بفاصلة':'Tech stack — comma separated'}<input value={selected.stack.join(', ')} onChange={e=>setSelected({...selected,stack:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)})}/></label><div className="form-grid"><label>Live URL<input value={selected.live_url??''} onChange={e=>setSelected({...selected,live_url:e.target.value||null})}/></label><label>GitHub URL<input value={selected.github_url??''} onChange={e=>setSelected({...selected,github_url:e.target.value||null})}/></label></div><label className="private-field">{ar?'ملاحظات خاصة — لا تظهر للعامة':'Private notes — never public'}<textarea rows={4} value={privateNote} onChange={e=>setPrivateNote(e.target.value)}/></label><div className="editor-actions"><button className="save"><Save size={16}/>{ar?'حفظ':'Save'}</button>{selected.id&&<button type="button" className="danger" onClick={()=>void removeProject(selected.id)}><Trash2 size={16}/>{ar?'حذف':'Delete'}</button>}</div>
      </form></div>
  </main>;
}
