import type { Project, ProjectStatus } from '@/types/project';

export const statusOrder: ProjectStatus[] = ['active','version_done','planned','paused','completed'];

export const statusMeta: Record<ProjectStatus, { label: string; hint: string }> = {
  active: { label: 'قيد التطوير الآن', hint: 'أعمل عليها حاليًا' },
  version_done: { label: 'نسخة منتهية وبطوّرها', hint: 'V1 جاهزة والتطوير مستمر' },
  planned: { label: 'مخطط له', hint: 'ضمن خارطة الطريق' },
  paused: { label: 'متوقف مؤقتًا', hint: 'مؤجل للعودة لاحقًا' },
  completed: { label: 'مكتمل', hint: 'تم إنجازه' },
};

export const seedProjects: Project[] = [
  {id:'tnabbah',name:'TNABBAH',subtitle:'Smart Vehicle Diagnostics',summary:'منصة تشخيص ذكية للسيارات تربط OBD-II وتعرض البيانات والأعطال والتقارير والصيانة والتنبيهات.',status:'completed',progress:100,priority:'high',stack:['React Native','TypeScript','FastAPI','Supabase','MQTT'],live_url:null,github_url:null,updated_at:new Date().toISOString(),sort_order:10},
  {id:'madad',name:'MADAD',subtitle:'Hajj Field Operations Orchestration',summary:'نظام تشغيلي لإدارة البلاغات والفرق والموارد والتوزيع الميداني داخل المشاعر.',status:'version_done',progress:82,priority:'high',stack:['Next.js','Express','Prisma','PostgreSQL','Realtime'],live_url:null,github_url:null,updated_at:new Date().toISOString(),sort_order:20},
  {id:'inboxa',name:'INBOXA',subtitle:'Career Email Intelligence',summary:'فلترة وتصنيف رسائل التوظيف والفرص المهنية من Gmail مع لوحة متابعة ثنائية اللغة.',status:'version_done',progress:78,priority:'high',stack:['Next.js','PostgreSQL','Google OAuth','Gmail API'],live_url:null,github_url:null,updated_at:new Date().toISOString(),sort_order:30},
  {id:'switchboard',name:'SWITCHBOARD',subtitle:'Visual IT Automation Builder',summary:'منشئ workflows بصري لتنفيذ أتمتة IT حقيقية بعُقد قابلة للربط والتنفيذ.',status:'active',progress:34,priority:'high',stack:['Next.js','TypeScript','Automation','PowerShell'],live_url:null,github_url:null,updated_at:new Date().toISOString(),sort_order:40},
  {id:'nexus',name:'NEXUS',subtitle:'IT Infrastructure & Operations Center',summary:'مختبر مؤسسي للبنية التحتية يجمع Active Directory والمراقبة والأصول والأتمتة.',status:'planned',progress:10,priority:'medium',stack:['Windows Server','Active Directory','PowerShell','Monitoring'],live_url:null,github_url:null,updated_at:new Date().toISOString(),sort_order:50},
  {id:'wasl',name:'WASL',subtitle:'IT Help Desk & Asset Management',summary:'إدارة بلاغات الدعم الفني والأجهزة والمستخدمين والأصول من لوحة تشغيلية موحدة.',status:'paused',progress:45,priority:'medium',stack:['Web','ITSM','Asset Management'],live_url:null,github_url:null,updated_at:new Date().toISOString(),sort_order:60}
];
