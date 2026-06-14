// ════════════════════════════════════════════════════════
// REPO SYSTEMS — edit this file to add / remove repos
// ════════════════════════════════════════════════════════

const LANG = {
  laravel:{ label:'Laravel',    color:'#FF2D20' },
  vue:    { label:'Vue.js',     color:'#42B883' },
  angular:{ label:'Angular',    color:'#f218ca' },
  php:    { label:'PHP',        color:'#777BB3' },
  ts:     { label:'TypeScript', color:'#3178C6' },
  md:     { label:'Markdown',   color:'#D4A017' },
  js:     { label:'JavaScript', color:'#F7DF1E' },
};

const REPO_SYS = [
  // ── Core ──
  { name:'Jiraiya',       langs:['md'],             note:'AI Memory Core',  active:true, path:'/Applications/Sites/jiraiya' },

  // ── Registered projects ──
  { name:'Nilam',         langs:['laravel'],         note:'Laravel',                      path:'/Applications/Sites/nilam' },
  { name:'MyStudent',     langs:['vue'],             note:'Vue SPA',                      path:'/Applications/Sites/mystudentvue' },
  { name:'MyAlumniCard',  langs:['angular'],         note:'Angular',                      path:'/Applications/Sites/myalumni-angular' },
  { name:'Masmed2u',      langs:['laravel'],         note:'API Backend',                  path:'/Applications/Sites/apps-back-end' },
  { name:'Mobiliti UG',   langs:['laravel'],         note:'Laravel',                      path:'/Applications/Sites/mobilitiug' },

  // ── Other systems ──
  { name:'Credit',        langs:['laravel','vue'],   note:'Laravel + Vite',               path:'/Applications/Sites/credit' },
  { name:'Frontend Aduan',langs:['laravel'],         note:'Laravel',                      path:'/Applications/Sites/frontend-aduan' },
  { name:'My HEP',        langs:['laravel','vue'],   note:'Laravel + Vite',               path:'/Applications/Sites/hepweb' },
  { name:'iCan2u',        langs:['laravel'],         note:'Laravel',                      path:'/Applications/Sites/ican2u' },
  { name:'Lara1',         langs:['laravel'],         note:'Laravel',                      path:'/Applications/Sites/lara1' },
  { name:'Result EJPP',   langs:['vue'],             note:'Vue SPA',                      path:'/Applications/Sites/result-ejpp' },
  { name:'Weightloss',    langs:['vue'],             note:'Vue SPA',                      path:'/Applications/Sites/weightloss' },
];
